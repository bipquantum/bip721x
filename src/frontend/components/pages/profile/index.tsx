import { useEffect, useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { toast } from "react-toastify";
import { fromNullable } from "@dfinity/utils";

import { User } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";
import CopyToClipboard from "../../common/CopyToClipboard";

import ProfileSvg from "../../../assets/profile.png";
import SpinnerSvg from "../../../assets/spinner.svg";
import ReactCountryDropdown from "react-country-dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY_CODE } from "../../constants";

const EMPTY_USER = {
  firstName: "",
  lastName: "",
  nickName: "",
  specialty: "",
  countryCode: DEFAULT_COUNTRY_CODE,
};

const ProfileFields: {
  label: string;
  name: keyof User;
}[] = [
  { label: "First Name", name: "firstName" },
  { label: "Last Name", name: "lastName" },
  { label: "Nick Name", name: "nickName" },
  { label: "Speciality", name: "specialty"},
  { label: "Country", name: "countryCode" },
];

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authenticated, identity } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  const redirect = useLocation().state?.redirect;
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(EMPTY_USER);

  const { data: queriedUser, call: queryUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [identity?.getPrincipal()],
  });

  const { call: updateUser } = backendActor.useUpdateCall({
    functionName: "set_user",
    args: [user],
  });

  useEffect(() => {
    queryUser();
  }, [identity]);

  useEffect(() => {
    setUser(fromNullable(queriedUser || []) || EMPTY_USER);
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
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-white font-semibold text-primary sm:gap-8 mb-2">
      <img src={ProfileSvg} className={`h-16 sm:h-32 rounded-full mt-24 sm:mt-12`} />
      <div className="flex gap-1 px-10 text-center text-sm">
        {identity?.getPrincipal().toString()}
        <CopyToClipboard copiedText={identity?.getPrincipal().toString()} />
      </div>
      <div className="flex w-80 flex-col gap-2 py-4 text-base text-primary-text sm:mt-4">
        {ProfileFields.map((field, index) => (
          <div className="flex w-full flex-col justify-start gap-2" key={index}>
            <div className="text-sm">{field.label}</div>
            {
              field.name === "countryCode" ? 
              <ReactCountryDropdown defaultCountry={user.countryCode} onSelect={(val) => setUser({ ...user, countryCode: val.code })} /> :
              <input
                className="w-full rounded-2xl border border-gray-300 bg-white bg-opacity-35 px-4 py-2 text-gray-600 placeholder-white outline-none"
                defaultValue={user[field.name]}
                onChange={(e) => {
                  const copiedUser = { ...user };
                  copiedUser[field.name] = e.target.value;
                  setUser(copiedUser);
                }}
              />
            }
          </div>
        ))}
      </div>
      <button
        className="flex w-[340px] items-center justify-center rounded-2xl bg-secondary py-2 text-lg text-white"
        onClick={() => onUpdateBtnClicked()}
        disabled={isLoading}
      >
        {isLoading ? <img src={SpinnerSvg} alt="" /> : "+Add/Update User"}
      </button>
    </div>
  );
};

export default Profile;
