import { IntPropLicense, IntPropType } from "../../declarations/backend/backend.did";

export function intPropLicenseToString(license: IntPropLicense): string {
  if ('GAME_FI' in license) return 'GAME_FI';
  if ('NOT_APPLICABLE' in license) return 'NOT_APPLICABLE';
  if ('SAAS' in license) return 'SAAS';
  if ('ADVERTISEMENT' in license) return 'ADVERTISEMENT';
  if ('META_USE' in license) return 'META_USE';
  if ('REPRODUCTION' in license) return 'REPRODUCTION';
  if ('PHYSICAL_REPRODUCTION' in license) return 'PHYSICAL_REPRODUCTION';
  return ''; // Default case, should not happen if all cases are covered
}

export function intPropTypeToString(propType: IntPropType): string {
  if ('PATENT' in propType) return 'PATENT';
  if ('IP_CERTIFICATE' in propType) return 'IP_CERTIFICATE';
  if ('COPYRIGHT' in propType) return 'COPYRIGHT';
  return ''; // Default case, should not happen if all cases are covered
}

export const fromE8s = (e8s: bigint) : number => {
  return Number(e8s) / 100_000_000;
}

export const nsToStrDate = (ns: bigint) => {
  let date = new Date(Number(ns) / 1000000);
  //11:09 PM · Feb 18, 2023

  var year = date.getFullYear(),
      month = date.getMonth(),
      day = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
      minuteFormatted = minute < 10 ? "0" + minute : minute,
      ampm = hour < 12 ? "am" : "pm";

  return hourFormatted + ":" + minuteFormatted + " " + ampm + " · " + getMonthStr(month) + " " + day + ", " + year;
};

const getMonthStr = (month: number) => {
  // months are zero indexed
  switch (month) {
    case 0: return 'Jan';
    case 1: return 'Feb';
    case 2: return 'Mar';
    case 3: return 'Apr';
    case 4: return 'May';
    case 5: return 'Jun';
    case 6: return 'Jul';
    case 7: return 'Aug';
    case 8: return 'Sep';
    case 9: return 'Oct';
    case 10: return 'Nov';
    default: return 'Dec';
  }
};