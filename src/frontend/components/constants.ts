import { Option } from "react-tailwindcss-select/dist/components/type";
import { dateToTime, intPropLicenseToIndex, intPropLicenseToString, intPropTypeToIndex, intPropTypeToString } from "../utils/conversions";

export const TOKEN_DECIMALS_ALLOWED = 2;
export const MAX_IP_SIZE_MB = 1.5;
export const NEW_USER_NICKNAME = "New User";
export const DEFAULT_COUNTRY_CODE = "US";
export const CALL_TO_ACTIONS = [
  "IP Education / Consultation",
  "Generate a BIP Certificate",
  "Organize IP Assets",
  "Sell IP Assets on the BIPQuantum Store",
];
export const BIP_TITLE_MIN_LENGTH = 3;
export const BIP_TITLE_MAX_LENGTH = 100;
export const BIP_DESCRIPTION_MIN_LENGTH = 50;
export const BIP_DESCRIPTION_MAX_LENGTH = 10000;
export const MIN_ROYALTY_PERCENTAGE = 1;
export const MAX_ROYALTY_PERCENTAGE = 20;
export const BIP_ITEMS_PER_QUERY = 12n;
export const NUMBER_AIRDROP_IPS = 1000n;
export const AUTOMATIC_CHATBOT_TRANSITION = "I get it, let's start!";
export const CREDITS_DEPLETED_TOAST_ID = "credits-depleted";

export const IP_TYPE_OPTIONS: Option[] = [
  {
    label: intPropTypeToString({ COPYRIGHT: null }),
    value: intPropTypeToIndex({ COPYRIGHT: null }).toString(),
  },
  {
    label: intPropTypeToString({ PRE_PATENT: null }),
    value: intPropTypeToIndex({ PRE_PATENT: null }).toString(),
  },
  {
    label: intPropTypeToString({ TRADEMARK: null }),
    value: intPropTypeToIndex({ TRADEMARK: null }).toString(),
  },
  {
    label: intPropTypeToString({ TRADE_SECRET: null }),
    value: intPropTypeToIndex({ TRADE_SECRET: null }).toString(),
  },
  {
    label: intPropTypeToString({ INDUSTRIAL_DESIGN_RIGHTS: null }),
    value: intPropTypeToIndex({ INDUSTRIAL_DESIGN_RIGHTS: null }).toString(),
  },
  {
    label: intPropTypeToString({ GEOGRAPHICAL_INDICATIONS: null }),
    value: intPropTypeToIndex({ GEOGRAPHICAL_INDICATIONS: null }).toString(),
  },
  {
    label: intPropTypeToString({ PLANT_VARIETY: null }),
    value: intPropTypeToIndex({ PLANT_VARIETY: null }).toString(),
  },
];

export const IP_LICENSE_OPTIONS: Option[] = [
  {
    label: intPropLicenseToString({ GAME_FI: null }),
    value: intPropLicenseToIndex({ GAME_FI: null }).toString(),
  },
  {
    label: intPropLicenseToString({ SAAS: null }),
    value: intPropLicenseToIndex({ SAAS: null }).toString(),
  },
  {
    label: intPropLicenseToString({ ADVERTISEMENT: null }),
    value: intPropLicenseToIndex({ ADVERTISEMENT: null }).toString(),
  },
  {
    label: intPropLicenseToString({ META_USE: null }),
    value: intPropLicenseToIndex({ META_USE: null }).toString(),
  },
  {
    label: intPropLicenseToString({ REPRODUCTION: null }),
    value: intPropLicenseToIndex({ REPRODUCTION: null }).toString(),
  },
  {
    label: intPropLicenseToString({ PHYSICAL_REPRODUCTION: null }),
    value: intPropLicenseToIndex({ PHYSICAL_REPRODUCTION: null }).toString(),
  },
  {
    label: intPropLicenseToString({ NOT_APPLICABLE: null }),
    value: intPropLicenseToIndex({ NOT_APPLICABLE: null }).toString(),
  },
];

export const DEFAULT_PUBLISHING = {
  date: dateToTime(new Date()),
  countryCode: DEFAULT_COUNTRY_CODE,
};