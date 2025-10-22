import { ckusdtLedgerActor } from "../actors/CkUsdtLedgerActor";
import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { backendActor } from "../actors/BackendActor";
import { faucetActor } from "../actors/FaucetActor";
import { dateToTime, fromFixedPoint, toFixedPoint } from "../../utils/conversions";
import { getTokenDecimals, getTokenFee } from "../../utils/metadata";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Account, MetadataValue, TransferResult } from "../../../declarations/ckusdt_ledger/ckusdt_ledger.did";
import { useAuth } from "@nfid/identitykit/react";
import { toNullable } from "@dfinity/utils";
import { ApproveResult } from "../../../declarations/ckbtc_ledger/ckbtc_ledger.did";

export enum LedgerType {
  CK_USDT = 'ckUSDT',
  BQC = 'BQC',
}

export interface FungibleLedger {
  metadata: Array<[string, MetadataValue]> | undefined;
  price: number | undefined;
  tokenDecimals: number | undefined;
  totalSupply: bigint | undefined;
  formatAmount: (amountFixedPoint: bigint | number | undefined, notation?: "standard" | "compact") => string | undefined;
  formatAmountUsd: (amountFixedPoint: bigint | number | undefined, notation?: "standard" | "compact") => string | undefined;
  convertToUsd: (amountFixedPoint: bigint | number | undefined) => number | undefined;
  convertFromUsd: (amountFixedPoint: number | undefined) => bigint | undefined;
  convertToFixedPoint: (amount: number | undefined) => bigint | undefined;
  convertToFloatingPoint: (amountFixedPoint: bigint | number | undefined) => number | undefined;
  transferTokens: (amount: bigint, to: Account) => Promise<TransferResult | undefined>;
  approveTokens: (amount: bigint, spender: Account) => Promise<ApproveResult | undefined>;
  subtractFee?: (amount: bigint) => bigint;
  tokenFee?: bigint;
  userBalance: bigint | undefined;
  refreshUserBalance: () => void;
  mint: (amount: number) => Promise<boolean>;
  mintLoading: boolean;
}

export const useFungibleLedger = (ledgerType: LedgerType) : FungibleLedger => {

  const actor = ledgerType === LedgerType.CK_USDT ? ckusdtLedgerActor : bqcLedgerActor;

  const { user } = useAuth();

  const account = useMemo((): Account | undefined => {
    if (user) {
      return {
        owner: user.principal,
        subaccount: user.subAccount ? [user.subAccount.toUint8Array()] : [],
      };
    }
    return undefined;
  }, [user]);

  const { data: metadata } = actor.unauthenticated.useQueryCall({
    functionName: 'icrc1_metadata',
    args: [],
  });

  const { data: ckusdtPriceData, call: refreshCkusdtPrice } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_ckusdt_usd_price",
    args: [],
  });

  const { data: totalSupply } = actor.unauthenticated.useQueryCall({
    functionName: 'icrc1_total_supply',
    args: [],
  });

  const { call: transfer } = actor.authenticated.useUpdateCall({
    functionName: 'icrc1_transfer',
  });

  const transferTokens = (amount: bigint, to: Account) => {
    return transfer([{
        fee: toNullable(tokenFee),
        from_subaccount: account?.subaccount || [],
        memo: [],
        created_at_time: [],
        to,
        amount
    }]);
  };

  const { call: approve } = actor.authenticated.useUpdateCall({
    functionName: 'icrc2_approve',
  });

  const approveTokens = async(amount: bigint, spender: Account) => {
    const result = await approve([{
      fee: [],
      from_subaccount: account?.subaccount || [],
      memo: [],
      created_at_time: [dateToTime(new Date())],
      spender,
      amount,
      expires_at: [],
      expected_allowance: [],
    }]);
    return result;
  };

  const [price, setPrice] = useState<number | undefined>(undefined);

  // Handle ckUSDT price data from backend
  useEffect(() => {
    if (ckusdtPriceData && ledgerType === LedgerType.CK_USDT) {
      // Convert exchange rate to number using its own decimals
      // Note: Exchange rate decimals are different from token decimals
      // E.g., rate = 1_001_001_001 with decimals = 9 means 1.001001001 USD per USDT
      const priceData = ckusdtPriceData as { usd_price: bigint; decimals: number; last_update: bigint };
      const exchangeRateDecimals = priceData.decimals;
      const priceNumber = Number(priceData.usd_price) / (10 ** exchangeRateDecimals);
      setPrice(priceNumber);
    } else if (ledgerType === LedgerType.BQC) {
      // For BQC, since the token is not listed yet, the price is undefined
      setPrice(undefined);
    }
  }, [ckusdtPriceData, ledgerType]);

  // Auto-refresh ckUSDT price every minute
  useEffect(() => {
    if (ledgerType !== LedgerType.CK_USDT || !refreshCkusdtPrice) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log("[useFungibleLedger] Refreshing ckUSDT price...");
      refreshCkusdtPrice([]);
    }, 60_000); // 60 seconds = 1 minute

    return () => {
      clearInterval(intervalId);
    };
  }, [ledgerType, refreshCkusdtPrice]);

  const tokenDecimals = useMemo(() => getTokenDecimals(metadata), [metadata]);
  const tokenFee = useMemo(() => getTokenFee(metadata), [metadata]);

  const formatAmount = (amount: bigint | number | undefined, notation: "standard" | "compact" = "compact") => {
    if (amount === undefined || tokenDecimals === undefined) {
      return undefined;
    }
    return new Intl.NumberFormat("en-US", {
      notation,
      minimumFractionDigits: 0,
      maximumFractionDigits: ledgerType === LedgerType.CK_USDT ? 2 : tokenDecimals,
    }).format(fromFixedPoint(amount, tokenDecimals));
  };

  const formatAmountUsd = (amount: bigint | number | undefined, notation: "standard" | "compact" = "compact") => {
    let usdValue = convertToUsd(amount);
    if (usdValue === undefined) {
      return undefined;
    }
    let formattedValue = new Intl.NumberFormat("en-US", {
      notation,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(usdValue);
    return `$${formattedValue}`;
  };

  const convertToUsd = (amount: bigint | number | undefined) : number | undefined => {
    if (amount === undefined || price === undefined || tokenDecimals === undefined) {
      return undefined;
    }
    return fromFixedPoint(amount, tokenDecimals) * price;
  }

  const convertFromUsd = (amount: number | undefined) : bigint | undefined => {
    if (amount === undefined || price === undefined || tokenDecimals === undefined) {
      return undefined;
    }
    return toFixedPoint(amount / price, tokenDecimals);
  };

  const convertToFixedPoint = (amount: number | undefined) : bigint | undefined => {
    if (amount === undefined || tokenDecimals === undefined) {
      return undefined;
    }
    return toFixedPoint(amount, tokenDecimals);
  };

  const convertToFloatingPoint = (amount: bigint | number | undefined) : number | undefined => {
    if (amount === undefined || tokenDecimals === undefined) {
      return undefined;
    }
    return fromFixedPoint(amount, tokenDecimals);
  };

  const subtractFee = tokenFee === undefined ? undefined : (amount: bigint) : bigint => {
    if (amount < tokenFee) {
      return 0n; // If amount is less than fee, return 0, transfer will fail anyway
    }
    return amount - tokenFee; // Subtract the token fee from the amount
  };

  const { data: userBalance, call: icrc1BalanceOf } = actor.unauthenticated.useQueryCall({
    functionName: 'icrc1_balance_of',
    args: account ? [account] : undefined,
  });

  const refreshUserBalance = useCallback(() => {
    icrc1BalanceOf(account ? [account] : undefined);
  }, [account]);

  const { call: mintToken, loading: mintLoading } = faucetActor.unauthenticated.useUpdateCall({
    functionName: ledgerType === LedgerType.CK_USDT ? 'mint_usdt' : 'mint_bqc',
  });

  const mint = async(amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount to mint:", amount);
      return false;
    }
    if (tokenDecimals === undefined){
      console.error("Token decimals are not defined.");
      return false;
    }
    if (!account) {
      console.warn("User account is not provided.");
      return false;
    }
    try {
      const mintResult = await mintToken([{
        amount: toFixedPoint(amount, tokenDecimals) ?? 0n,
        to: account,
      }]);
      if (mintResult === undefined) {
        throw new Error(`Failed to mint ${amount}: mintToken returned an undefined result`);
      }
      if ("err" in mintResult) {
        throw new Error(`Failed to mint ${amount}: ${mintResult.err}`);
      }
      // Refresh user balance after minting
      refreshUserBalance();
      return true;
    } catch (error) {
      console.error("Error in mint:", error);
      return false;
    }
  };

  return {
    metadata,
    price,
    tokenDecimals,
    totalSupply,
    formatAmount,
    formatAmountUsd,
    convertToUsd,
    convertFromUsd,
    convertToFixedPoint,
    convertToFloatingPoint,
    transferTokens,
    approveTokens,
    subtractFee,
    tokenFee,
    userBalance,
    refreshUserBalance,
    mint,
    mintLoading,
  };
};