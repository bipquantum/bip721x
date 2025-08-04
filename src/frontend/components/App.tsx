import { createContext, useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DfinitySvg from "../assets/dfinity.svg";

import Router from "./router";
import NavBar from "./layout/NavBar";
import { AgentProvider } from "@ic-reactor/react";
import { BackendActorProvider } from "./actors/BackendActor";
import { BqcLedgerActorProvider } from "./actors/BqcLedgerActor";
import { Bip721LedgerActorProvider } from "./actors/Bip721LedgerActor";

import "react-toastify/dist/ReactToastify.css";
import MobileNavBar from "./layout/MobileNavBar";
import { ChatHistoryProvider } from "./layout/ChatHistoryContext";
import { BalanceProvider } from "./common/BalanceContext";
import AirdropBanner, { AirdropBannerProvider } from "./common/AirdropBanner";
import TopBar from "./layout/TopBar";
import ChatHistory from "./layout/ChatHistory";
import { SearchProvider } from "./common/SearchContext";
import { NotificationProvider } from "./common/NotificationContext";

import "@nfid/identitykit/react/styles.css"
import { IdentityKitProvider } from "@nfid/identitykit/react"
import { IdentityKitTransportType, InternetIdentity, NFIDW, OISY, Stoic } from "@nfid/identitykit";
import { ActorsProvider } from "./common/ActorsContext";
import { canisterId as backendId } from "../../declarations/backend/index";

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
  const signers = isLocal ? [{
    id: "LocalInternetIdentity",
    providerUrl: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,
    transportType: IdentityKitTransportType.INTERNET_IDENTITY,
    label: "Internet Identity",
    icon: DfinitySvg,
  }] : [NFIDW, InternetIdentity, Stoic, OISY];
  const signerClientOptions = {
    targets: [backendId],
    derivationOrigin: isLocal ? undefined: "https://czzq6-byaaa-aaaap-akilq-cai.icp0.io",
  };

  return (
    <div
      className="flex w-full flex-col bg-background dark:bg-background-dark sm:flex-row"
      style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}
    >
      <ThemeContext.Provider value={{ theme, setTheme: rawSetTheme }}>
        <AgentProvider withProcessEnv>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <IdentityKitProvider
              signerClientOptions={signerClientOptions}
              signers={signers}
            >
              <ActorsProvider>
                <BackendActorProvider>
                  <BqcLedgerActorProvider>
                    <Bip721LedgerActorProvider>
                      <ChatHistoryProvider>
                        <BalanceProvider>
                          <AirdropBannerProvider>
                            <SearchProvider>
                              <NotificationProvider>
                                <AppContent />  
                              </NotificationProvider>
                            </SearchProvider>
                          </AirdropBannerProvider>
                        </BalanceProvider>
                      </ChatHistoryProvider>
                    </Bip721LedgerActorProvider>
                  </BqcLedgerActorProvider>
                </BackendActorProvider>
              </ActorsProvider>
            </IdentityKitProvider>
          </BrowserRouter>
        </AgentProvider>
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
      <AirdropBanner />
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
