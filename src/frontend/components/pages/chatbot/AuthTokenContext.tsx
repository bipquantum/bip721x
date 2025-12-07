import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { backendActor } from "../../actors/BackendActor";

interface AuthTokenContextType {
  authToken: string | undefined;
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

  const { call: refreshAuthToken } = backendActor.authenticated.useQueryCall({
    functionName: "get_chatbot_ephemeral_token",
    onSuccess: (data) => {
      if (data === undefined){
        console.error("Failed to get auth token: undefined response");
        return;
      } else if ('err' in data) {
        console.error(`Failed to get auth token: ${data.err}`);
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

  useEffect(() => {
    refreshAuthToken();
  }, []);
  
  const value: AuthTokenContextType = {
    authToken,
  };

  return (
    <AuthTokenContext.Provider value={value}>
      {children}
    </AuthTokenContext.Provider>
  );
};
