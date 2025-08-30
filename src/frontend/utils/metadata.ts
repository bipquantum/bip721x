import { MetadataValue } from "../../declarations/ckbtc_ledger/ckbtc_ledger.did";

export const getTokenLogo = (metadata: Array<[string, MetadataValue]> | undefined) : string | undefined => {
  if (!metadata) {
    return undefined;
  }
  const logo = metadata.find((item) => item[0] === "icrc1:logo");
  if (logo !== undefined && "Text" in logo?.[1]) {
    return logo?.[1].Text;
  }
  return undefined;
}

export const getTokenName = (metadata: Array<[string, MetadataValue]> | undefined) : string | undefined => {
  if (!metadata) {
    return undefined;
  }
  const name = metadata.find((item) => item[0] === "icrc1:name");
  if (name !== undefined && "Text" in name?.[1]) {
    return name?.[1].Text;
  }
  return undefined;
}

export const getTokenSymbol = (metadata: Array<[string, MetadataValue]> | undefined) : string | undefined => {
  if (!metadata) {
    return undefined;
  } 
  const symbol = metadata.find((item) => item[0] === "icrc1:symbol");
  if (symbol !== undefined && "Text" in symbol?.[1]) {
    return symbol?.[1].Text;
  }
  return undefined;
}

export const getTokenDecimals = (metadata: Array<[string, MetadataValue]> | undefined) : number | undefined => {
  if (!metadata) {
    return undefined;
  }
  const decimals = metadata.find((item) => item[0] === "icrc1:decimals");
  if (decimals !== undefined && "Nat" in decimals?.[1]) {
    return Number(decimals?.[1].Nat);
  }
  return undefined;
}

export const getTokenFee = (metadata: Array<[string, MetadataValue]> | undefined) : bigint | undefined => {
  if (!metadata) {
    return undefined;
  }
  const fee = metadata.find((item) => item[0] === "icrc1:fee");
  if (fee !== undefined && "Nat" in fee?.[1]) {
    return BigInt(fee?.[1].Nat);
  }
  return undefined;
}