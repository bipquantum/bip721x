import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { backendActor } from "../../actors/BackendActor";
import { showCreditsDepletedToast } from "./CreditsDepletedToast";
import { Result_3 } from "../../../../declarations/backend/backend.did";

interface AuthTokenContextType {
  authToken: string | undefined;
  refreshAuthToken: (args?: []) => Promise<Result_3 | undefined>;
  invalidateToken: () => void;
}

const AuthTokenContext = createContext<AuthTokenContextType | undefined>(undefined);

export const useAuthToken = () => {
  const context = useContext(AuthTokenContext);
  if (!context) {
    throw new Error("useAuthToken must be used within AuthTokenProvider");
  }
  return context;
};

interface AuthTokenProviderProps {
  children: ReactNode;
}

export const AuthTokenProvider: React.FC<AuthTokenProviderProps> = ({
  children,
}) => {

  const [authToken, setAuthToken] = useState<string | undefined>(undefined);

  const { call: refreshAuthToken, ready: backendReady } = backendActor.authenticated.useUpdateCall({
    functionName: "get_chatbot_ephemeral_token",
    onSuccess: (data) => {
      if (data === undefined){
        console.error("Failed to get auth token: undefined response");
        return;
      } else if ('err' in data) {
        console.error(`Failed to get auth token: ${data.err}`);

        // Check if this is a rate limit / credits exceeded error
        if (data.err.includes("Rate limit exceeded") || data.err.includes("Insufficient credits")) {
          showCreditsDepletedToast();
        }
        return;
      }
      console.log("✓ Obtained ephemeral auth token response");

      // Parse the JSON response to extract the token
      try {
        const tokenData = JSON.parse(data.ok);

        // Check if the response contains an error from OpenAI
        if (tokenData.error) {
          console.error(`❌ OpenAI API error: ${JSON.stringify(tokenData.error)}`);
        }

        // Extract the token
        if (!tokenData.value) {
          console.error(`❌ Invalid token response structure: ${JSON.stringify(tokenData)}`);
          return;
        }

        setAuthToken(tokenData.value);
        console.log(`✓ Extracted ephemeral token: ${tokenData.value.substring(0, 20)}...`);
      } catch (parseError: any) {
        console.error(`❌ Failed to parse token response: ${parseError.message}`);
        console.error(`Full raw response: ${data.ok}`);
        return;
      }
    },
    onError: (error) => {
      console.error("Error getting ephemeral token:", error);
    },
  });

  const invalidateToken = () => {
    setAuthToken(undefined);
  };

  useEffect(() => {
    console.log("AuthTokenProvider detected backend ready:", backendReady);
    if (backendReady && !authToken) {
      console.log("Refreshing auth token on mount");
      refreshAuthToken();
    };
  }, [backendReady]);

  // Auto-invalidate token after 55 seconds
  useEffect(() => {
    if (!authToken) {
      return;
    }

    // TODO: do not use hardcoded timeout, instead parse expiry from token response
    const timerId = setTimeout(() => {
      console.log("Auth token expired after 55 seconds");
      setAuthToken(undefined);
    }, 55000);

    return () => {
      clearTimeout(timerId);
    };
  }, [authToken]);

  const value: AuthTokenContextType = {
    authToken,
    refreshAuthToken,
    invalidateToken,
  };

  return (
    <AuthTokenContext.Provider value={value}>
      {children}
    </AuthTokenContext.Provider>
  );
};
