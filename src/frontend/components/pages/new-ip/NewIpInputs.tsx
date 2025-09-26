import { useState } from "react";
import FilePreview from "../../common/FilePreview";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { ActionMeta, MultiValue } from "react-select";
import { CiImageOn } from "react-icons/ci";
import { TbCheck } from "react-icons/tb";
import CountrySelect from "../../common/CountrySelect";
import { Option, SelectValue } from "react-tailwindcss-select/dist/components/type";
import { IntPropInput } from "../../../../declarations/backend/backend.did";
import {
  dateToTime,
  intPropLicenseFromIndex,
  intPropLicenseToIndex,
  intPropTypeFromIndex,
  intPropTypeToIndex,
  timeToDate,
} from "../../../utils/conversions";
import {
  BIP_DESCRIPTION_MAX_LENGTH,
  BIP_TITLE_MAX_LENGTH,
  DEFAULT_PUBLISHING,
  IP_LICENSE_OPTIONS,
  IP_TYPE_OPTIONS,
  MAX_ROYALTY_PERCENTAGE,
  MIN_ROYALTY_PERCENTAGE,
} from "../../constants";
import FileUploader from "../../common/FileUploader";
import { fromNullable, toNullable } from "@dfinity/utils";
import { MiddlewareReturn } from "@floating-ui/core";
import { MiddlewareState } from "@floating-ui/dom";
import FieldValidator from "./FieldValidator";
import { getCustomStyles } from "../../../utils/selectStyles";
import { validateIpDateUri, validateIpDescription, validateIpTitle } from "../../../utils/validation";


interface NewIpInputsProps {
  intPropInput: IntPropInput;
  setIntPropInput: React.Dispatch<React.SetStateAction<IntPropInput>>;
  dataUri: string;
  setDataUri: React.Dispatch<React.SetStateAction<string>>;
}

const NewIpInputs: React.FC<NewIpInputsProps> = ({ intPropInput, setIntPropInput, dataUri, setDataUri }) => {

  const [royaltySwitch, setRoyaltySwitch] = useState(false);
  const [publishSwitch, setPublishSwitch] = useState(false);

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="flex w-full flex-grow flex-col items-center gap-[30px] overflow-x-hidden sm:flex-grow-0">
      <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
        <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
          Step 1 : Create new BIP
        </p>
        <div className="flex w-full flex-row items-center gap-1">
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
          <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
          <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-[30px]">
        <div className="flex w-full flex-col items-center gap-2">
          <div
            className={`${dataUri ? "w-fit" : "w-[360px]"} h-[180px] rounded-lg bg-gray-800 dark:bg-gray-200`}
          >
            {dataUri && (
              <FilePreview
                dataUri={dataUri}
                className="h-[180px] w-auto rounded-lg"
              />
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-[30px] pr-2">
          {/* Upload and calendar */}
          <div className="flex w-full flex-col gap-[20px] sm:gap-[40px] lg:flex-row">
            <div className="w-full lg:w-6/12">
              <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                <p
                  className={
                    "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                  }
                >
                  <FieldValidator
                    name={"IP File"}
                    error={validateIpDateUri(intPropInput)}
                  />
                </p>
                <label className="flex h-full w-full items-center justify-between p-4 text-base text-black dark:text-white">
                  <p>Upload Image/ Video</p>
                  <span className="ml-auto w-fit text-black dark:text-gray-400">
                    <CiImageOn size={22} />
                  </span>
                  <FileUploader
                    setDataUri={(dataUri) => {
                      setIntPropInput({
                        ...intPropInput,
                        dataUri: dataUri || "",
                      });
                      setDataUri(dataUri ?? "");
                    }}
                    acceptedFiles="image/*,audio/*,application/pdf,text/*"
                  />
                </label>
              </div>
            </div>
            <div className="w-full lg:w-6/12">
              <div className="relative flex w-full flex-col rounded-md border border-gray-400 p-[13px]">
                <p
                  className={
                    "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                  }
                >
                  <FieldValidator name={"Creation Date"} />
                </p>
                <DatePicker
                  selected={
                    typeof intPropInput.creationDate === "bigint"
                      ? timeToDate(intPropInput.creationDate)
                      : new Date()
                  }
                  onChange={(date) => {
                    if (date) {
                      setIntPropInput({
                        ...intPropInput,
                        creationDate: dateToTime(date),
                      });
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full bg-transparent text-base text-black dark:text-white"
                  calendarClassName="custom-calendar"
                  popperClassName="z-50"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundariesElement: "viewport",
                        padding: 8, // Keep some padding from the edge
                      },
                      fn: function (
                        state: MiddlewareState,
                      ): MiddlewareReturn | Promise<MiddlewareReturn> {
                        throw new Error("Function not implemented.");
                      },
                    },
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: [
                          "top",
                          "bottom",
                          "left",
                          "right",
                        ], // Flip to any side if needed
                      },
                      fn: function (
                        state: MiddlewareState,
                      ): MiddlewareReturn | Promise<MiddlewareReturn> {
                        throw new Error("Function not implemented.");
                      },
                    },
                    {
                      name: "offset",
                      options: {
                        offset: [0, 8], // Small vertical offset from the input
                      },
                      fn: function (
                        state: MiddlewareState,
                      ): MiddlewareReturn | Promise<MiddlewareReturn> {
                        throw new Error("Function not implemented.");
                      },
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          {/* IP Title and Description */}
          <div className="flex w-full flex-col gap-[20px] md:gap-[40px] lg:flex-row">
            <div className="w-full lg:w-6/12">
              <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                <p
                  className={
                    "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                  }
                >
                  <FieldValidator
                    name={"Title of the IP"}
                    error={validateIpTitle(intPropInput)}
                  />
                </p>
                <input
                  type="text"
                  maxLength={BIP_TITLE_MAX_LENGTH}
                  value={intPropInput.title}
                  onChange={(e) => {
                    setIntPropInput({
                      ...intPropInput,
                      title: e.target.value,
                    });
                  }}
                  required
                  className="bg-transparent p-[15px] text-base text-black dark:text-white"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12">
              <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                <p
                  className={
                    "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                  }
                >
                  <FieldValidator
                    name={"Description of the IP"}
                    error={validateIpDescription(intPropInput)}
                  />
                </p>
                <textarea
                  maxLength={BIP_DESCRIPTION_MAX_LENGTH}
                  value={intPropInput.description}
                  onChange={(e) => {
                    setIntPropInput({
                      ...intPropInput,
                      description: e.target.value,
                    });
                  }}
                  required
                  className="h-[54px] bg-transparent px-[15px] pt-[16px] text-base text-black focus:outline-none dark:text-white"
                />
              </div>
            </div>
          </div>
          {/* dropdowns */}
          <div className="flex w-full flex-col gap-[20px] md:gap-[40px] lg:flex-row">
            <div className="w-full lg:w-6/12">
              <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                <p
                  className={
                    "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                  }
                >
                  <FieldValidator name={"IP Type"} />
                </p>
                <Select
                  value={
                    IP_TYPE_OPTIONS.find(
                      (option) =>
                        option.value ===
                        intPropTypeToIndex(
                          intPropInput.intPropType,
                        ).toString(),
                    ) ||
                    (() => {
                      throw new Error(
                        `Invalid intPropType: ${intPropInput.intPropType}`,
                      );
                    })()
                  }
                  onChange={(selectedOptions: SelectValue) =>
                    setIntPropInput({
                      ...intPropInput,
                      intPropType: intPropTypeFromIndex(
                        Number((selectedOptions as Option).value),
                      ),
                    })
                  }
                  options={IP_TYPE_OPTIONS.filter(
                    (type) =>
                      type.value !==
                      intPropTypeToIndex(
                        intPropInput.intPropType,
                      ).toString(),
                  )}
                  styles={getCustomStyles(isDark)}
                  placeholder="Select Type"
                />
              </div>
            </div>
            <div className="w-full lg:w-6/12">
              <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                <p
                  className={
                    "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                  }
                >
                  <FieldValidator name={"IP License"} />
                </p>
                <Select
                  styles={getCustomStyles(isDark)}
                  isMulti
                  value={intPropInput.intPropLicenses.map(
                    (license) =>
                      IP_LICENSE_OPTIONS.find(
                        (option) =>
                          option.value ===
                          intPropLicenseToIndex(license).toString(),
                      ) ||
                      (() => {
                        throw new Error(
                          `Invalid intPropLicense: ${license}`,
                        );
                      })(),
                  )}
                  onChange={(
                    newValue: MultiValue<Option | Option[]>,
                    actionMeta: ActionMeta<Option | Option[]>,
                  ) => {
                    const selectedOptions = newValue as Option[]; // Assuming multiple options
                    setIntPropInput({
                      ...intPropInput,
                      intPropLicenses: selectedOptions.map((option) =>
                        intPropLicenseFromIndex(Number(option.value)),
                      ),
                    });
                  }}
                  options={IP_LICENSE_OPTIONS}
                  placeholder="Select options"
                  // primaryColor="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-[24px]">
        {/* Royalties Section */}
        <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setRoyaltySwitch(!royaltySwitch)}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${royaltySwitch ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${royaltySwitch ? 'translate-x-5' : 'translate-x-0.5'}`}
                >
                  {royaltySwitch && (
                    <div className="flex h-full w-full items-center justify-center">
                      <TbCheck size={12} className="text-primary" />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-base font-semibold text-black dark:text-white">
                Royalties
              </p>
            </div>
            <div className={`flex items-center gap-2 transition-opacity duration-200 ${!royaltySwitch ? 'opacity-30' : ''}`}>
              <div className="flex items-center gap-1">
                <input
                  value={
                    fromNullable(intPropInput.percentageRoyalties) !==
                    undefined
                      ? Number(
                          fromNullable(intPropInput.percentageRoyalties),
                        )
                      : ""
                  }
                  placeholder="0"
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      setIntPropInput((intProp) => {
                        return {
                          ...intProp,
                          percentageRoyalties: [],
                        };
                      });
                      return;
                    }

                    const value =
                      Number(inputValue) >= MIN_ROYALTY_PERCENTAGE
                        ? BigInt(
                            Math.min(
                              Number(inputValue),
                              MAX_ROYALTY_PERCENTAGE,
                            ),
                          )
                        : undefined;
                    setIntPropInput((intProp) => {
                      return {
                        ...intProp,
                        percentageRoyalties: toNullable(value),
                      };
                    });
                  }}
                  max={MAX_ROYALTY_PERCENTAGE}
                  min={0}
                  type="number"
                  className={`w-16 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-base text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white ${!royaltySwitch ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
                  disabled={!royaltySwitch}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">%</span>
              </div>
            </div>
          </div>
          {!royaltySwitch && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable to set royalty percentage for secondary sales
            </p>
          )}
        </div>
        {/* Publishing Section */}
        <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  setIntPropInput((intProp) => {
                    return {
                      ...intProp,
                      publishing: fromNullable(intProp.publishing)
                        ? []
                        : [DEFAULT_PUBLISHING],
                    };
                  });
                  setPublishSwitch(!publishSwitch);
                }}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${publishSwitch ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${publishSwitch ? 'translate-x-5' : 'translate-x-0.5'}`}
                >
                  {publishSwitch && (
                    <div className="flex h-full w-full items-center justify-center">
                      <TbCheck size={12} className="text-primary" />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-base font-semibold text-black dark:text-white">
                Publishing Details
              </p>
            </div>
          </div>
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${!publishSwitch ? 'opacity-30' : ''}`}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <div className={`${!publishSwitch ? "pointer-events-none" : ""}`}>
                <CountrySelect
                  value={fromNullable(intPropInput.publishing)?.countryCode ?? DEFAULT_PUBLISHING.countryCode}
                  onChange={(countryCode) =>
                    setIntPropInput((intProp) => {
                      return {
                        ...intProp,
                        publishing: [
                          {
                            date:
                              fromNullable(intProp.publishing)?.date ??
                              DEFAULT_PUBLISHING.date,
                            countryCode,
                          },
                        ],
                      };
                    })
                  }
                  className={`${!publishSwitch ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publication Date
              </label>
              <DatePicker
                selected={
                  intPropInput.publishing?.[0]?.date
                    ? timeToDate(intPropInput.publishing[0].date) // Convert bigint to Date
                    : new Date() // Default to today
                }
                onChange={(date) => {
                  if (date) {
                    setIntPropInput((intProp) => ({
                      ...intProp,
                      publishing: [
                        {
                          date: dateToTime(date), // Convert Date to bigint
                          countryCode:
                            fromNullable(intProp.publishing)
                              ?.countryCode ??
                            DEFAULT_PUBLISHING.countryCode,
                        },
                      ],
                    }));
                  }
                }}
                dateFormat="yyyy-MM-dd" // Matches native <input type="date">
                className={`flex rounded-lg w-full border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 ${!publishSwitch ? "pointer-events-none bg-gray-100 dark:bg-gray-800" : ""}`}
                calendarClassName="custom-calendar"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                placeholderText="YYYY-MM-DD"
                disabled={!publishSwitch}
              />
            </div>
          </div>
          {!publishSwitch && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable to add publication details for your intellectual property
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewIpInputs;
