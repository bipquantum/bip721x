import Principal "mo:base/Principal";
import ICRC1 "mo:icrc1-mo/ICRC1/service";

shared actor class Faucet({ canister_ids: { ckbtc_ledger: Principal; bqc_ledger: Principal; } }) {

    type Account = {
        owner : Principal;
        subaccount : ?Blob;
    };

    public shared func mint_btc({amount: Nat; to: Account}) : async ICRC1.TransferResult {

        let ckBTCLedger : ICRC1.service = actor(Principal.toText(canister_ids.ckbtc_ledger));

        await ckBTCLedger.icrc1_transfer({
            fee = null;
            memo = null;
            from_subaccount = null;
            created_at_time = null;
            amount;
            to;
        });
    };

    public shared func mint_bqc({amount: Nat; to: Account}) : async ICRC1.TransferResult {

        let bqcLedger : ICRC1.service = actor(Principal.toText(canister_ids.bqc_ledger));

        await bqcLedger.icrc1_transfer({
            fee = null;
            memo = null;
            from_subaccount = null;
            created_at_time = null;
            amount;
            to;
        });
    };

};