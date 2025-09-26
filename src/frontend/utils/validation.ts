import { IntPropInput } from "../../declarations/backend/backend.did";
import { BIP_DESCRIPTION_MAX_LENGTH, BIP_DESCRIPTION_MIN_LENGTH, BIP_TITLE_MAX_LENGTH, BIP_TITLE_MIN_LENGTH } from "../components/constants";

export const validateIpDataUri = (input: IntPropInput): string | undefined => {
    if (input.dataUri.trim() === "") {
      return "File required";
    }
    return undefined;
  };

export const validateIpTitle = (input: IntPropInput): string | undefined => {
    const length = input.title.trim().length;
    if (length < BIP_TITLE_MIN_LENGTH) {
      return `${BIP_TITLE_MIN_LENGTH} characters minimum`;
    }
    if (length > BIP_TITLE_MAX_LENGTH) {
      return `${BIP_TITLE_MAX_LENGTH} characters maximum`;
    }
    return undefined;
  };

export const validateIpDescription = (input: IntPropInput): string | undefined => {
    const length = input.description.trim().length;
    if (length < BIP_DESCRIPTION_MIN_LENGTH) {
      return `${BIP_DESCRIPTION_MIN_LENGTH} characters minimum`;
    }
    if (length > BIP_DESCRIPTION_MAX_LENGTH) {
      return `${BIP_DESCRIPTION_MAX_LENGTH} characters maximum`;
    }
    return undefined;
  };