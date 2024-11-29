import { useEffect, useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { toast } from "react-toastify";
import { fromNullable, toNullable } from "@dfinity/utils";

import { CreateUserArgs } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";
import CopyToClipboard from "../../common/CopyToClipboard";

import ProfileSvg from "../../../assets/profile.png";
import SpinnerSvg from "../../../assets/spinner.svg";
import ReactCountryDropdown from "react-country-dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants";
import FileUploader from "../../common/FileUploader";
import FilePreview from "../../common/FilePreview";

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
  { label: "First Name", name: "firstName"   },
  { label: "Last Name",  name: "lastName"    },
  { label: "Nick Name",  name: "nickName"    },
  { label: "Speciality", name: "specialty"   },
  { label: "Country",    name: "countryCode" },
];

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authenticated, identity } = useAuth({});

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
    queryUser();
    toast.success("User information added/updated!");
    setIsLoading(false);
    if (redirect) {
      navigate(redirect);
    }
  };

  return (
    <div className="flex flex-col w-full h-full items-center justify-center overflow-auto bg-white font-semibold text-primary justify-between sm:justify-evenly p-2">
      <FileUploader
        setDataUri={(dataUri) => {
          if (dataUri !== null){
            setUserArgs({ ...userArgs, imageUri: dataUri });
          };
        }}
        acceptedFiles="image/*,audio/*,application/pdf,text/*"
      >
        { userArgs.imageUri !== "" ? 
          FilePreview({ dataUri: userArgs.imageUri, className:"h-20 w-20 sm:h-32 sm:w-32 rounded-full object-cover"}) : 
          <img src={ProfileSvg} className="h-16 w-16 sm:h-32 sm:w-32 rounded-full object-cover" />
        }
      </FileUploader>
      <div className="flex flex-row gap-0 sm:gap-1 text-center text-xs sm:text-sm items-center">
        {identity?.getPrincipal().toString()}
        <CopyToClipboard copiedText={identity?.getPrincipal().toString()} />
      </div>
      <div className="flex w-80 flex-col text-base text-primary-text sm:mt-4 gap-1">
        {ProfileFields.map((field, index) => (
          <div className="flex w-full flex-col justify-start sm:gap-2" key={index}>
            <div className="text-xs sm:text-sm">{field.label}</div>
            {
              field.name === "countryCode" ? 
              <ReactCountryDropdown defaultCountry={userArgs.countryCode} onSelect={(val) => setUserArgs({ ...userArgs, countryCode: val.code })} /> :
              field.name !== "imageUri" ?
              <input
                className="w-full text-sm sm:text-md rounded-2xl border border-gray-300 bg-white bg-opacity-35 px-4 py-2 text-gray-600 placeholder-white outline-none"
                defaultValue={userArgs[field.name]}
                onChange={(e) => {
                  const copiedUser = { ...userArgs };
                  const fieldName = field.name;
                  copiedUser[fieldName] = e.target.value;
                  setUserArgs(copiedUser);
                }}
              />:
              <></>
            }
          </div>
        ))}
      </div>
      <button
        className="flex w-[340px] items-center justify-center rounded-2xl bg-secondary py-2 text-lg text-white"
        onClick={() => onUpdateBtnClicked()}
        disabled={isLoading}
      >
        {isLoading ? <img src={SpinnerSvg} alt="" /> : "Add/Update User"}
      </button>
    </div>
  );
};

export default Profile;
