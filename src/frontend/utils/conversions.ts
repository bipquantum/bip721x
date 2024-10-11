import { IntPropLicense, IntPropType } from "../../declarations/backend/backend.did";

export function intPropLicenseToString(license: IntPropLicense): string {
  if ('GAME_FI'               in license) return 'Game FI';
  if ('NOT_APPLICABLE'        in license) return 'Not Applicable';
  if ('SAAS'                  in license) return 'SAAS';
  if ('ADVERTISEMENT'         in license) return 'Advertisement';
  if ('META_USE'              in license) return 'Meta use';
  if ('REPRODUCTION'          in license) return 'Virtual Reproduction';
  if ('PHYSICAL_REPRODUCTION' in license) return 'Physical Reproduction';
  throw new Error('Invalid IntPropLicense');
}

export function intPropTypeToString(propType: IntPropType): string {
  if ('COPYRIGHT'                in propType) return 'Copyright';
  if ('PRE_PATENT'               in propType) return 'Pre-Patent';
  if ('TRADEMARK'                in propType) return 'Trademark';
  if ('TRADE_SECRET'             in propType) return 'Trade Secret';
  if ('INDUSTRIAL_DESIGN_RIGHTS' in propType) return 'Industrial Design Rights';
  if ('GEOGRAPHICAL_INDICATIONS' in propType) return 'Geographical Indications';
  if ('PLANT_VARIETY'            in propType) return 'Plant Variety';
  throw new Error('Invalid IntPropType');
}

export function intPropTypeToIndex(propType: IntPropType): number {
  if ('COPYRIGHT'                in propType) return 0;
  if ('PRE_PATENT'               in propType) return 1;
  if ('TRADEMARK'                in propType) return 2;
  if ('TRADE_SECRET'             in propType) return 3;
  if ('INDUSTRIAL_DESIGN_RIGHTS' in propType) return 4;
  if ('GEOGRAPHICAL_INDICATIONS' in propType) return 5;
  if ('PLANT_VARIETY'            in propType) return 6;
  throw new Error('Invalid IntPropType');
}

export function intPropTypeFromIndex(propType: number): IntPropType {
  switch (propType) {
    case 0: return { COPYRIGHT                : null };
    case 1: return { PRE_PATENT               : null };
    case 2: return { TRADEMARK                : null };
    case 3: return { TRADE_SECRET             : null };
    case 4: return { INDUSTRIAL_DESIGN_RIGHTS : null };
    case 5: return { GEOGRAPHICAL_INDICATIONS : null };
    case 6: return { PLANT_VARIETY            : null };
    default: throw new Error('Invalid IntPropType number');
  }
}

export function intPropLicenseToIndex(license: IntPropLicense): number {
  if ('GAME_FI'               in license) return 0;
  if ('NOT_APPLICABLE'        in license) return 1;
  if ('SAAS'                  in license) return 2;
  if ('ADVERTISEMENT'         in license) return 3;
  if ('META_USE'              in license) return 4;
  if ('REPRODUCTION'          in license) return 5;
  if ('PHYSICAL_REPRODUCTION' in license) return 6;
  throw new Error('Invalid IntPropLicense');
}

export function intPropLicenseFromIndex(license: number): IntPropLicense {
  switch (license) {
    case 0: return { GAME_FI              : null };
    case 1: return { NOT_APPLICABLE       : null };
    case 2: return { SAAS                 : null };
    case 3: return { ADVERTISEMENT        : null };
    case 4: return { META_USE             : null };
    case 5: return { REPRODUCTION         : null };
    case 6: return { PHYSICAL_REPRODUCTION: null };
    default: throw new Error('Invalid IntPropLicense number');
  }
}

export const fromE8s = (e8s: bigint) : number => {
  return Number(e8s) / 100_000_000;
}

export const toE8s = (icp: number) : bigint => {
  return BigInt(icp * 100_000_000);
}

export const dateToTime = (date: Date) : bigint => {
  return BigInt(date.getTime() * 1_000_000);
}

export const timeToDate = (time: bigint) : Date => {
  return new Date(Number(time));
}

export const formatDate = (date: Date) : string => {
  return date.toISOString().split('T')[0];
}