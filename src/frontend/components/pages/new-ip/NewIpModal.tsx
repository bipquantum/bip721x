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
  intPropLicenseFromIndex,
  intPropLicenseToIndex,
  intPropLicenseToString,
  intPropTypeFromIndex,
  intPropTypeToIndex,
  intPropTypeToString,
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
  intPropLicense: { GAME_FI: null },
  intPropType: { COPYRIGHT: null },
  description: "",
  creationDate: BigInt(new Date().getTime()),
  publishingDate: [BigInt(new Date().getTime())],
};

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
        console.log("error", data);
      } else {
        setIpId(data["ok"]);
      }
    },
    onError: (error) => {
      console.log("error", error);
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

  return (
    <ModalPopup onClose={() => onClose(ipId)} isOpen={isOpen}>
      <div className="flex w-full flex-col items-center justify-start gap-8 overflow-auto border-white bg-primary py-6 text-base text-white sm:border-l">
        <div className="flex w-full items-center flex-col gap-1">
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
            <div className="flex w-11/12 items-end justify-between gap-12 w-3/4">
              <div className="flex w-full flex-col gap-4 text-base">
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Title of the IP</div>
                  <input
                    className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
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
                <div className="flex flex-col gap-1">
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
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">IP License</div>
                  <Select
                    value={
                      IP_LICENSE_OPTIONS.find(
                        (option) =>
                          option.value ===
                          intPropLicenseToIndex(
                            intPropInput.intPropLicense,
                          ).toString(),
                      ) ||
                      (() => {
                        throw new Error(
                          `Invalid intPropType: ${intPropInput.intPropLicense}`,
                        );
                      })()
                    }
                    onChange={(selectedOptions: SelectValue) =>
                      setIntPropInput({
                        ...intPropInput,
                        intPropLicense: intPropLicenseFromIndex(
                          Number((selectedOptions as Option).value),
                        ),
                      })
                    }
                    options={IP_LICENSE_OPTIONS.filter(
                      (option) =>
                        option.value !==
                        intPropLicenseToIndex(
                          intPropInput.intPropLicense,
                        ).toString(),
                    )}
                    placeholder="Select an option"
                    noOptionsMessage="No options found"
                    primaryColor="#ffffff"
                    classNames={{
                      menuButton: () =>
                        "rounded-2xl border-none bg-tertiary text-white flex items-center justify-between px-2",
                      menu: "border-none bg-tertiary text-white flex items-center justify-between absolute z-10 mx-4 py-2",
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
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
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Creation Date</div>
                  <input
                    className="rounded-2xl border-none bg-tertiary px-4 py-2 text-white outline-none"
                    placeholder=""
                    value={
                      new Date(Number(intPropInput.creationDate))
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        creationDate: BigInt(
                          new Date(e.target.value).getTime(),
                        ),
                      });
                    }}
                    type="date"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Publish Date</div>
                  <input
                    className="rounded-2xl border-none bg-tertiary px-4 py-2 text-white outline-none"
                    placeholder=""
                    value={
                      new Date(Number(intPropInput.publishingDate))
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        publishingDate: [
                          BigInt(new Date(e.target.value).getTime()),
                        ],
                      });
                    }}
                    type="date"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-x-4">
              <button
                className="w-24 rounded-2xl bg-gray-500 py-2 text-lg font-semibold text-white sm:w-32"
                onClick={() => setStep(0)}
              >
                Back
              </button>
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
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="flex w-80 flex-col gap-4 text-base">
              <div className="flex flex-col gap-1">
                <div className="px-4 font-semibold">First Name</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Name"
                  defaultValue={user.firstName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 font-semibold">Last Name</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Family Name"
                  defaultValue={user.lastName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 font-semibold">Nick Name</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Nick Name"
                  defaultValue={user.nickName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 font-semibold">Speciality</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Speciality"
                  defaultValue={user.specialty}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 font-semibold">Country</div>
                <input
                  className="rounded-2xl border border-none bg-tertiary px-4 py-2 text-white outline-none"
                  placeholder="Complete Postal Address"
                  defaultValue={user.country}
                  disabled
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-x-4">
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
