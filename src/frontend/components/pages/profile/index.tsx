import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fromNullable } from "@dfinity/utils";

import { CreateUserArgs, User } from "../../../../declarations/backend/backend.did.js";
import CopyToClipboard from "../../common/CopyToClipboard.js";

import ProfileSvg from "../../../assets/profile.png";
import SpinnerSvg from "../../../assets/spinner.svg";
import ReactCountryDropdown from "react-country-dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants.js";
import FileUploader from "../../common/FileUploader.js";
import FilePreview from "../../common/FilePreview.js";
import { useActors } from "../../common/ActorsContext.js";
import { ConnectWallet, useIdentity } from "@nfid/identitykit/react";

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

  const redirect = useLocation().state?.redirect;
  const navigate = useNavigate();

  const [userArgs, setUserArgs] = useState<CreateUserArgs>(DEFAULT_ARGS);

  const { authenticated } = useActors();
  const identity = useIdentity();

  useEffect(() => {
    if (identity && authenticated) {
      console.log("Querying user");
      authenticated.backend.get_user(identity.getPrincipal()).then((user) => {
        console.log("User queried", user);
        setUserArgs(toArgs(fromNullable(user)));
      });
    }
  }, [authenticated, identity]);

  const onUpdateBtnClicked = async () => {
    setIsLoading(true);
    if (authenticated){
      let res = await authenticated.backend.set_user(userArgs);
      console.log(res);
    };
    toast.success("User information added/updated!");
    setIsLoading(false);
    if (redirect) {
      navigate(redirect);
    }
  };

  const toArgs = (user: User | undefined): CreateUserArgs => {
    if (user) {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        nickName: user.nickName,
        specialty: user.specialty,
        countryCode: user.countryCode,
        imageUri: user.imageUri,
      };
    }
    return DEFAULT_ARGS;
  }

  return (
    !identity || !authenticated ? <ConnectWallet/> :
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
          <FilePreview dataUri={userArgs.imageUri} className="h-20 w-20 sm:h-32 sm:w-32 rounded-full object-cover" /> : 
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
                value={userArgs[field.name]} // Use `value` instead of `defaultValue`
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
