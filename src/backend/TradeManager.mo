import Result            "mo:base/Result";
import Int               "mo:base/Int";
import Time              "mo:base/Time";
import Nat64             "mo:base/Nat64";
import Debug             "mo:base/Debug";

import ICRC7             "mo:icrc7-mo";

import BIP721Ledger      "canister:bip721_ledger";
import BQCLedger         "canister:bqc_ledger";

module {

  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type Time                = Int;

  type Account             = ICRC7.Account;

  type Royalties = {
    percentage: Nat;
    receiver: Principal;
  };

  type TransferArgs = {
    buyer: Account;
    seller: Account;
    token_id: Nat;
    e8s_price: Nat;
  };

  type TradeArgs = TransferArgs and {
    royalties: ?Royalties;
  };

  public class TradeManager({
    stage_account: Account;
    fee: Nat;
  }) {

    public func tradeIntProp(args: TradeArgs) : async* Result<(), Text> {

      switch(await* stageTransfer(args)){
        case(#err(err)){ return #err(err); };
        case(#ok){};
      };

      await* executeTransfer(args);

      #ok;
    };

    func stageTransfer(args: TransferArgs) : async* Result<(), Text> {

      let { buyer: Account; seller: Account; token_id: Nat; e8s_price: Nat; } = args;

      // Transfer ICPs to the stage account
      let icp_transfer = await BQCLedger.icrc2_transfer_from({
        from = buyer;
        spender_subaccount = null;
        to = stage_account;
        amount = e8s_price;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      });

      switch(icp_transfer){
        case(#Err(err)){ return #err("Transfer of ICP failed: " # debug_show(err)); };
        case(#Ok(_)){};
      };

      // Transfer the intellectual property to the stage account
      let ip_transfer = extractSingleTransfer(await BIP721Ledger.icrc37_transfer_from([{
        spender_subaccount = null;
        from = seller;
        to = stage_account;
        token_id;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      }]));

      switch(ip_transfer){
        case(#err(err)){ 
          
          // Reimburse the buyer if the transfer of the intellectual property failed
          let icp_reimbursement = await BQCLedger.icrc1_transfer({
            from_subaccount = stage_account.subaccount;
            to = buyer;
            amount = e8s_price - fee;
            fee = null;
            memo = null;
            created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
          });

          // Log the reimbursement error if it failed
          switch(icp_reimbursement){
            case(#Err(err)){ Debug.print("Reimbursement of ICP failed: " # debug_show(err)); };
            case(#Ok(_)){};
          };

          return #err(err); 
        };
        case(#ok){ #ok; };
      };
    };

    func executeTransfer(args: TradeArgs) : async* () {

      let { buyer: Account; seller: Account; token_id: Nat; e8s_price: Nat; royalties: ?Royalties; } = args;

      // Transfer the intellectual property to the buyer
      let ip_transfer = extractSingleTransfer(await BIP721Ledger.icrc7_transfer([{
        from_subaccount = stage_account.subaccount;
        to = buyer;
        token_id;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      }]));
      
      switch((ip_transfer)){
        case(#err(err)){ Debug.print("Transfer of IP failed: " # debug_show(err)); };
        case(#ok(_)){};
      };

      var seller_amount = e8s_price;

      switch(royalties){
        case(null){};
        case(?{ percentage; receiver }){

          if (receiver != seller.owner){
            // Calculate the royalties
            let royalties_amount = (seller_amount * percentage) / 100;

            // Transfer ICPs to the receiver of the royalties
            // TODO: One should find a way to set the subaccount of the receiver
            let royalties_transfer = await BQCLedger.icrc1_transfer({
              from_subaccount = stage_account.subaccount;
              to = { owner = receiver; subaccount = null; };
              amount = royalties_amount - fee;
              fee = null;
              memo = null;
              created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
            });

            switch(royalties_transfer){
              case(#Err(err)){ Debug.print("Transfer of royalties failed: " # debug_show(err)); };
              case(#Ok(_)){};
            };

            // Do not forget to subtract the royalties from the amount to be transferred to the seller
            seller_amount -= royalties_amount;
          };
        };
      };

      // Transfer the ICPs to the seller
      let icp_transfer = await BQCLedger.icrc1_transfer({
        from_subaccount = stage_account.subaccount;
        to = seller;
        amount = seller_amount - fee;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      });

      switch(icp_transfer){
        case(#Err(err)){ Debug.print("Transfer of ICP failed: " # debug_show(err)); };
        case(#Ok(_)){};
      };
    };

  };

  func extractSingleTransfer(ip_transfers: [?BIP721Ledger.TransferFromResult]) : Result<(), Text> {
    if (ip_transfers.size() == 0 or ip_transfers[0] == null){
      return #err("Transfer of IP failed");
    };
    let transfer = switch(ip_transfers[0]){
      case(null) { return #err("Transfer of IP failed"); };
      case(?tx) { tx };
    };
    switch(transfer){
      case(#Err(err)){ #err("Transfer of IP failed: " # debug_show(err)); };
      case(#Ok(_)){ #ok; };
    };
  };

};
