import { createContext, useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DfinitySvg from "../assets/dfinity.svg";

import Router from "./router";
import NavBar from "./layout/NavBar";
import "react-toastify/dist/ReactToastify.css";
import MobileNavBar from "./layout/MobileNavBar";
import { ChatHistoryProvider } from "./layout/ChatHistoryContext";
import CookieBanner, { CookieBannerProvider } from "./common/CookieBanner";
import TopBar from "./layout/TopBar";
import ChatHistory from "./layout/ChatHistory";
import { SearchProvider } from "./common/SearchContext";
import { NotificationProvider } from "./common/NotificationContext";

import "@nfid/identitykit/react/styles.css"
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { IdentityKitAuthType, IdentityKitTransportType, InternetIdentity, NFIDW, Stoic } from "@nfid/identitykit";
import { ActorsProvider } from "./common/ActorsContext";
import googleIcon from "../assets/google.ico";
import { FungibleLedgerProvider } from "./contexts/FungibleLedgerContext";

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: (theme) => console.warn("no theme provider"),
});

function App() {
  const [theme, setTheme] = useState("dark");

  const rawSetTheme = (rawTheme: string) => {
    const root = window.document.documentElement;
    const isDark = rawTheme === "dark";

    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(rawTheme);
    setTheme(rawTheme);
  };

  if (typeof window !== "undefined") {
    useEffect(() => {
      const initialTheme = window.localStorage.getItem("color-theme");
      window.matchMedia("(prefers-color-scheme: dark)").matches && !initialTheme
        ? rawSetTheme("dark")
        : rawSetTheme(initialTheme || "dark");
    }, []);

    useEffect(() => {
      window.localStorage.setItem("color-theme", theme);
    }, [theme]);
  }

  useEffect(() => {
    // Set --vh to the actual viewport height on mobile
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  const isLocal = process.env.DFX_NETWORK === "local";
  const backendId = process.env.CANISTER_ID_BACKEND;
  const frontendId = process.env.CANISTER_ID_FRONTEND;

  // Local II configuration for local development
  const localInternetIdentity = {
    id: "LocalInternetIdentity",
    providerUrl: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,
    transportType: IdentityKitTransportType.INTERNET_IDENTITY,
    label: "Internet Identity",
    icon: DfinitySvg,
  };
  
  // Label and icon override for NFIDW to indicate Google login
  let nfidw = NFIDW;
  nfidw.description = undefined;
  nfidw.label = "Google (via NFID)";
  nfidw.icon = googleIcon;

  const signers = isLocal ? [localInternetIdentity] : [InternetIdentity, nfidw, Stoic];

  const signerClientOptions = {
    targets: backendId ? [backendId] : [],
    derivationOrigin: isLocal ? undefined: `https://${frontendId}.icp0.io`,
  };

  return (
    <div
      className="flex w-full flex-col bg-background dark:bg-background-dark sm:flex-row"
      style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}
    >
      <ThemeContext.Provider value={{ theme, setTheme: rawSetTheme }}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <IdentityKitProvider
            signerClientOptions={signerClientOptions}
            signers={signers}
            authType={IdentityKitAuthType.DELEGATION}
          >
            <ActorsProvider>
              <ChatHistoryProvider>
                <CookieBannerProvider>
                  <SearchProvider>
                    <NotificationProvider>
                      <FungibleLedgerProvider>
                        <AppContent />
                      </FungibleLedgerProvider>
                    </NotificationProvider>
                  </SearchProvider>
                </CookieBannerProvider>
              </ChatHistoryProvider>
            </ActorsProvider>
          </IdentityKitProvider>
        </BrowserRouter>
      </ThemeContext.Provider>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const { pathname } = location;

  // Custom hook to track page views
  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <>
      <ToastContainer />
      <CookieBanner />
      {/* Main Layout Container */}
      <div className="flex w-full flex-grow flex-col bg-background pl-0 dark:bg-background-dark sm:ml-20 sm:flex-grow-0 sm:flex-row">
        {!(pathname.includes("login") || pathname.includes("certificate")) && (
          <NavBar />
        )}

        {/* Main Content Wrapper */}
        <div className="flex w-full flex-grow flex-col items-center pb-16 pt-16 sm:pb-0 sm:pt-0">
          {!(
            pathname.includes("login") || pathname.includes("certificate")
          ) && <TopBar />}
          <div className="flex w-full flex-grow flex-row justify-between">
            <ChatHistory />
            <Router />
          </div>
          {!(
            pathname.includes("login") || pathname.includes("certificate")
          ) && <MobileNavBar />}
        </div>
      </div>
    </>
  );
}

export default App;
