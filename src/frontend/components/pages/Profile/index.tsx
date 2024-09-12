import { useAuth } from "@ic-reactor/react";
import { useEffect, useState } from "react";

import { UserArgs } from "../../../../declarations/backend/backend.did";
import { backendActor } from "../../actors/BackendActor";

import ProfileSvg from "../../../assets/profile.png";
import { toast } from "react-toastify";
import { fromNullable } from "@dfinity/utils";

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
    placeholder: "Blockchain stratgic architect",
  },
  { label: "Country", name: "country", placeholder: "Canada" },
];

function Profile() {
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
    await updateUser();
    queryUser();
    toast.success("User information added/updated!");
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8 overflow-auto">
      <img src={ProfileSvg} className={`h-24 w-24 rounded-full`} />
      <div className="text-sm text-blue-400">
        {identity?.getPrincipal().toString()}
      </div>
      <div className="mt-16 flex w-80 flex-col gap-2 bg-blue-400 px-6 py-4 text-base text-white">
        {ProfileFields.map((field, index) => (
          <div className="flex w-full flex-col justify-start gap-1" key={index}>
            <div className="text-sm">{field.label}</div>
            <input
              className="w-full rounded-md border-[1px] border-white border-opacity-35 bg-blue-300 bg-opacity-35 px-2 py-1 placeholder-white outline-none"
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
        className="w-[340px] rounded-full bg-blue-600 py-2 text-center text-lg text-white"
        onClick={() => onUpdateBtnClicked()}
      >
        +Add/Update User
      </button>
    </div>
  );
}

export default Profile;
