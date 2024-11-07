import { useEffect, useState } from "react";
import Select from "react-tailwindcss-select";
import { toast } from "react-toastify";
import {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";

import { backendActor } from "../../actors/BackendActor";
import FileUploader from "../../common/FileUploader";
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
import {
  IntPropInput,
  User,
} from "../../../../declarations/backend/backend.did";

import LampSvg from "../../../assets/lamp.svg";
import UserHandUpSvg from "../../../assets/user-hand-up.svg";
import User1Svg from "../../../assets/user-1.svg";
import CheckVerifiedSvg from "../../../assets/check-verified.svg";
import AIBotImg from "../../../assets/ai-bot.png";
import SpinnerSvg from "../../../assets/spinner.svg";
import { ModalPopup } from "../../common/ModalPopup";
import { fromNullable } from "@dfinity/utils";
import ReactCountryDropdown from "react-country-dropdown";

// @ts-ignore
import { getName } from "country-list";
import { DEFAULT_COUNTRY_CODE } from "../../constants";

// TODO sardariuss 2024-AUG-28: Use for loop to generate options
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

const DEFAULT_PUBLISHING = {
  date: dateToTime(new Date()),
  countryCode: DEFAULT_COUNTRY_CODE,
};

const DEFAULT_PERCENTAGE_ROYALTIES = 2n;

interface NewIPModalProps {
  user: User;
  isOpen: boolean;
  onClose: (ipId: bigint | undefined) => void;
}

const NewIPModal: React.FC<NewIPModalProps> = ({ user, isOpen, onClose }) => {
  
  const [step,         setStep        ] = useState(1);
  const [isLoading,    setIsLoading   ] = useState(false);
  const [intPropInput, setIntPropInput] = useState<IntPropInput>(INITIAL_INT_PROP_INPUT);
  const [dataUri,      setDataUri     ] = useState("");
  const [ipId,         setIpId        ] = useState<bigint | undefined>(undefined);

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

  const createIp = async () => {
    setIsLoading(true);
    await createIntProp([intPropInput]);
    setIsLoading(false);
    setStep(3);
  };;

  useEffect(() => {
    setIntPropInput({ ...intPropInput, dataUri });
  }, [dataUri]);

  const getPublishingDate = (ip: IntPropInput) => {

    const publish = fromNullable(ip.publishing);

    if (publish !== undefined) {
      return toDateInputFormat(timeToDate(publish.date));
    }

    return "";
  }

  // Date input format is "yyyy-MM-dd"
  const toDateInputFormat = (date: Date) : string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Date output format is "yyyy-MM-dd"
  const fromDateInputFormat = (date: string) : Date => {
    // Create a new Date using the picked date parts to be in current timezone
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    return localDate;
  }

  return (
    <ModalPopup onClose={() => onClose(ipId)} isOpen={isOpen}>
      <div className="flex w-full flex-col items-center justify-start gap-8 overflow-auto border-white bg-primary py-6 text-base text-white sm:border-l">
        <div className="flex w-full items-center flex-col gap-1 w-full">
          <div className="flex flex-col items-center justify-around gap-3">
            <div className="text-2xl font-bold">Create New IP</div>
          </div>
          <div className="flex w-56 items-center justify-between">
            <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <img
                src={LampSvg}
                alt=""
                className={`h-6 ${step > 0 ? "opacity-100" : "opacity-10"}`}
              />
            </div>
            <div className="z-0 h-0 w-12 border-b-[1px] border-t-[1px] border-dashed"></div>
            <div
              className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${step > 1 ? "bg-white" : "bg-slate-400"}`}
            >
              <img
                src={UserHandUpSvg}
                alt=""
                className={`h-6 ${step > 1 ? "opacity-100" : "opacity-10"}`}
              />
            </div>
            <div className="z-0 h-0 w-12 border-b-[1px] border-t-[1px] border-dashed"></div>
            <div
              className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${step > 2 ? "bg-white" : "bg-slate-400"}`}
            >
              <img
                src={User1Svg}
                alt=""
                className={`h-6 ${step > 2 ? "opacity-100" : "opacity-10"}`}
              />
            </div>
          </div>
          <div>Step {step} of 3</div>
        </div>
        {step === 1 && (
          <>
            <div className="flex flex-col items-start justify-between gap-4 w-64 px-1">
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Title of the IP</div>
                <input
                  className="rounded-2xl w-full border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Title of the IP"
                  value={intPropInput.title}
                  onChange={(e) => {
                    setIntPropInput({
                      ...intPropInput,
                      title: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Description of the IP</div>
                <textarea
                  className="rounded-2xl w-full border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Description of the IP"
                  value={intPropInput.description}
                  onChange={(e) => {
                    setIntPropInput({
                      ...intPropInput,
                      description: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">IP Type</div>
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
                  placeholder="Select an option"
                  noOptionsMessage="No options found"
                  primaryColor="#ffffff"
                  classNames={{
                    menuButton: () =>
                      "rounded-2xl border-none bg-tertiary text-white flex items-center justify-between px-2",
                    menu: "border-none bg-tertiary text-white flex items-center justify-between absolute z-10 mx-4 py-2",
                    listItem: () => `px-2 py-1 cursor-pointer text-gray-300 hover:bg-gray-300 hover:text-blue-500`,
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">IP License</div>
                <Select
                  isMultiple={true}
                  value={
                    intPropInput.intPropLicenses.map((license) =>
                      IP_LICENSE_OPTIONS.find(
                        (option) =>
                          option.value === intPropLicenseToIndex(license).toString(),
                      ) ||
                      (() => {
                        throw new Error(`Invalid intPropLicense: ${license}`);
                      })()
                    )
                  }
                  onChange={(selectedOptions: SelectValue) =>
                    setIntPropInput({
                      ...intPropInput,
                      intPropLicenses: (selectedOptions as Option[]).map((option) =>
                        intPropLicenseFromIndex(Number(option.value))
                      ),
                    })
                  }
                  options={IP_LICENSE_OPTIONS}
                  placeholder="Select options"
                  noOptionsMessage="No options found"
                  primaryColor="#ffffff"
                  classNames={{
                    menuButton: () =>
                      "rounded-2xl border-none bg-tertiary text-white flex items-center justify-between px-2",
                    menu: "border-none bg-tertiary text-white flex items-center justify-between absolute z-10 mx-4 py-2",
                    listItem: () => `px-2 py-1 cursor-pointer text-gray-300 hover:bg-gray-300 hover:text-blue-500`,
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">
                  Upload IP File (SIZE LIMITED TO 1.5 MB)
                </div>
                <FileUploader
                  dataUri={intPropInput.dataUri}
                  setDataUri={(dataUri) => {
                    setDataUri(dataUri ?? "");
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Creation Date</div>
                <input
                  className="rounded-2xl border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder=""
                  value={
                    (toDateInputFormat(timeToDate(intPropInput.creationDate)))
                  }
                  onChange={(e) => {                    
                    setIntPropInput({
                      ...intPropInput,
                      creationDate: dateToTime(fromDateInputFormat(e.target.value)),
                    });
                  }}
                  type="date"
                />
              </div>
              <div className="flex flex-col gap-1 border border-white border rounded-2xl p-1 w-full space-y-1">
                <label className="flex flex-row items-center justify-between cursor-pointer">
                  <div className="px-4 font-semibold">Royalties</div>
                  <input type="checkbox" value="" className="sr-only peer" onClick={() => setIntPropInput((intProp) => {
                    return {...intProp, percentageRoyalties: fromNullable(intProp.percentageRoyalties) ? [] : [DEFAULT_PERCENTAGE_ROYALTIES]};
                  })} />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"/>
                </label>
                {
                  fromNullable(intPropInput.percentageRoyalties) !== undefined && (
                    <div className="flex flex-row items-center gap-1 justify-between">
                      <div className="px-4 font-semibold">Percentage</div>
                      <input
                        className="flex rounded-2xl border-none bg-tertiary px-4 py-2 text-white outline-none w-20"
                        placeholder=""
                        value={fromNullable(intPropInput.percentageRoyalties)?.toString()}
                        onChange={(e) => {
                          setIntPropInput((intProp) => {
                            return {...intProp, percentageRoyalties: [BigInt(e.target.value)] };
                          });
                        }}
                        max={20}
                        min={1}
                        type="number"
                      />
                    </div>
                  )
                }
              </div>
              <div className="flex flex-col gap-1 border border-white border rounded-2xl p-1 w-full space-y-1">
                <label className="flex flex-row items-center justify-between items-center cursor-pointer">
                  <div className="px-4 font-semibold">Publishing</div>
                  <input type="checkbox" value="" className="sr-only peer" onClick={() => setIntPropInput((intProp) => {
                    return {...intProp, publishing: fromNullable(intProp.publishing) ? [] : [DEFAULT_PUBLISHING]};
                  })} />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"/>
                </label>
                {
                  fromNullable(intPropInput.publishing) !== undefined && ( 
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex flex-row items-center gap-1 justify-between">
                      <div className="px-4 font-semibold">Date</div>
                      <input
                        className="rounded-2xl border-none bg-tertiary px-4 py-2 text-white outline-none"
                        placeholder=""
                        value={ getPublishingDate(intPropInput) }
                        onChange={(e) => {
                          setIntPropInput((intProp) => {
                            return {...intProp, publishing: [{
                              date: dateToTime(fromDateInputFormat(e.target.value)),
                              countryCode: fromNullable(intProp.publishing)?.countryCode ?? DEFAULT_PUBLISHING.countryCode
                            }]};
                          })
                        }}
                        type="date"
                      />
                    </div>
                    <div className="flex flex-row items-center gap-1 justify-between">
                      <div className="px-4 font-semibold">Country</div>
                      <ReactCountryDropdown 
                        defaultCountry={DEFAULT_PUBLISHING.countryCode}
                        onSelect={(val) => setIntPropInput((intProp) => {
                          return {...intProp, publishing: [{
                            date: fromNullable(intProp.publishing)?.date ?? DEFAULT_PUBLISHING.date,
                            countryCode: val.code
                          }]};
                        })}
                      />
                    </div>
                  </div>
                  )
                }
              </div>
            </div>
            <button
              className="w-56 rounded-2xl bg-secondary py-2 text-lg font-semibold text-white sm:w-64"
              onClick={() => {
                if (intPropInput.title === "") {
                  toast.warn("Please add title of the IP");
                  return;
                }
                setStep(2);
              }}
            >
              Add Author Details
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="flex flex-col items-start justify-between gap-4 w-64 px-1">
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">First Name</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Name"
                  defaultValue={user.firstName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Last Name</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Family Name"
                  defaultValue={user.lastName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Nick Name</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Nick Name"
                  defaultValue={user.nickName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Speciality</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Speciality"
                  defaultValue={user.specialty}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="px-4 font-semibold">Country</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Country"
                  defaultValue={getName(user.countryCode)}
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-col flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <button
                className="w-32 rounded-2xl bg-gray-500 py-2 text-lg font-semibold text-white"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="flex w-64 items-center justify-center rounded-2xl bg-secondary py-2 text-lg font-semibold text-white"
                onClick={() => void createIp()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <img src={SpinnerSvg} alt="" />
                ) : (
                  "Validate Author(s) Details"
                )}
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="flex flex-col items-center sm:gap-4">
            <img
              className="rounded-[32px] md:w-1/2"
              src={AIBotImg}
              alt=""
            />
            <div className="flex flex-row items-center">
              <img
                className="w-36 sm:h-48 sm:w-48"
                src={CheckVerifiedSvg}
                alt=""
              />
              <p className="w-[320px] text-center text-2xl font-semibold text-white sm:text-start sm:text-3xl">
                Congratulations!
                <br /> Your IP has been successfully minted!
              </p>
            </div>
          </div>
        )}
      </div>
    </ModalPopup>
  );
};

export default NewIPModal;
