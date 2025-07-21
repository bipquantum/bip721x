import {
  bigEndianCrc32,
  encodeBase32,
  isNullish,
  uint8ArrayToHexString,
  arrayOfNumberToUint8Array,
  fromNullable,
} from "@dfinity/utils";
import { Account } from "../../declarations/bip721_ledger/bip721_ledger.did";
import { Principal } from "@dfinity/principal";

type IcrcAccount = {
  owner: Principal;
  subaccount?: Uint8Array;
};

/**
 * Encodes an Icrc-1 account compatible into a string.
 * Formatting Reference: https://github.com/dfinity/ICRC-1/blob/main/standards/ICRC-1/TextualEncoding.md
 *
 * @param account { owner: Principal, subaccount?: Uint8Array }
 * @returns string
 */
const encodeAccount = ({ owner, subaccount }: IcrcAccount): string => {
  if (isNullish(subaccount)) {
    return owner.toText();
  }

  const removeLeadingZeros = (text: string): string => text.replace(/^0+/, "");

  const subaccountText = removeLeadingZeros(
    uint8ArrayToHexString(Uint8Array.from(subaccount)),
  );

  if (subaccountText.length === 0) {
    return owner.toText();
  }

  return `${owner.toText()}-${encodeCrc({
    owner,
    subaccount,
  })}.${subaccountText}`;
};

const encodeCrc = ({ owner, subaccount }: Required<IcrcAccount>): string => {
  const crc = bigEndianCrc32(
    Uint8Array.from([...owner.toUint8Array(), ...subaccount]),
  );

  return encodeBase32(crc);
};

const subaccountAsUint8Array = (
  subaccount: Uint8Array | number[] | undefined,
): Uint8Array | undefined => {
  if (subaccount === undefined) {
    return undefined;
  } else if (subaccount as Uint8Array) {
    return subaccount as Uint8Array;
  } else {
    return arrayOfNumberToUint8Array(subaccount as number[]);
  }
};

export const getEncodedAccount = (account: Account): string => {
  let icrc_account: IcrcAccount = {
    owner: account.owner,
    subaccount: subaccountAsUint8Array(fromNullable(account.subaccount)),
  };
  return encodeAccount(icrc_account);
};
