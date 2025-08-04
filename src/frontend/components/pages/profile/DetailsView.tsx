import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fromNullable, toNullable } from "@dfinity/utils";

import { CreateUserArgs } from "../../../../declarations/backend/backend.did";
import CopyToClipboard from "../../common/CopyToClipboard";
import { useIdentity } from "@nfid/identitykit/react";
import { useActors } from "../../common/ActorsContext";

import ProfileSvg from "../../../assets/profile.png";
import ReactCountryDropdown from "react-country-dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants";
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
  { label: "First Name", name: "firstName" },
  { label: "Last Name", name: "lastName" },
  { label: "Nick Name", name: "nickName" },
  { label: "Speciality", name: "specialty" },
  { label: "Country", name: "countryCode" },
];

const DetailsView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const identity = useIdentity();
  const { authenticated } = useActors();
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

  useEffect(() => {
    if (authenticated && identity) {
      authenticated.backend.get_user(identity.getPrincipal()).then((user) => {
        var args: CreateUserArgs = DEFAULT_ARGS;
        const usr = fromNullable(user);

        if (usr) {
          args.firstName = usr.firstName;
          args.lastName = usr.lastName;
          args.nickName = usr.nickName;
          args.specialty = usr.specialty;
          args.countryCode = usr.countryCode;
          args.imageUri = usr.imageUri;
        }

        setUserArgs(args);
      }).catch((err) => {
        console.error("Error fetching user:", err);
      });
    }
  }, [authenticated, identity]);

  const onUpdateBtnClicked = async () => {
    if (!authenticated) return;
    
    setIsLoading(true);
    try {
      await authenticated.backend.set_user(userArgs);
      toast.success("User information added/updated!");
      if (redirect) {
        navigate(redirect);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user information.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden font-semibold text-black dark:text-white">
      <div className="h-[80dvh] w-fit overflow-hidden rounded-[40px] bg-white px-[20px] py-[40px] dark:bg-white/10">
        <div className="flex h-full flex-col items-center gap-[40px] overflow-y-auto">
          {userArgs.imageUri !== "" ? (
            FilePreview({
              dataUri: userArgs.imageUri,
              className: "h-[80px] w-[80px] rounded-full object-cover",
            })
          ) : (
            <img
              src={ProfileSvg}
              className="h-[80px] w-[80px] rounded-full object-cover"
            />
          )}

          <div className="flex flex-row items-center gap-0 px-4 text-center text-xs sm:text-sm">
            {identity?.getPrincipal().toString()}
            <CopyToClipboard copiedText={identity?.getPrincipal().toString()} />
          </div>
          <div className="flex w-8/12 flex-col gap-[30px] text-base">
            {ProfileFields.map((field, index) => (
              <div
                className="relative flex w-full flex-col rounded-lg border border-gray-300"
                key={index}
              >
                <p
                  className={`absolute left-4 bg-white px-1 text-xs transition-all duration-200 ease-in dark:bg-[#2f2f2f] ${
                    focusedFields[field.name] || userArgs[field.name]
                      ? "-top-[15%] text-sm text-black dark:text-gray-200"
                      : "top-1/2 -translate-y-1/2 text-sm text-black dark:text-gray-400"
                  }`}
                >
                  {field.label}
                </p>

                {/* Input or Dropdown */}
                {field.name === "countryCode" ? (
                  <ReactCountryDropdown
                    defaultCountry={userArgs.countryCode}
                    onSelect={(val) => {
                      setUserArgs({ ...userArgs, countryCode: val.code });
                      handleBlur("countryCode", val.code);
                    }}
                  />
                ) : field.name !== "imageUri" ? (
                  <input
                    className="w-full rounded-lg bg-transparent px-4 pb-2 pt-5 text-base text-gray-400 placeholder-transparent outline-none"
                    placeholder={field.label}
                    defaultValue={userArgs[field.name]}
                    disabled
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
        </div>
      </div>
    </div>
  );
};

export default DetailsView;
