import { useEffect, useState } from "react";
import { useAuth } from "@ic-reactor/react";
import { toast } from "react-toastify";
import { fromNullable } from "@dfinity/utils";

import { UserArgs } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";
import CopyToClipboard from "../../common/CopyToClipboard";

import ProfileSvg from "../../../assets/profile.png";
import SpinnerSvg from "../../../assets/spinner.svg";

const EMPTY_USER = {
  firstName: "",
  lastName: "",
  nickName: "",
  specialty: "",
  country: "",
};

const ProfileFields: {
  label: string;
  placeholder: string;
  name: keyof UserArgs;
}[] = [
  { label: "First Name", name: "firstName", placeholder: "John" },
  { label: "Last Name", name: "lastName", placeholder: "Doe" },
  { label: "Nick Name", name: "nickName", placeholder: "JohnDoe" },
  {
    label: "Speciality",
    name: "specialty",
    placeholder: "Blockchain strategic architect",
  },
  { label: "Country", name: "country", placeholder: "Canada" },
];

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authenticated, identity } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  const [user, setUser] = useState<UserArgs>(EMPTY_USER);

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
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4 overflow-auto bg-white font-semibold text-primary sm:gap-8">
      <img src={ProfileSvg} className={`h-32 rounded-full`} />
      <div className="flex gap-1 px-10 text-center text-sm">
        {identity?.getPrincipal().toString()}
        <CopyToClipboard copiedText={identity?.getPrincipal().toString()} />
      </div>

      <div className="flex w-80 flex-col gap-2 py-4 text-base text-primary-text sm:mt-4">
        {ProfileFields.map((field, index) => (
          <div className="flex w-full flex-col justify-start gap-2" key={index}>
            <div className="text-sm">{field.label}</div>
            <input
              className="w-full rounded-2xl border border-gray-300 bg-white bg-opacity-35 px-4 py-2 text-gray-600 placeholder-white outline-none"
              placeholder={field.placeholder}
              defaultValue={user[field.name]}
              onChange={(e) => {
                const copiedUser = { ...user };
                copiedUser[field.name] = e.target.value;
                setUser(copiedUser);
              }}
            />
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
