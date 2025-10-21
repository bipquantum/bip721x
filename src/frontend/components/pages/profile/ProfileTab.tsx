import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fromNullable } from "@dfinity/utils";
import { CreateUserArgs } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";
import SpinnerSvg from "../../../assets/spinner.svg";
import CountrySelect from "../../common/CountrySelect";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants";
import FileUploader from "../../common/FileUploader";
import FilePreview from "../../common/FilePreview";
import { FiUserPlus, FiLogOut } from "react-icons/fi";
import { useAuth } from "@nfid/identitykit/react";
import WalletButton from "../../common/WalletButton";
import { invalidateUserCache } from "../../common/UserImage";

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

const ProfileTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, disconnect } = useAuth();
  const [focusedFields, setFocusedFields] = useState<{
    [key: string]: boolean;
  }>({});

  const handleFocus = (fieldName: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName: string, value: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: !!value }));
  };

  const redirect = useLocation().state?.redirect;
  const navigate = useNavigate();

  const [userArgs, setUserArgs] = useState<CreateUserArgs>(DEFAULT_ARGS);
  const [userKey, setUserKey] = useState<string>("");

  const { data: queriedUser, call: queryUser } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_user",
    args: user ? [user.principal] : undefined,
  });

  const { call: updateUser } = backendActor.authenticated.useUpdateCall({
    functionName: "set_user",
  });

  useEffect(() => {
    if (user) {
      const newUserKey = user.principal.toText();
      if (userKey !== newUserKey) {
        setUserArgs(DEFAULT_ARGS);
        setFocusedFields({});
        setUserKey(newUserKey);
        setTimeout(() => {
          queryUser();
        }, 100);
      }
    }
  }, [user?.principal.toText(), userKey, queryUser]);

  useEffect(() => {
    var args: CreateUserArgs = DEFAULT_ARGS;
    const userData = fromNullable(queriedUser || []);

    if (userData) {
      args.firstName = userData.firstName;
      args.lastName = userData.lastName;
      args.nickName = userData.nickName;
      args.specialty = userData.specialty;
      args.countryCode = userData.countryCode;
      args.imageUri = userData.imageUri;
    }

    setUserArgs(args);

    // Set focused fields for non-empty values
    setFocusedFields({
      firstName: !!args.firstName,
      lastName: !!args.lastName,
      nickName: !!args.nickName,
      specialty: !!args.specialty,
      countryCode: !!args.countryCode,
    });
  }, [queriedUser]);

  const onUpdateBtnClicked = async () => {
    setIsLoading(true);
    await updateUser([userArgs]);
    await queryUser();

    invalidateUserCache();

    toast.success("User information added/updated!");
    setIsLoading(false);
    if (redirect) {
      navigate(redirect);
    }
  };

  return (
    <div className="flex w-full flex-col items-center space-y-4">
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
          <div className="flex flex-row items-center gap-2 sm:gap-3">
            <WalletButton />
            <button
              className="flex items-center justify-center rounded-full p-3 text-black dark:text-white"
              onClick={() => {
                disconnect();
                navigate("/");
              }}
              title="Disconnect"
            >
              <FiLogOut size={20} color="currentColor" />
            </button>
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
                  ? "-top-[15%] text-sm text-gray-700 dark:text-gray-200"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}
            >
              {field.label}
            </p>

            {field.name === "countryCode" ? (
              <CountrySelect
                value={userArgs.countryCode}
                onChange={(countryCode) => {
                  setUserArgs({ ...userArgs, countryCode });
                  handleBlur("countryCode", countryCode);
                }}
              />
            ) : field.name !== "imageUri" ? (
              <input
                className="w-full rounded-lg bg-transparent px-4 pb-2 pt-5 text-base text-gray-400 placeholder-transparent outline-none"
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
        className="flex min-h-12 w-48 flex-col items-center justify-center rounded-full bg-gradient-to-t from-primary to-secondary text-sm uppercase text-white"
        onClick={() => onUpdateBtnClicked()}
        disabled={isLoading}
      >
        {isLoading ? <img src={SpinnerSvg} alt="" /> : "Add/Update User"}
      </button>
    </div>
  );
};

export default ProfileTab;
