import { useState } from "react";
import FilePreview from "../../common/FilePreview";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { ActionMeta, MultiValue } from "react-select";
import { CiImageOn } from "react-icons/ci";
import { TbCheck, TbCross } from "react-icons/tb";
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
import { getCustomStyles } from "../../../utils/selectStyles";
import { validateIpDataUri, validateIpDescription, validateIpTitle } from "../../../utils/validation";
import { MdCancel } from "react-icons/md";


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
    <div className="flex flex-grow flex-col items-center w-full lg:w-10/12 xl:w-8/12 gap-[30px] sm:flex-grow-0">
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
      <div className="flex w-full flex-col gap-[24px]">
        {/* Title and Creation Date Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* IP Title Section */}
          <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-black dark:text-white">
                Title{<span className="text-red-500">{validateIpTitle(intPropInput) ? "*" : ""}</span>}
              </label>
              <div className="relative">
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
                  placeholder="Enter a title for your intellectual property."
                  className={`w-full rounded-lg border px-4 py-3 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:placeholder-gray-400 border-gray-300 bg-white text-black focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-red-500 font-medium">{validateIpTitle(intPropInput)}</span>
                  <span className={intPropInput.title.length > BIP_TITLE_MAX_LENGTH * 0.9 ? 'text-orange-500 font-medium' : 'text-gray-500'}>
                    {intPropInput.title.length}/{BIP_TITLE_MAX_LENGTH}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Creation Date Section */}
          <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-black dark:text-white">
                Date of Creation
              </label>
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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-black focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                calendarClassName="custom-calendar"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                placeholderText="Select creation date"
              />
            </div>
          </div>
        </div>

        {/* Cover Image Section - Full Width */}
        <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-black dark:text-white">
              Cover Image{<span className="text-red-500">{validateIpDataUri(intPropInput) ? "*" : ""}</span>}
            </label>

            {/* File Preview or Upload Button */}
            {dataUri ? (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <FilePreview
                    dataUri={dataUri}
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIntPropInput({
                        ...intPropInput,
                        dataUri: "",
                      });
                      setDataUri("");
                    }}
                    className="absolute right-2 top-2"
                    title="Remove file"
                  >
                    <MdCancel size={24} color={`${isDark ? "white" : "black"}`} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    <span className="text-gray-400">
                      <CiImageOn size={18} />
                    </span>
                    <span>Change file...</span>
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
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white p-8 text-base text-black transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                <span className="text-gray-400">
                  <CiImageOn size={32} />
                </span>
                <span>Choose file...</span>
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
            )}

            {/* Error Message */}
            {validateIpDataUri(intPropInput) && (
              <p className="text-sm text-red-500 font-medium">
                {validateIpDataUri(intPropInput)}
              </p>
            )}
          </div>
        </div>

        {/* IP Description Section */}
        <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-black dark:text-white">
              Description{<span className="text-red-500">{validateIpDescription(intPropInput) ? "*" : ""}</span>}
            </label>
            <div className="relative">
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
                placeholder="Provide a detailed description of your intellectual property. Include key features, innovations, and potential applications."
                rows={6}
                className={`w-full resize-none rounded-lg border px-4 py-3 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:placeholder-gray-400 border-gray-300 bg-white text-black focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              />
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-red-500 font-medium">{validateIpDescription(intPropInput)}</span>
                <span className={intPropInput.description.length > BIP_DESCRIPTION_MAX_LENGTH * 0.9 ? 'text-orange-500 font-medium' : 'text-gray-500'}>
                  {intPropInput.description.length}/{BIP_DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* IP Type and License */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* IP Type Section */}
          <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-black dark:text-white">
                Type of Intellectual Property
              </label>
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
                options={IP_TYPE_OPTIONS}
                styles={getCustomStyles(isDark)}
                placeholder="Select IP Type"
                isSearchable={false}
              />
            </div>
          </div>

          {/* IP License Section */}
          <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold text-black dark:text-white">
                Intellectual Property License (Multiple Selection)
              </label>
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
                  const selectedOptions = newValue as Option[];
                  setIntPropInput({
                    ...intPropInput,
                    intPropLicenses: selectedOptions.map((option) =>
                      intPropLicenseFromIndex(Number(option.value)),
                    ),
                  });
                }}
                options={IP_LICENSE_OPTIONS}
                placeholder="Select license options"
                isSearchable={false}
              />
            </div>
          </div>
        </div>
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
                Royalties <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{`(Max: ${MAX_ROYALTY_PERCENTAGE}%)`}</span>
              </p>
            </div>
            { royaltySwitch && <div className={`flex items-center gap-2 transition-opacity duration-200 ${!royaltySwitch ? 'opacity-30' : ''}`}>
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
            </div> }
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
          { publishSwitch && <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${!publishSwitch ? 'opacity-30' : ''}`}>
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
                className={`flex rounded-lg w-full border border-gray-300 text-black dark:text-white bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 ${!publishSwitch ? "pointer-events-none bg-gray-100 dark:bg-gray-800" : ""}`}
                calendarClassName="custom-calendar"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                placeholderText="YYYY-MM-DD"
                disabled={!publishSwitch}
              />
            </div>
          </div> }
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
