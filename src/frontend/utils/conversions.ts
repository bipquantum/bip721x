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
