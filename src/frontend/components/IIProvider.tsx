import React, { useState, useEffect } from "react";
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "@internet-identity-labs/react-ic-ii-auth";
import { useDispatch } from "react-redux";
import { signIn, toggleAuthenticating } from "../store/authReducer";
import getActor from "../../utils/getActor";
import { setSmallScreen } from "../store/appReducer";

const IIProvider = ({ children }) => {
  const DFX_NETWORK = process.env.DFX_NETWORK || "local";
  const dispatch = useDispatch(signIn());
  const { signout, authenticate, isAuthenticated, identity } =
    useInternetIdentity();

  // Function to check if the screen is small
  const checkScreenSize = () => {
    dispatch(setSmallScreen({ isSmallScreen: window.innerWidth < 768 }));
  };

  // Add event listener when component mounts to track window width changes
  useEffect(() => {
    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize); // Listen for window resize
    return () => {
      window.removeEventListener("resize", checkScreenSize); // Cleanup on unmount
    };
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  useEffect(() => {
    processInitialAuth();
  }, []);

  useEffect(() => {
    processAuth();
  }, [isAuthenticated]);

  const processAuth = async () => {
    if (isAuthenticated) {
      const createdActor = await getActor(identity);
      dispatch(
        signIn({
          actor: createdActor,
          userAccountPrincipal: identity,
        })
      );
    }
  };

  const processInitialAuth = async () => {
    dispatch(toggleAuthenticating());
    try {
      if (isAuthenticated) {
        await authenticate();
        await processAuth();
      }
    } catch (error) {
      console.log("ERROR: ", error);
      // TODO: handle error
    } finally {
      dispatch(toggleAuthenticating());
    }
  };

  const handleIISuccess = async (principal) => {
    console.log("PR: ", principal);
    const actor = await getActor(principal);

    dispatch(
      signIn({
        actor,
        userAccountPrincipal: principal,
      })
    );
  };

  return (
    <InternetIdentityProvider
      authClientOptions={{
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider:
          DFX_NETWORK === "local"
            ? `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943?#authorize`
            : "https://identity.ic0.app/#authorize",
        windowOpenerFeatures:
          `left=${window.screen.width / 2 - 525 / 2}, ` +
          `top=${window.screen.height / 2 - 705 / 2},` +
          `toolbar=0,location=0,menubar=0,width=525,height=705`,
        onSuccess: (principal) => {
          handleIISuccess(principal);
        },
      }}
    >
      {children}
    </InternetIdentityProvider>
  );
};
export default IIProvider;
