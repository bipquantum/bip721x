import DefaultProfileImage from "../../assets/profile.png";

import { useEffect, useState } from "react";
import { User } from "../../../declarations/backend/backend.did";
import { backendActor } from "../actors/BackendActor";
import { fromNullable } from "@dfinity/utils";

import { Principal } from "@dfinity/principal";

// Global cache invalidation mechanism
let globalCacheKey = Date.now();
const profileUpdateListeners = new Set<() => void>();

export const invalidateUserCache = () => {
  globalCacheKey = Date.now();
  profileUpdateListeners.forEach(listener => listener());
};

interface UserImageProps {
  principal: Principal | undefined;
  className?: string;
}

const UserImage = ({ principal, className }: UserImageProps) => {
  const [user, setUser] = useState<User | undefined>(undefined);

  const { data: queriedUser, call: refetchUser } = backendActor.useQueryCall({
    functionName: "get_user",
    args: principal !== undefined ? [principal] : undefined,
  });

  // Listen for profile updates
  useEffect(() => {
    const listener = () => {
      // Force refetch when cache is invalidated
      if (principal) {
        refetchUser([principal]);
      }
    };
    
    profileUpdateListeners.add(listener);
    return () => {
      profileUpdateListeners.delete(listener);
    };
  }, [principal, refetchUser]);

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
