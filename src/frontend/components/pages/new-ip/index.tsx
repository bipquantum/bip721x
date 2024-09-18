import { useEffect, useState } from "react";
import Select from "react-tailwindcss-select";
import { toast } from "react-toastify";
import {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";
import { Link, useNavigate } from "react-router-dom";

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
import AIBotImg from "../../../assets/ai-bot.png";
import SpinnerSvg from "../../../assets/spinner.svg";

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
  publishingDate: [BigInt(new Date().getTime())],
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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    await createIntProp([intPropInput]);
    setIsLoading(false);
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
      className={`flex h-full w-full flex-1 flex-col items-center justify-start gap-4 overflow-auto bg-white`}
    >
      {step === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-6 pb-32 text-primary-text">
          <p className="w-96 text-center text-2xl font-semibold leading-10">
            Unlock the full potential of your intellectual property by listing
            it on bIPQuantum, where innovation meets opportunity.
          </p>
          <button
            className="w-80 rounded-2xl bg-secondary py-2 text-xl font-semibold text-white"
            onClick={() => onCreateIPBtnClicked()}
          >
            Create New IP
          </button>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-start gap-16 border-l-[1px] border-white bg-primary py-6 text-base text-white">
          <div className="flex w-72 flex-col gap-8">
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">Name Your IP</p>
              <div>Step {step} of 3</div>
            </div>
            <div className="flex w-full items-center justify-between gap-1">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <img
                  src={LampSvg}
                  alt=""
                  className={`h-6 ${step > 0 ? "opacity-100" : "opacity-10"}`}
                />
              </div>
              <div
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${step > 1 ? "bg-white" : "bg-slate-400"}`}
              >
                <img
                  src={UserHandUpSvg}
                  alt=""
                  className={`h-6 ${step > 1 ? "opacity-100" : "opacity-10"}`}
                />
              </div>
              <div
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full ${step > 2 ? "bg-white" : "bg-slate-400"}`}
              >
                <img
                  src={CheckCircleSvg}
                  alt=""
                  className={`h-6 ${step > 2 ? "opacity-100" : "opacity-10"}`}
                />
              </div>
              <div className="absolute z-0 h-0 w-72 border-b-[1px] border-t-[1px] border-dashed"></div>
            </div>
          </div>
          {step === 1 && (
            <>
              <div className="flex w-1/3 items-end justify-between gap-12">
                <div className="flex w-full flex-col gap-8 text-base">
                  <div className="flex flex-col gap-1">
                    <div className="px-4 font-semibold">Title of the IP</div>
                    <input
                      className="bg-tertiary rounded-2xl border border-none px-4 py-2 text-white outline-none"
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
                          "rounded-2xl border-none bg-tertiary bg-white text-white flex items-center justify-between px-2",
                        menu: "border-none bg-white bg-tertiary text-white flex items-center justify-between absolute z-10 mx-4 py-2",
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
                          "rounded-2xl border-none bg-tertiary bg-white text-white flex items-center justify-between px-2",
                        menu: "border-none bg-white bg-tertiary text-white flex items-center justify-between absolute z-10 mx-4 py-2",
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
                      className="bg-tertiary rounded-2xl border-none px-4 py-2 text-white outline-none"
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
                      className="bg-tertiary rounded-2xl border-none px-4 py-2 text-white outline-none"
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
                  className="w-32 rounded-2xl bg-gray-500 py-2 text-lg font-semibold text-white"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  className="w-64 rounded-2xl bg-secondary py-2 text-lg font-semibold text-white"
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
                    className="bg-tertiary rounded-2xl border border-none px-4 py-2 text-white outline-none"
                    placeholder="Name"
                    defaultValue={user.firstName}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Last Name</div>
                  <input
                    className="bg-tertiary rounded-2xl border border-none px-4 py-2 text-white outline-none"
                    placeholder="Family Name"
                    defaultValue={user.lastName}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Nick Name</div>
                  <input
                    className="bg-tertiary rounded-2xl border border-none px-4 py-2 text-white outline-none"
                    placeholder="Nick Name"
                    defaultValue={user.nickName}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Speciality</div>
                  <input
                    className="bg-tertiary rounded-2xl border border-none px-4 py-2 text-white outline-none"
                    placeholder="Speciality"
                    defaultValue={user.specialty}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="px-4 font-semibold">Country</div>
                  <input
                    className="bg-tertiary rounded-2xl border border-none px-4 py-2 text-white outline-none"
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
                    "Add Author(s) Details"
                  )}
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-8">
                <img
                  className="h-[462px] w-[447px] rounded-[32px]"
                  src={AIBotImg}
                  alt=""
                />
                <div className="flex flex-col gap-6">
                  <img className="h-48 w-48" src={CheckVerifiedSvg} alt="" />
                  <p className="w-[320px] text-3xl uppercase text-white">
                    Congratulations!
                    <br /> Your IP has been successfully minted and listed on
                    the bIPQuantum marketplace.
                  </p>
                </div>
              </div>
              {/* <Link to="/bips" className="text-xl">
                Back to marketplace
              </Link> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewIP;
