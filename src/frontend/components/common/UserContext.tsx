import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useAuth } from "@nfid/identitykit/react";
import { backendActor } from "../actors/BackendActor";
import { User } from "../../../declarations/backend/backend.did";
import { fromNullable } from "@dfinity/utils";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: queriedUser, call: fetchUser } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_user",
    args: authUser ? [authUser.principal] : undefined,
  });

  // Fetch user when authentication state changes
  useEffect(() => {
    if (authUser) {
      setIsLoading(true);
      fetchUser([authUser.principal]);
    } else {
      // Not authenticated - use default user (null)
      setUser(null);
      setIsLoading(false);
    }
  }, [authUser?.principal.toText()]);

  // Update user state when query completes
  useEffect(() => {
    if (queriedUser !== undefined) {
      const userData = fromNullable(queriedUser);
      // If get_user returns null, use default user (null)
      setUser(userData || null);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [queriedUser]);

  const refetchUser = () => {
    if (authUser) {
      setIsLoading(true);
      fetchUser([authUser.principal]);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
