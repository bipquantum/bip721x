import { SetStateAction, useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";

import { useLocation, useNavigate } from "react-router-dom";
import { useChatHistory } from "../../layout/ChatHistoryContext";
import FilePreview from "../../common/FilePreview";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { backendActor } from "../../actors/BackendActor";

import Select, { ActionMeta, GroupBase, MultiValue, OptionProps } from "react-select";
import { components } from "react-select";

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
  intPropLicenseFromIndex,
  intPropLicenseToIndex,
  intPropLicenseToString,
  intPropTypeFromIndex,
  intPropTypeToIndex,
  intPropTypeToString,
  timeToDate,
} from "../../../utils/conversions";

// @ts-ignore
// import { getName } from "country-list";
import {
  DEFAULT_COUNTRY_CODE,
  MAX_ROYALTY_PERCENTAGE,
  MIN_ROYALTY_PERCENTAGE,
} from "../../constants";
import SuperJSON from "superjson";
import FileUploader from "../../common/FileUploader";
import { fromNullable, toNullable } from "@dfinity/utils";
import { JSX } from "react/jsx-runtime";
import { MiddlewareReturn } from "@floating-ui/core";
import { MiddlewareState } from "@floating-ui/dom";

interface NewIPButtonProps {
  principal: Principal | undefined;
}

// Custom Syles For React Select Dropdown
const customStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    fontSize: "16px",
    padding: "10px",
    color: "#fff",
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
    color: "#fff",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#aaa",
  }),
};

// Custom Multi-Select Checkbox Component
const CustomMultiValue = (
  props: JSX.IntrinsicAttributes &
    OptionProps<unknown, boolean, GroupBase<unknown>>,
) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className="mr-3 h-4 w-4"
      />
      {props.label}
    </components.Option>
  );
};

const NewIPButton: React.FC<NewIPButtonProps> = ({ principal }) => {

  const navigate = useNavigate();
  const { addChat } = useChatHistory();
  const [createIp, setCreateIp] = useState<boolean>(false);
  const toastShownRef = useRef(false);

  const onIpCreated = (ipId: bigint | undefined) => {
    setCreateIp(false);
    if (ipId) {
      navigate(`/bip/${ipId}`);
    }
  };

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
    const storedValue = sessionStorage.getItem("intPropInput");
    return storedValue
      ? SuperJSON.parse<IntPropInput>(storedValue)
      : INITIAL_INT_PROP_INPUT;
  };

  const loadDataUri = () => {
    const storedValue = sessionStorage.getItem("dataUri");
    return storedValue ? storedValue : "";
  };

  const loadRoyaltiesVisible = () => {
    const storedValue = sessionStorage.getItem("royaltiesVisible");
    return storedValue ? JSON.parse(storedValue) : false;
  };

  const save = (
    intPropInput: IntPropInput,
    dataUri: string,
    royaltiesVisible: boolean,
  ) => {
    sessionStorage.setItem("intPropInput", SuperJSON.stringify(intPropInput));
    sessionStorage.setItem("dataUri", dataUri);
    sessionStorage.setItem(
      "royaltiesVisible",
      JSON.stringify(royaltiesVisible),
    );
  };

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

  // TODO sardariuss 2024-AUG-28: Use for loop to generate options
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

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [ipId, setIpId] = useState<bigint | undefined>(undefined);
  const [intPropInput, setIntPropInput] =
    useState<IntPropInput>(loadIntPropInput());
  const [dataUri, setDataUri] = useState<string>(loadDataUri());
  const [royaltiesVisible, setRoyaltiesVisible] = useState<boolean>(
    loadRoyaltiesVisible(),
  );

  const [royaltySwitch, setRoyaltySwitch] = useState(false);
  const [publishSwitch, setPublishSwitch] = useState(false);

  const getPublishingDate = (ip: IntPropInput) => {
    const publish = fromNullable(ip.publishing);

    if (publish !== undefined) {
      return toDateInputFormat(timeToDate(publish.date));
    }

    return "";
  };

  // Date input format is "yyyy-MM-dd"
  const toDateInputFormat = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Date output format is "yyyy-MM-dd"
  const fromDateInputFormat = (date: string): Date | undefined => {
    // Create a new Date using the picked date parts to be in current timezone
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    // Check if the date is valid
    if (
      localDate.getFullYear() !== year ||
      localDate.getMonth() + 1 !== month ||
      localDate.getDate() !== day
    ) {
      return undefined;
    }
    if (!Number.isFinite(localDate.getTime())) {
      return undefined;
    }
    return localDate;
  };

  const { call: createIntProp } = backendActor.useUpdateCall({
    functionName: "create_int_prop",
    onSuccess: (data) => {
      if (data === undefined) {
        toast.error("Failed to create new IP: no data returned");
      } else if ("err" in data) {
        toast.error("Failed to create new IP: " + data["err"]);
        console.error("error", data);
      } else {
        setIpId(data["ok"]);
      }
    },
    onError: (error) => {
      console.error("error", error);
      toast.error("Failed to create new IP: " + error);
    },
  });

  const createIps = async () => {
    setIsLoading(true);
    await createIntProp([intPropInput]);
    setIsLoading(false);
    setStep(3);
  };

  const DEFAULT_PUBLISHING = {
    date: dateToTime(new Date()),
    countryCode: DEFAULT_COUNTRY_CODE,
  };

  ///////////////////////////

  const { pathname } = useLocation();

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: (principal ? [principal] : []) as [Principal],
  });

  useEffect(() => {
    if (
      (queriedUser === undefined || queriedUser?.length === 0) &&
      !toastShownRef.current
    ) {
      toastShownRef.current = true; // Set flag to true after first toast
      navigate("/profile", { state: { redirect: pathname } });
      toast.warn("Please add user");
    }
  }, [queriedUser, pathname, navigate]);

  if (!queriedUser || queriedUser.length === 0) return null;

  const onList = () => {
    navigate("/bips");
  };

  return (
    <div className={`relative flex h-full w-full md:items-center justify-center `}>
      {step === 1 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => {
              if (intPropInput.title === "") {
                toast.warn("Please add title of the IP");
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
            onClick={() => void createIps()}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            {isLoading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-transparent dark:border-t-black border-t-white"></div>
            ) : (
              <TbArrowRight size={60} />
            )}
          </button>
        </div>
      )}
      {step !== 1 && (
        <div className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(step - 1)}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            <TbArrowLeft size={60} />
          </button>
        </div>
      )}

      <div className="mx-[10px] flex h-[80vh] w-full flex-col gap-[30px] overflow-y-auto rounded-[10px] bg-white px-[10px] py-[20px] backdrop-blur-[10px] dark:bg-white/10 sm:h-[85vh] md:rounded-[40px] md:px-[30px] lg:w-10/12 lg:px-[60px] xl:w-8/12">
        {step === 1 && (
          <div className="flex w-full flex-col items-center gap-[30px] overflow-x-hidden">
            <div className="flex flex-col items-center gap-[15px]">
              <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
                STep 1 : Create new IP
              </p>
              <div className="flex w-full flex-row items-center gap-1">
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-gradient-to-t from-primary to-secondary lg:min-w-[200px]" />
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-[#C4C4C4] lg:min-w-[200px]" />
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-[#C4C4C4] lg:min-w-[200px]" />
              </div>
            </div>
            <div className="flex w-full flex-col gap-[30px]">
              <div className="flex w-full flex-col gap-2">
                <p className="w-fit rounded-lg bg-background px-6 py-2 text-sm uppercase text-black dark:bg-white/10 dark:text-white">
                  {" "}
                  Preview{" "}
                </p>
                <div
                  className={`${dataUri ? "w-fit" : "w-[360px]"} h-[180px] rounded-lg bg-gray-800 dark:bg-gray-200`}
                >
                  {
                    dataUri && (
                      <FilePreview
                        dataUri={dataUri}
                        className="h-[180px] w-auto rounded-lg"
                      />
                    )
                  }
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
                        IP File
                      </p>
                      <label className="flex h-full w-full items-center justify-between p-4 text-[16px] text-black dark:text-white">
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
                        ></FileUploader>
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
                        Creation Date
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
                          className="w-full relative bg-transparent text-[16px] text-black dark:text-white"
                          calendarClassName="custom-calendar"
                          popperClassName="z-50"
                          popperModifiers={[
                            {
                              name: "preventOverflow",
                              options: {
                                boundariesElement: "viewport",
                                padding: 8, // Keep some padding from the edge
                              },
                              fn: function (state: MiddlewareState): MiddlewareReturn | Promise<MiddlewareReturn> {
                                throw new Error("Function not implemented.");
                              }
                            },
                            {
                              name: "flip",
                              options: {
                                fallbackPlacements: ["top", "bottom", "left", "right"], // Flip to any side if needed
                              },
                              fn: function (state: MiddlewareState): MiddlewareReturn | Promise<MiddlewareReturn> {
                                throw new Error("Function not implemented.");
                              }
                            },
                            {
                              name: "offset",
                              options: {
                                offset: [0, 8], // Small vertical offset from the input
                              },
                              fn: function (state: MiddlewareState): MiddlewareReturn | Promise<MiddlewareReturn> {
                                throw new Error("Function not implemented.");
                              }
                            },
                          ]}
                        />
                        <div className="pointer-events-none absolute w-fit right-3 top-1/2 -translate-y-1/2 text-black dark:text-gray-400">
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
                        Title of Tthe IP
                      </p>
                      <input
                        type="text"
                        value={intPropInput.title}
                        onChange={(e) => {
                          setIntPropInput({
                            ...intPropInput,
                            title: e.target.value,
                          });
                        }}
                        required
                        className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
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
                        Description of the IP
                      </p>
                      <textarea
                        value={intPropInput.description}
                        onChange={(e) => {
                          setIntPropInput({
                            ...intPropInput,
                            description: e.target.value,
                          });
                        }}
                        required
                        className="h-[54px] bg-transparent px-[15px] pt-[16px] text-[16px] text-black focus:outline-none dark:text-white"
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
                        IP Type
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
                        styles={customStyles}
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
                        IP License
                      </p>
                      <Select
                        styles={customStyles}
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
                        onChange={(newValue: MultiValue<Option | Option[]>, actionMeta: ActionMeta<Option | Option[]>) => {
                          const selectedOptions = newValue as Option[];  // Assuming multiple options
                          setIntPropInput({
                            ...intPropInput,
                            intPropLicenses: selectedOptions.map(
                              (option) => intPropLicenseFromIndex(Number(option.value))
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
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      Royalties
                    </p>
                    <div
                      onClick={() => setRoyaltySwitch(!royaltySwitch)}
                      className="relative h-[32px] w-[52px] cursor-pointer rounded-full bg-[#D0BCFF] px-[4px] py-[2px]"
                    >
                      <div
                        className={`absolute bottom-1/2 left-[4px] flex h-[24px] w-[24px] translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-t from-primary to-secondary text-white ${royaltySwitch ? "translate-x-[85%]" : ""}`}
                      >
                        <TbCheck size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-row items-center justify-between md:ml-auto md:w-6/12">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      percent %
                    </p>
                    <input
                      value={
                        fromNullable(intPropInput.percentageRoyalties) !==
                        undefined
                          ? Number(
                              fromNullable(intPropInput.percentageRoyalties),
                            )
                          : 0
                      }
                      onChange={(e) => {
                        const value =
                          Number(e.target.value) >= MIN_ROYALTY_PERCENTAGE
                            ? BigInt(
                                Math.min(
                                  Number(e.target.value),
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
                      className="w-[60px] rounded-xl bg-background px-[10px] py-[5px] text-[16px] text-black dark:bg-white/10 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-[30px] lg:flex-row">
                <div className="flex w-full flex-col items-center justify-between gap-[30px] md:flex-row lg:w-6/12">
                  <div className="flex w-full flex-row items-center justify-between md:w-6/12">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
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
                        <TbCheck size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex w-full flex-row items-center justify-between md:w-6/12">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      Country
                    </p>
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
                <div className="flex w-full flex-row items-center justify-between gap-[30px] lg:w-6/12 lg:justify-center">
                  <p className="text-[16px] font-semibold text-black dark:text-white">
                    Date
                  </p>
                  <div className="relative max-w-[140px] rounded-lg bg-background px-4 py-1 dark:bg-white/10">
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
                      className="bg-transparent relative text-[16px] text-black dark:text-white"
                      calendarClassName="custom-calendar"
                      popperClassName="z-50 absolute right-[-220%] top-0"
                      placeholderText="YYYY-MM-DD"
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
          <div className="flex w-full flex-col items-center gap-[30px]">
            <div className="flex flex-col items-center gap-[15px]">
              <p className="font-extabold font-monument text-sm md:text-lg uppercase text-black dark:text-white">
                STep 2 : Validate Author Details
              </p>
              <div className="flex w-full flex-row items-center gap-1">
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-gradient-to-t from-primary to-secondary lg:min-w-[200px]" />
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-gradient-to-t from-primary to-secondary lg:min-w-[200px]" />
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-[#C4C4C4] lg:min-w-[200px]" />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-[40px] md:w-6/12">
              <div className="size-[100px] rounded-full border bg-white">
                <FilePreview
                  dataUri={
                    queriedUser[0]?.imageUri ||
                    "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                  }
                  className={"h-[80px] md:h-[100px] w-[80px] md:w-[100px] rounded-full bg-white"}
                />
              </div>
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
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={queriedUser[0]?.firstName}
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
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={queriedUser[0]?.lastName}
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
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={queriedUser[0]?.nickName}
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
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={queriedUser[0]?.specialty}
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
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={queriedUser[0]?.countryCode}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {step == 3 && (
          <div className="flex w-full flex-col items-center gap-[30px]">
            <div className="flex flex-col items-center gap-[15px]">
              <p className="font-extabold font-monument text-sm md:text-lg uppercase text-black dark:text-white">
                STep 3 : Success
              </p>
              <div className="flex w-fit flex-row items-center gap-1">
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-gradient-to-t from-primary to-secondary lg:min-w-[200px]" />
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-gradient-to-t from-primary to-secondary lg:min-w-[200px]" />
                <div className="h-[4px] w-[80px] md:w-[100px] rounded-full bg-gradient-to-t from-primary to-secondary lg:min-w-[200px]" />
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-[40px] pt-[20px]">
                <div className="rounded-[40px] border-y-[2.5px] border-white/40 bg-white/10 px-3 py-4">
                  <div className="h-full max-h-[240px] md:h-[280px] max-w-[240px] md:w-[280px] overflow-hidden rounded-[40px] bg-background">
                    {dataUri && <FilePreview className="md:max-h-[280px] max-h-[240px] md:max-w-[280px] max-w-[240px] w-auto rounded-lg" dataUri={dataUri} />}
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
                    save(intPropInput, dataUri, royaltiesVisible);
                    onIpCreated(ipId);
                  }}
                  className="rounded-xl border-2 border-primary bg-transparent px-6 py-3 text-xl text-primary"
                >
                  Manage IPs
                </button>
                <button
                  onClick={() => {
                    save(intPropInput, dataUri, royaltiesVisible);
                    onList();
                  }}
                  className="rounded-xl border-2 border-primary bg-gradient-to-t from-primary to-secondary px-6 py-3 text-xl text-white"
                >
                  List On Marketplace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewIPButton;
