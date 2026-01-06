import DefaultProfileImage from "../../assets/profile.png";
import { useUser } from "./UserContext";
import { useEffect, useState } from "react";
import { User } from "../../../declarations/backend/backend.did";
import { backendActor } from "../actors/BackendActor";
import { fromNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";

interface UserImageProps {
  principal?: Principal; // Optional: if provided, shows that user; if not, shows current user
  className?: string;
}

const UserImage = ({ principal, className }: UserImageProps) => {
  const { user: currentUser } = useUser();
  const [otherUser, setOtherUser] = useState<User | null>(null);

  // If principal is provided, fetch that user's data
  const { data: queriedUser } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_user",
    args: principal ? [principal] : undefined,
  });

  useEffect(() => {
    if (principal && queriedUser !== undefined) {
      setOtherUser(fromNullable(queriedUser) || null);
    }
  }, [principal, queriedUser]);

  // Use otherUser if principal was provided, otherwise use currentUser
  const user = principal ? otherUser : currentUser;

  return (
    <img
      src={
        user && user.imageUri !== ""
          ? user.imageUri
          : DefaultProfileImage
      }
      className={className ?? "h-10 w-10 rounded-full object-cover"}
    />
  );
};

export default UserImage;
