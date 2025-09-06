
shared actor class ExchangeRate({ ckbtc_usd_price: Nat64 }) {

  // === Types from the XRC IDL ===

  public type AssetClass = {
    #Cryptocurrency;
    #FiatCurrency;
  };

  public type Asset = {
    symbol : Text;
    assetClass : AssetClass;
  };

  public type GetExchangeRateRequest = {
    base_asset : Asset;
    quote_asset : Asset;
    timestamp : ?Nat64;
  };

  public type ExchangeRateMetadata = {
    decimals : Nat32;
    base_asset_num_received_rates : Nat64;
    base_asset_num_queried_sources : Nat64;
    quote_asset_num_received_rates : Nat64;
    quote_asset_num_queried_sources : Nat64;
    standard_deviation : Nat64;
    forex_timestamp : ?Nat64;
  };

  public type ExchangeRate = {
    base_asset : Asset;
    quote_asset : Asset;
    timestamp : Nat64;
    rate : Nat64;
    metadata : ExchangeRateMetadata;
  };

  public type ExchangeRateError = {
    #AnonymousPrincipalNotAllowed;
    #Pending;
    #CryptoBaseAssetNotFound;
    #CryptoQuoteAssetNotFound;
    #StablecoinRateNotFound;
    #StablecoinRateTooFewRates;
    #StablecoinRateZeroRate;
    #ForexInvalidTimestamp;
    #ForexBaseAssetNotFound;
    #ForexQuoteAssetNotFound;
    #ForexAssetsNotFound;
    #RateLimited;
    #NotEnoughCycles;
    #FailedToAcceptCycles;
    #InconsistentRatesReceived;
    #Other : { code : Nat32; description : Text };
  };

  public type GetExchangeRateResult = {
    #Ok : ExchangeRate;
    #Err : ExchangeRateError;
  };

  // === Mock Implementation ===

  public query func get_exchange_rate(req : GetExchangeRateRequest) : async GetExchangeRateResult {
    // Return a dummy success response
    let rate : ExchangeRate = {
      base_asset = req.base_asset;
      quote_asset = req.quote_asset;
      timestamp = switch (req.timestamp) {
        case (?t) t;
        case null 0;
      };
      // Use the injected ckBTC/USD rate
      rate = ckbtc_usd_price;
      metadata = {
        decimals = 8;
        base_asset_num_received_rates = 3;
        base_asset_num_queried_sources = 3;
        quote_asset_num_received_rates = 3;
        quote_asset_num_queried_sources = 3;
        standard_deviation = 0;
        forex_timestamp = null;
      };
    };

    return #Ok(rate);
  };
};
