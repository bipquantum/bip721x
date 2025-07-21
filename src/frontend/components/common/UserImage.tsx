import DefaultProfileImage from "../../assets/profile.png";

import { useEffect, useState } from "react";
import { User } from "../../../declarations/backend/backend.did";
import { backendActor } from "../actors/BackendActor";
import { fromNullable } from "@dfinity/utils";

import { Principal } from "@dfinity/principal";

interface UserImageProps {
  principal: Principal | undefined;
  className?: string;
}

const UserImage = ({ principal, className }: UserImageProps) => {
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
      src={
        user !== undefined && user.imageUri !== ""
          ? user.imageUri
          : DefaultProfileImage
      }
      className={className ?? "h-10 w-10 rounded-full object-cover"}
    />
  );
};

export default UserImage;
