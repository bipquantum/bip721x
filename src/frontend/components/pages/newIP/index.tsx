import { useEffect, useState } from "react";
import Select from "react-tailwindcss-select";
import { toast } from "react-toastify";
import {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";
import { useNavigate } from "react-router-dom";

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
  UserArgs,
} from "../../../../declarations/backend/backend.did";

import LampSvg from "../../../assets/lamp.svg";
import UserHandUpSvg from "../../../assets/user-hand-up.svg";
import CheckCircleSvg from "../../../assets/check-circle.svg";
import CheckVerifiedSvg from "../../../assets/check-verified.svg";
import AIBotImg from "../../../assets/ai-bot.jpeg";

// TODO sardariuss 2024-AUG-28: Use for loop to generate options
const IP_TYPE_OPTIONS: Option[] = [
  {
    label: intPropTypeToString({ PATENT: null }),
    value: intPropTypeToIndex({ PATENT: null }).toString(),
  },
  {
    label: intPropTypeToString({ IP_CERTIFICATE: null }),
    value: intPropTypeToIndex({ IP_CERTIFICATE: null }).toString(),
  },
  {
    label: intPropTypeToString({ COPYRIGHT: null }),
    value: intPropTypeToIndex({ COPYRIGHT: null }).toString(),
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
  intPropLicense: { NOT_APPLICABLE: null },
  intPropType: { PATENT: null },
  description: "",
  creationDate: BigInt(new Date().getTime()),
  publishingDate: BigInt(new Date().getTime()),
};

const EMPTY_USER = {
  firstName: "",
  lastName: "",
  nickName: "",
  specialty: "",
  country: "",
};

interface NewIPProps {
  principal: Principal | undefined;
}

const NewIP: React.FC<NewIPProps> = ({ principal }) => {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<UserArgs>(EMPTY_USER);
  const navigate = useNavigate();

  const [intPropInput, setIntPropInput] = useState<IntPropInput>(
    INITIAL_INT_PROP_INPUT,
  );

  const { data: queriedUser, call: queryUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: (principal ? [principal] : []) as [Principal],
  });

  const { call: createIntProp } = backendActor.useUpdateCall({
    functionName: "create_int_prop",
    onSuccess: (data) => {
      if (data === undefined) {
        toast.error("Failed to create new IP: no data returned");
      } else if ("err" in data) {
        toast.error("Failed to create new IP: " + data["err"]);
        console.log("error", data);
      } else {
        toast.success("Created new IP (identifier=" + data["ok"] + ")");
      }
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Failed to create new IP: " + error);
    },
  });

  const createIp = async () => {
    await createIntProp([intPropInput]);
    setStep(3);
  };

  useEffect(() => {
    queryUser();
  }, [principal]);

  useEffect(() => {
    setUser(fromNullable(queriedUser || []) || EMPTY_USER);
  }, [queriedUser]);

  const onCreateIPBtnClicked = () => {
    if (queriedUser === undefined || queriedUser?.length === 0) {
      toast.warn("Please add user");
      navigate("/profile");
      return;
    }
    setStep(1);
  };

  return (
    <div
      className={`flex h-full w-full flex-1 flex-col items-center justify-start gap-4 overflow-auto pt-32 ${step !== 0 && "bg-blue-400"}`}
    >
      {step === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 pb-32">
          <div className="w-96 text-center text-blue-400">
            Unlock the full potential of your intellectual property by listing
            it on bIPQuantum, where innovation meets opportunity.
          </div>
          <button
            className="w-72 rounded-full bg-blue-600 py-2 text-xl font-semibold text-white"
            onClick={() => onCreateIPBtnClicked()}
          >
            Create New IP
          </button>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-8 text-base text-white">
          <div className="flex flex-col gap-8">
            <div className="flex items-end justify-center gap-12">
              <div className="text-2xl font-bold">Create New IP</div>
              <div>Step {step} of 3</div>
            </div>
            <div className="flex w-full items-center justify-between gap-1">
              <img
                src={LampSvg}
                alt=""
                className={`h-6 cursor-pointer invert ${step === 1 ? "opacity-100" : "opacity-40"}`}
              />
              <div className="h-0 w-full border-b-[1px] border-t-[1px] border-dashed"></div>
              <img
                src={UserHandUpSvg}
                alt=""
                className={`h-6 cursor-pointer invert ${step === 2 ? "opacity-100" : "opacity-40"}`}
              />
              <div className="h-0 w-full border-b-[1px] border-t-[1px] border-dashed"></div>
              <img
                src={CheckCircleSvg}
                alt=""
                className={`h-6 cursor-pointer invert ${step === 3 ? "opacity-100" : "opacity-40"}`}
              />
            </div>
          </div>
          {step === 1 && (
            <>
              <div className="flex w-1/3 items-end justify-between gap-12">
                <div className="flex w-full flex-col gap-8">
                  <div className="flex flex-col gap-1">
                    <div className="px-4 font-semibold">Title of the IP</div>
                    <input
                      className="rounded-full px-4 py-2 text-gray-600 outline-none"
                      placeholder="Title of the IP"
                      value={intPropInput.title}
                      onChange={(e) => {
                        setIntPropInput({
                          ...intPropInput,
                          title: e.target.value,
                        });
                      }}
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
                          "rounded-full border border-gray-300 bg-white text-gray-600 flex items-center justify-between px-4",
                        menu: "border border-gray-300 bg-white text-gray-600 flex items-center justify-between absolute z-10 mx-4",
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
                          "rounded-full border border-gray-300 bg-white text-gray-600 flex items-center justify-between px-4",
                        menu: "border border-gray-300 bg-white text-gray-600 flex items-center justify-between absolute z-10 mx-4",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="px-4 font-semibold">
                      Upload Preview IP File (Preview SIZE LIMITED TO 1 GB)
                    </div>
                    <FileUploader
                      dataUri={intPropInput.dataUri}
                      setDataUri={(dataUri) => {
                        setIntPropInput({
                          ...intPropInput,
                          dataUri: dataUri ?? "",
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="px-4 font-semibold">Creation Date</div>
                    <input
                      className="rounded-full px-4 py-2 text-gray-600 outline-none"
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
                      className="rounded-full px-4 py-2 text-gray-600 outline-none"
                      placeholder=""
                      value={
                        new Date(Number(intPropInput.publishingDate))
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) => {
                        setIntPropInput({
                          ...intPropInput,
                          publishingDate: BigInt(
                            new Date(e.target.value).getTime(),
                          ),
                        });
                      }}
                      type="date"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-x-4">
                <button
                  className="w-32 rounded-full bg-gray-500 py-2 text-xl font-semibold text-white"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  className="w-64 rounded-full bg-blue-600 py-2 text-xl font-semibold text-white"
                  onClick={() => setStep(2)}
                >
                  Add Author Details
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex w-80 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">First Name</div>
                  <input
                    className="rounded-full px-4 py-2 text-gray-600 outline-none"
                    placeholder="Name"
                    defaultValue={user.firstName}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Last Name</div>
                  <input
                    className="rounded-full px-4 py-2 text-gray-600 outline-none"
                    placeholder="Family Name"
                    defaultValue={user.lastName}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Nick Name</div>
                  <input
                    className="rounded-full px-4 py-2 text-gray-600 outline-none"
                    placeholder="Nick Name"
                    defaultValue={user.nickName}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Speciality</div>
                  <input
                    className="rounded-full px-4 py-2 text-gray-600 outline-none"
                    placeholder="Speciality"
                    defaultValue={user.specialty}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Country</div>
                  <input
                    className="rounded-full px-4 py-2 text-gray-600 outline-none"
                    placeholder="Complete Postal Address"
                    defaultValue={user.country}
                    disabled
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-x-4">
                <button
                  className="w-32 rounded-full bg-gray-500 py-2 text-xl font-semibold text-white"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="w-64 rounded-full bg-blue-600 py-2 text-xl font-semibold text-white"
                  onClick={() => void createIp()}
                >
                  Add Author(s) Details
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="flex items-center gap-32">
              <img className="h-60 w-60 rounded-full" src={AIBotImg} alt="" />
              <div className="flex flex-col gap-6">
                <img
                  className="h-24 opacity-40 invert"
                  src={CheckVerifiedSvg}
                  alt=""
                />
                <p className="w-[320px] text-3xl uppercase text-white">
                  “Congratulations!
                  <br /> Your IP has been successfully minted and listed on the
                  bIPQuantum marketplace“
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewIP;
