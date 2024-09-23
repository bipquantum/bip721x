import Result            "mo:base/Result";
import Int               "mo:base/Int";
import Time              "mo:base/Time";
import Nat64             "mo:base/Nat64";
import Debug             "mo:base/Debug";

import ICRC7             "mo:icrc7-mo";

import Icrc7Canister     "canister:icrc7";
import IcpLedgerCanister "canister:icp_ledger";

module {

  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type Time                = Int;

  type Account             = ICRC7.Account;

  type TransferArgs = {
    buyer: Account;
    seller: Account;
    token_id: Nat;
    e8s_price: Nat;
  };

  public class TradeManager({
    stage_account: Account;
    fee: Nat;
  }) {

    public func tradeIntProp(args: TransferArgs) : async* Result<(), Text> {

      let { buyer: Account; seller: Account; token_id: Nat; e8s_price: Nat; } = args;

      let stage_transfer = await* stageTransfer({
        buyer = buyer;
        seller = seller;
        token_id = token_id;
        e8s_price = e8s_price;
      });

      switch(stage_transfer){
        case(#err(err)){ return #err(err); };
        case(#ok){};
      };

      await* executeTransfer({
        buyer = buyer;
        seller = seller;
        token_id = token_id;
        e8s_price = e8s_price;
      });

      #ok;
    };

    func stageTransfer(args: TransferArgs) : async* Result<(), Text> {

      let { buyer: Account; seller: Account; token_id: Nat; e8s_price: Nat; } = args;

      // Transfer ICPs to the stage account
      let icp_transfer = await IcpLedgerCanister.icrc2_transfer_from({
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
      let ip_transfer = extractSingleTransfer(await Icrc7Canister.icrc37_transfer_from([{
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
          let icp_reimbursement = await IcpLedgerCanister.icrc1_transfer({
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

    func executeTransfer(args: TransferArgs) : async* () {

      let { buyer: Account; seller: Account; token_id: Nat; e8s_price: Nat; } = args;

      // Transfer the intellectual property to the buyer
      let ip_transfer = extractSingleTransfer(await Icrc7Canister.icrc7_transfer([{
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

      // Transfer the ICPs to the seller
      let icp_transfer = await IcpLedgerCanister.icrc1_transfer({
        from_subaccount = stage_account.subaccount;
        to = seller;
        amount = e8s_price - fee;
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

  func extractSingleTransfer(ip_transfers: [?Icrc7Canister.TransferFromResult]) : Result<(), Text> {
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
