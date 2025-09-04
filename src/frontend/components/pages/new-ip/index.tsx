import { useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";

import { useLocation, useNavigate } from "react-router-dom";
import FilePreview from "../../common/FilePreview";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { backendActor } from "../../actors/BackendActor";

import Select, { ActionMeta, MultiValue } from "react-select";

import { CiImageOn } from "react-icons/ci";
import {
  TbArrowLeft,
  TbArrowRight,
  TbCalendarEventFilled,
  TbCheck,
} from "react-icons/tb";
import ReactCountryDropdown from "react-country-dropdown";
import { toast } from "react-toastify";

import {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";

import {
  IntPropInput,
  User,
} from "../../../../declarations/backend/backend.did";

import {
  dateToTime,
  fromNullableExt,
  intPropLicenseFromIndex,
  intPropLicenseToIndex,
  intPropLicenseToString,
  intPropTypeFromIndex,
  intPropTypeToIndex,
  intPropTypeToString,
  timeToDate,
} from "../../../utils/conversions";

import {
  BIP_DESCRIPTION_MAX_LENGTH,
  BIP_DESCRIPTION_MIN_LENGTH,
  BIP_TITLE_MAX_LENGTH,
  BIP_TITLE_MIN_LENGTH,
  DEFAULT_COUNTRY_CODE,
  MAX_ROYALTY_PERCENTAGE,
  MIN_ROYALTY_PERCENTAGE,
} from "../../constants";
import SuperJSON from "superjson";
import FileUploader from "../../common/FileUploader";
import { fromNullable, toNullable } from "@dfinity/utils";
import { MiddlewareReturn } from "@floating-ui/core";
import { MiddlewareState } from "@floating-ui/dom";
import UserImage from "../../common/UserImage";
import { ListButton } from "../../common/ListingDetails";
import { LegalDeclaration } from "./LegalDeclaration";
import FieldValidator from "./FieldValidator";
import { useSearch } from "../../common/SearchContext";

const IP_TYPE_OPTIONS: Option[] = [
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

const IP_LICENSE_OPTIONS: Option[] = [
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

// Custom Syles For React Select Dropdown
const getCustomStyles = (isDark: boolean) => ({
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    fontSize: "16px",
    padding: "10px",
    color: "#000",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#171717",
    borderRadius: "12px",
    padding: "5px 0",
    fontSize: "16px",
  }),
  option: (provided: any, state: { isSelected: any; isFocused: any }) => ({
    ...provided,
    backgroundImage: state.isSelected
      ? "linear-gradient(90deg, #4a90e2, #005bea)"
      : state.isFocused
        ? "linear-gradient(90deg, #4a90e2, #005bea)"
        : "none",
    backgroundColor:
      state.isSelected || state.isFocused ? "transparent" : "#171717",
    color: "#fff",
    padding: "10px",
    cursor: "pointer",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: isDark ? "#fff" : "#000",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#aaa",
  }),
});

interface NewIPButtonProps {
  principal: Principal | undefined;
}

const NewIPButton: React.FC<NewIPButtonProps> = ({ principal }) => {
  const navigate = useNavigate();
  const toastShownRef = useRef(false);

  const INITIAL_INT_PROP_INPUT: IntPropInput = {
    dataUri: "",
    title: "",
    intPropLicenses: [],
    intPropType: { COPYRIGHT: null },
    description: "",
    creationDate: dateToTime(new Date()),
    publishing: [],
    percentageRoyalties: [],
  };

  const loadIntPropInput = () => {
    try {
      const storedValue = sessionStorage.getItem("intPropInput");
      return storedValue
        ? SuperJSON.parse<IntPropInput>(storedValue)
        : INITIAL_INT_PROP_INPUT;
    } catch (error) {
      console.error("Failed to load intPropInput from sessionStorage:", error);
      toast.error("Failed to load preview form data: " + error);
      return INITIAL_INT_PROP_INPUT; // Return default value on error
    }
  };

  const save = (intPropInput: IntPropInput) => {
    try {
      sessionStorage.setItem("intPropInput", SuperJSON.stringify(intPropInput));
    } catch (error) {
      console.error("Failed to save intPropInput to sessionStorage:", error);
      toast.error("Failed to save form data: " + error);
    }
  };

  const clear = () => {
    sessionStorage.removeItem("intPropInput");
  };

  const [step, setStep] = useState(1);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [ipId, setIpId] = useState<bigint | undefined>(undefined);
  const [intPropInput, setIntPropInput] =
    useState<IntPropInput>(loadIntPropInput());
  // Required for file preview (step 4)
  // @todo: should use actual dataUri returned by query
  const [dataUri, setDataUri] = useState<string>(loadIntPropInput().dataUri);
  const [royaltySwitch, setRoyaltySwitch] = useState(false);
  const [publishSwitch, setPublishSwitch] = useState(false);

  const { call: createIntProp, loading } = backendActor.useUpdateCall({
    functionName: "create_int_prop",
    onSuccess: (data) => {
      if (data === undefined) {
        toast.error("Failed to create new IP: no data returned");
      } else if ("err" in data) {
        let errorMsg = "Unknown error";
        if (typeof data.err === "object" && data.err !== null) {
          const errVariant = Object.values(data.err)[0];
          if (
            errVariant &&
            typeof errVariant === "object" &&
            "message" in errVariant
          ) {
            errorMsg = (errVariant as any).message;
          } else {
            errorMsg = JSON.stringify(data.err);
          }
        } else if (typeof data.err === "string") {
          errorMsg = data.err;
        }
        toast.error("Failed to create new IP: " + errorMsg);
        console.error("error", data);
      } else {
        setIpId(data["ok"]);
        clear(); // Clear the form data after successful creation
        setStep(4);
      }
    },
    onError: (error) => {
      console.error("error", error);
      toast.error("Failed to create new IP: " + error);
    },
  });

  const DEFAULT_PUBLISHING = {
    date: dateToTime(new Date()),
    countryCode: DEFAULT_COUNTRY_CODE,
  };

  ///////////////////////////

  const { pathname } = useLocation();

  const [user, setUser] = useState<User | undefined>(undefined);

  const { call: queryUser } = backendActor.useQueryCall({
    functionName: "get_user",
  });

  useEffect(() => {
    if (principal !== undefined) {
      queryUser([principal]).then((queriedUser) => {
        let user = fromNullableExt(queriedUser);
        if (user === undefined && !toastShownRef.current) {
          toastShownRef.current = true; // Set flag to true after first toast
          navigate("/profile", { state: { redirect: pathname } });
          toast.warn("Please add user");
        } else {
          setUser(user);
        }
      });
    }
  }, [principal]);

  // Persist form state on every change
  useEffect(() => {
    save(intPropInput);
  }, [intPropInput]);

  const isDark = document.documentElement.classList.contains("dark");

  const validateDateUri = (input: IntPropInput): string | undefined => {
    if (input.dataUri.trim() === "") {
      return "File required";
    }
    return undefined;
  };

  const validateTitle = (input: IntPropInput): string | undefined => {
    const length = input.title.trim().length;
    if (length < BIP_TITLE_MIN_LENGTH) {
      return `${BIP_TITLE_MIN_LENGTH} characters minimum`;
    }
    if (length > BIP_TITLE_MAX_LENGTH) {
      return `${BIP_TITLE_MAX_LENGTH} characters minimum`;
    }
    return undefined;
  };

  const validateDescription = (input: IntPropInput): string | undefined => {
    const length = input.description.trim().length;
    if (length < BIP_DESCRIPTION_MIN_LENGTH) {
      return `${BIP_DESCRIPTION_MIN_LENGTH} characters minimum`;
    }
    if (length > BIP_DESCRIPTION_MAX_LENGTH) {
      return `${BIP_DESCRIPTION_MAX_LENGTH} characters maximum`;
    }
    return undefined;
  };

  return (
    <div
      className={`relative flex w-full flex-grow justify-center sm:flex-grow-0 md:items-center`}
    >
      {step === 1 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => {
              let error =
                validateTitle(intPropInput) ||
                validateDateUri(intPropInput) ||
                validateDescription(intPropInput);
              if (error !== undefined) {
                toast.warn("Invalid BIP: fix required fields");
                return;
              }
              setStep(2);
            }}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            <TbArrowRight size={60} />
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(3)}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            {loading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-transparent border-t-white dark:border-t-black"></div>
            ) : (
              <TbArrowRight size={60} />
            )}
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => {
              if (!disclaimerAccepted) {
                toast.warn("Please accept the legal declaration");
                return;
              }
              createIntProp([intPropInput]);
            }}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            {loading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-transparent border-t-white dark:border-t-black"></div>
            ) : (
              <TbArrowRight size={60} />
            )}
          </button>
        </div>
      )}
      {step !== 1 && step !== 4 && (
        <div className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(step - 1)}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            <TbArrowLeft size={60} />
          </button>
        </div>
      )}

      <div className="flex w-full flex-grow flex-col gap-[30px] overflow-y-auto bg-white px-[10px] py-[20px] backdrop-blur-[10px] dark:bg-white/10 sm:h-[80dvh] sm:flex-grow-0 sm:rounded-[10px] md:rounded-[40px] md:px-[30px] lg:w-10/12 lg:px-[60px] xl:w-8/12">
        {step === 1 && (
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
                          error={validateDateUri(intPropInput)}
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
                      <div className="relative w-full">
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
                          className="relative w-full bg-transparent text-base text-black dark:text-white"
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
                        <div className="pointer-events-none absolute right-3 top-1/2 w-fit -translate-y-1/2 text-black dark:text-gray-400">
                          <TbCalendarEventFilled size={22} />
                        </div>
                      </div>
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
                          error={validateTitle(intPropInput)}
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
                          error={validateDescription(intPropInput)}
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
            <div className="flex w-full flex-col gap-[30px]">
              <div className="flex w-full flex-col lg:flex-row">
                <div className="flex w-full flex-col items-center justify-between gap-[30px] md:flex-row lg:w-6/12">
                  <div className="flex w-full flex-row items-center justify-between md:w-6/12">
                    <p className="text-base font-semibold text-black dark:text-white">
                      Royalties
                    </p>
                    <div
                      onClick={() => setRoyaltySwitch(!royaltySwitch)}
                      className="relative h-[32px] w-[52px] cursor-pointer rounded-full bg-[#D0BCFF] px-[4px] py-[2px]"
                    >
                      <div
                        className={`absolute bottom-1/2 left-[4px] flex h-[24px] w-[24px] translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-t from-primary to-secondary text-white ${royaltySwitch ? "translate-x-[85%]" : ""}`}
                      >
                        {royaltySwitch && <TbCheck size={16} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-row items-center justify-between md:ml-auto md:w-6/12">
                    <p className="text-base font-semibold text-black dark:text-white">
                      percent %
                    </p>
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
                      className={`w-[60px] rounded-xl bg-background px-[10px] py-[5px] text-base text-black dark:bg-white/10 dark:text-white ${!royaltySwitch ? "cursor-not-allowed opacity-50" : ""}`}
                      disabled={!royaltySwitch}
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-[30px] lg:flex-row">
                <div className="flex w-full flex-col items-center justify-between gap-[30px] md:flex-row lg:w-6/12">
                  <div className="flex w-full flex-row items-center justify-between md:w-6/12">
                    <p className="text-base font-semibold text-black dark:text-white">
                      Publishing
                    </p>
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
                      className="relative h-[32px] w-[52px] cursor-pointer rounded-full bg-[#D0BCFF] px-[4px] py-[2px]"
                    >
                      <div
                        className={`absolute bottom-1/2 left-[4px] flex h-[24px] w-[24px] translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-t from-primary to-secondary text-white ${publishSwitch ? "translate-x-[85%]" : ""}`}
                      >
                        {publishSwitch && <TbCheck size={16} />}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex w-full flex-row items-center justify-between md:w-6/12">
                    <p className="text-base font-semibold text-black dark:text-white">
                      Country
                    </p>
                    <div
                      className={`w-fit ${!publishSwitch ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <ReactCountryDropdown
                        defaultCountry={DEFAULT_PUBLISHING.countryCode}
                        onSelect={(val) =>
                          setIntPropInput((intProp) => {
                            return {
                              ...intProp,
                              publishing: [
                                {
                                  date:
                                    fromNullable(intProp.publishing)?.date ??
                                    DEFAULT_PUBLISHING.date,
                                  countryCode: val.code,
                                },
                              ],
                            };
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-row items-center justify-between gap-[30px] lg:w-6/12 lg:justify-center">
                  <p className="text-base font-semibold text-black dark:text-white">
                    Date
                  </p>
                  <div
                    className={`relative max-w-[140px] rounded-lg bg-background px-4 py-1 dark:bg-white/10 ${!publishSwitch ? "pointer-events-none opacity-50" : ""}`}
                  >
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
                      className="relative bg-transparent text-base text-black dark:text-white"
                      calendarClassName="custom-calendar"
                      popperClassName="z-50 absolute right-[-220%] top-0"
                      placeholderText="YYYY-MM-DD"
                      disabled={!publishSwitch}
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-gray-400">
                      <TbCalendarEventFilled size={22} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex w-full grow flex-col items-center gap-[30px] sm:flex-grow-0">
            <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
              <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
                Step 2 : Validate Author Details
              </p>
              <div className="flex w-full flex-row items-center gap-1">
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
                <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-[40px] md:w-6/12">
              <UserImage
                principal={principal}
                className="size-[100px] rounded-full border bg-white"
              />
              <div className="flex w-full flex-col gap-[20px]">
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    First Name
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-base text-black dark:text-white"
                    value={user?.firstName}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Last Name
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-base text-black dark:text-white"
                    value={user?.lastName}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Nick Name
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-base text-black dark:text-white"
                    value={user?.nickName}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Speciality
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-base text-black dark:text-white"
                    value={user?.specialty}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Country
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-base text-black dark:text-white"
                    value={user?.countryCode}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {step == 3 && (
          <div className="flex w-full grow flex-col items-center gap-[30px] sm:flex-grow-0">
            <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
              <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
                Step 3 : Legal declaration
              </p>
              <div className="flex w-fit w-full flex-row items-center gap-1">
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
              </div>
            </div>
            <div className="flex h-full w-full flex-col items-center space-y-4 rounded-lg py-4 text-sm text-black dark:text-white sm:text-lg">
              <LegalDeclaration />
              <label className="flex flex-row items-center space-x-2 px-2">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                />
                <span>
                  I have read and agree to the legal declaration above.
                </span>
              </label>
            </div>
          </div>
        )}
        {step == 4 && ipId !== undefined && (
          <div className="flex w-full flex-grow flex-col items-center gap-[30px] sm:flex-grow-0">
            <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
              <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
                Step 4 : Success
              </p>
              <div className="flex w-fit w-full flex-row items-center gap-1">
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-[40px] pt-[20px]">
                <div className="flex flex-col items-center justify-center rounded-[40px] border-y-[2.5px] border-white/40 bg-white/10 px-3 py-4">
                  <div className="flex h-[240px] w-[240px] items-center justify-center rounded-[40px] bg-background md:h-[280px] md:w-[280px]">
                    {dataUri && (
                      <FilePreview
                        className="h-full w-full rounded-[40px] object-contain"
                        dataUri={dataUri}
                      />
                    )}
                  </div>
                  <p className="w-full py-[20px] text-center text-lg text-black dark:text-white md:text-2xl">
                    {intPropInput.title}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-[10px] text-center text-xl text-black dark:text-white md:text-3xl">
                  <p>Congratulations!</p>
                  <p>Your IP has been successfully created.</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-5 pt-[10px] md:w-fit md:flex-row">
                <button
                  onClick={() => {
                    navigate(`/bip/${ipId}`);
                  }}
                  className="rounded-xl border-2 border-primary bg-transparent px-6 py-3 text-xl text-primary"
                >
                  Manage IP
                </button>
                <ListButton
                  intPropId={ipId}
                  onSuccess={() => {
                    navigate(`/marketplace`);
                  }}
                  className="rounded-xl border-2 border-primary bg-gradient-to-t from-primary to-secondary px-6 py-3 text-xl text-white"
                >
                  List On Marketplace
                </ListButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewIPButton;
