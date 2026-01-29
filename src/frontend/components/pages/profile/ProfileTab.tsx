import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CreateUserArgs } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";
import SpinnerSvg from "../../../assets/spinner.svg";
import CountrySelect from "../../common/CountrySelect";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants";
import FileUploader from "../../common/FileUploader";
import FilePreview from "../../common/FilePreview";
import { FiUserPlus } from "react-icons/fi";
import { useAuth } from "@nfid/identitykit/react";
import WalletButton from "../../common/WalletButton";
import { useUser } from "../../common/UserContext";
import { useMixpanelTracking } from "../../hooks/useMixpanelTracking";

const DEFAULT_ARGS : CreateUserArgs = {
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
  const { user: authUser } = useAuth();
  const { user: userData, refetchUser } = useUser();
  const { trackProfileCreated, trackProfileUpdated } = useMixpanelTracking();
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

  const { call: updateUser } = backendActor.authenticated.useUpdateCall({
    functionName: "set_user",
  });

  // Update form when user data changes
  useEffect(() => {

    // create a new object every time
    const args = { ...DEFAULT_ARGS, ...userData };
    setUserArgs(args);

    // Set focused fields for non-empty values
    setFocusedFields({
      firstName: !!args.firstName,
      lastName: !!args.lastName,
      nickName: !!args.nickName,
      specialty: !!args.specialty,
      countryCode: !!args.countryCode,
    });
  }, [userData]);

  const onUpdateBtnClicked = async () => {
    setIsLoading(true);
    const isNewUser = !userData;

    await updateUser([userArgs]);
    refetchUser();

    // Track profile creation or update
    if (authUser) {
      const trackingData = {
        firstName: userArgs.firstName,
        lastName: userArgs.lastName,
        nickName: userArgs.nickName,
        specialty: userArgs.specialty,
        countryCode: userArgs.countryCode,
        hasImage: !!userArgs.imageUri,
      };

      if (isNewUser) {
        trackProfileCreated(authUser.principal, trackingData);
      } else {
        trackProfileUpdated(authUser.principal, trackingData);
      }
    }

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
                className="w-full rounded-lg bg-transparent px-4 pb-2 pt-5 text-base text-gray-900 placeholder-transparent outline-none dark:text-white"
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
                disabled={isLoading}
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
        {isLoading ? <img src={SpinnerSvg} alt="" /> : userData ? "Update User" : "Create User"}
      </button>
    </div>
  );
};

export default ProfileTab;
