import DefaultProfileImage from "../../assets/profile.png";

import { useEffect, useState } from "react";
import { User } from "../../../declarations/backend/backend.did";
import { backendActor } from "../actors/BackendActor";
import { fromNullable } from "@dfinity/utils";

import { Principal } from "@dfinity/principal";

interface UserImageProps {
    principal: Principal | undefined;
};

const UserImage = ({ principal }: UserImageProps) => {
  
  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: principal !== undefined ? [principal] : undefined,
  });

  useEffect(() => {
    if (queriedUser !== undefined) {
      setUser(fromNullable(queriedUser));
    } else {
      setUser(undefined);
    }
  }, [queriedUser]);

  return (
        <img
            src={user !== undefined && user.imageUri !== "" ? user.imageUri : DefaultProfileImage}
            className="h-10 rounded-full object-cover"
        />
    );
};

export default UserImage;
