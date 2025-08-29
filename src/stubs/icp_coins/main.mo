import Debug "mo:base/Debug";

shared({caller = admin}) actor class IcpCoins({ initial_prices: { ck_btc : Float; } }) {

    type TokenId = Nat;
    type LatestTokenRow = ( (TokenId, TokenId), Text, Float );

    stable var prices = initial_prices;

    public shared query func get_latest(): async [LatestTokenRow] {
        // Uses same indexes as returned by the neutrinite canister (tried on 2025-07-01)
        [
            ((7, 0),  "ckBTC/USD",  prices.ck_btc),
        ];
    };

    public shared({caller}) func set_price(price: { #CK_BTC: Float; }) : async () {
        if (caller != admin) {
            Debug.trap("Only the admin can set the prices");
        };
        switch(price) {
            case (#CK_BTC(p)) {
                prices := { prices with ck_btc = p; };
            };
        };
    };

};