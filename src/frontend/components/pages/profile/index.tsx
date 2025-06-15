import { useEffect, useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { toast } from "react-toastify";
import { fromNullable, toNullable } from "@dfinity/utils";

import { CreateUserArgs } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";
import CopyToClipboard from "../../common/CopyToClipboard";

import SpinnerSvg from "../../../assets/spinner.svg";
import ReactCountryDropdown from "react-country-dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants";
import FileUploader from "../../common/FileUploader";
import FilePreview from "../../common/FilePreview";

import { FiUserPlus } from "react-icons/fi";

const DEFAULT_ARGS = {
  firstName: "",
  lastName: "",
  nickName: "",
  specialty: "",
  countryCode: DEFAULT_COUNTRY_CODE,
  imageUri: "",
};

const ProfileFields: {
  label: string;
  name: keyof CreateUserArgs;
}[] = [
  { label: "First Name", name: "firstName" },
  { label: "Last Name", name: "lastName" },
  { label: "Nick Name", name: "nickName" },
  { label: "Speciality", name: "specialty" },
  { label: "Country", name: "countryCode" },
];

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authenticated, identity } = useAuth({});
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});

  const handleFocus = (fieldName: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName: string, value: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: !!value })); // Keep label up if input has content
  };

  if (!authenticated || !identity) {
    return <></>;
  }

  const redirect = useLocation().state?.redirect;
  const navigate = useNavigate();

  const [userArgs, setUserArgs] = useState<CreateUserArgs>(DEFAULT_ARGS);

  const { data: queriedUser, call: queryUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  const { call: updateUser } = backendActor.useUpdateCall({
    functionName: "set_user",
    args: [userArgs],
  });

  useEffect(() => {
    queryUser();
  }, [identity]);

  useEffect(() => {
    var args: CreateUserArgs = DEFAULT_ARGS;
    const user = fromNullable(queriedUser || []);

    if (user) {
      args.firstName = user.firstName;
      args.lastName = user.lastName;
      args.nickName = user.nickName;
      args.specialty = user.specialty;
      args.countryCode = user.countryCode;
      args.imageUri = user.imageUri;
    }

    setUserArgs(args);
  }, [queriedUser]);

  const onUpdateBtnClicked = async () => {
    setIsLoading(true);
    await updateUser();
    await queryUser();
    toast.success("User information added/updated!");
    setIsLoading(false);
    if (redirect) {
      navigate(redirect);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center space-y-4 font-semibold text-black dark:text-white p-4 overflow-y-auto">
      <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-5">
          <FileUploader
            setDataUri={(dataUri) => {
              if (dataUri !== null) {
                setUserArgs({ ...userArgs, imageUri: dataUri });
              }
            }}
            acceptedFiles="image/*,audio/*,application/pdf,text/*"
          >
            {userArgs.imageUri !== "" ? (
              FilePreview({
                dataUri: userArgs.imageUri,
                className: "h-[80px] w-[80px] rounded-full object-cover",
              })
            ) : (
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white text-primary dark:bg-white/10 lg:h-[100px] lg:w-[100px]">
                <FiUserPlus size={32} />
              </div>
            )}
          </FileUploader>
          <div className="flex flex-col gap-[5px] text-black dark:text-white">
            <div className="flex flex-row items-center gap-0 text-left text-xs text-gray-600 dark:text-gray-400 sm:text-sm md:text-center">
              <p className="w-10/12 pb-1 md:w-full">
                {identity?.getPrincipal().toString()}
              </p>
              <CopyToClipboard
                copiedText={identity?.getPrincipal().toString()}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-[30px] text-base md:grid-cols-2 lg:w-8/12">
        {ProfileFields.map((field, index) => (
          <div
            className="relative flex w-full flex-col rounded-lg border border-gray-300 p-1"
            key={index}
          >
            <p
              className={`absolute left-4 bg-background px-1 text-xs transition-all duration-200 ease-in dark:bg-background-dark ${
                focusedFields[field.name] || userArgs[field.name]
                  ? "-top-[15%] text-sm text-gray-200"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}
            >
              {field.label}
            </p>

            {/* Input or Dropdown */}
            {field.name === "countryCode" ? (
              <div className="country-dropdown-container">
                <ReactCountryDropdown
                  defaultCountry={userArgs.countryCode}
                  onSelect={(val) => {
                    setUserArgs({ ...userArgs, countryCode: val.code });
                    handleBlur("countryCode", val.code);
                  }}
                />
              </div>
            ) : field.name !== "imageUri" ? (
              <input
                className="sm:text-md w-full rounded-lg bg-transparent px-4 pb-2 pt-5 text-sm text-gray-400 placeholder-transparent outline-none"
                placeholder={field.label}
                defaultValue={userArgs[field.name]}
                onChange={(e) => {
                  const copiedUser = { ...userArgs };
                  const fieldName = field.name;
                  copiedUser[fieldName] = e.target.value;
                  setUserArgs(copiedUser);
                }}
                onFocus={() => handleFocus(field.name)}
                onBlur={(e) => handleBlur(field.name, e.target.value)}
              />
            ) : (
              <></>
            )}
          </div>
        ))}
      </div>
      <button
          className="text-nowrap rounded-full bg-gradient-to-t from-primary to-secondary py-3 text-sm uppercase text-white w-48 self-center"
          onClick={() => onUpdateBtnClicked()}
          disabled={isLoading}
        >
          {isLoading ? (
            <img src={SpinnerSvg} alt="" />
          ) : (
            "Add/Update User"
          )}
        </button>
    </div>
  );
};

export default Profile;
