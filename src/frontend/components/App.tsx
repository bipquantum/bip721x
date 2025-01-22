import { createContext, useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Router from "./router";
import NavBar from "./layout/NavBar";
import { AgentProvider } from "@ic-reactor/react";
import { BackendActorProvider } from "./actors/BackendActor"
import { BqcLedgerActorProvider} from "./actors/BqcLedgerActor"
import { Bip721LedgerActorProvider } from './actors/Bip721LedgerActor';

import "react-toastify/dist/ReactToastify.css";
import MobileNavBar from "./layout/MobileNavBar";
import { ChatHistoryProvider } from "./layout/ChatHistoryContext";
import { BalanceProvider } from "./common/BalanceContext";
import AirdropBanner, { AirdropBannerProvider } from "./common/AirdropBanner";
import MobileHeader from "./layout/MobileHeader";

import { canisterId as backendId } from "../../declarations/backend/index.js";

import { IdentityKitProvider } from "@nfid/identitykit/react"
import { IdentityKitSignerConfig, InternetIdentity, MockedSigner, NFIDW, OISY, Plug, Stoic } from "@nfid/identitykit";
import { ActorsProvider } from "./common/ActorsContext.js";

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
        : rawSetTheme(initialTheme || "light");
    }, []);

    useEffect(() => {
      window.localStorage.setItem("color-theme", theme);
    }, [theme]);
  }

  const mockedSignerProviderUrl = import.meta.env.VITE_MOCKED_SIGNER_PROVIDER_URL
  const nfidSignerProviderUrl = import.meta.env.VITE_MOCKED_NFID_SIGNER_PROVIDER_URL
  const environment = import.meta.env.VITE_ENVIRONMENT

  const nfidw: IdentityKitSignerConfig = { ...NFIDW, providerUrl: nfidSignerProviderUrl }
  const signers = [nfidw, Plug, InternetIdentity, Stoic, OISY].concat(
    environment === "dev"
      ? [
          {
            ...MockedSigner,
            providerUrl: mockedSignerProviderUrl,
          },
        ]
      : []
  )
  
  console.log("mockedSignerProviderUrl: ", mockedSignerProviderUrl)
  console.log("nfidSignerProviderUrl: ", nfidSignerProviderUrl)
  console.log("environment: ", environment)
  console.log("backendId: ", backendId)

  return (
    <ThemeContext.Provider value={{ theme, setTheme: rawSetTheme }}>
      <div className="flex h-screen w-full flex-col sm:flex-row">
        <AgentProvider withProcessEnv>
          <BackendActorProvider>
            <BqcLedgerActorProvider>
              <Bip721LedgerActorProvider>
                <BrowserRouter>
                  <ChatHistoryProvider>
                    <BalanceProvider>
                      <AirdropBannerProvider>
                        <IdentityKitProvider 
                          signers={signers}
                          featuredSigner={nfidw}
                          signerClientOptions={{
                            targets: [backendId],
                          }}
                        >
                          <ActorsProvider>
                            <AppContent />
                          </ActorsProvider>
                        </IdentityKitProvider>
                      </AirdropBannerProvider>
                    </BalanceProvider>
                  </ChatHistoryProvider>
                </BrowserRouter>
              </Bip721LedgerActorProvider>
            </BqcLedgerActorProvider>
          </BackendActorProvider>
        </AgentProvider>
      </div>
    </ThemeContext.Provider>
  );
}

function AppContent() {
  const location = useLocation(); // now that it's inside BrowserRouter, it should work
  const { pathname } = location;

  return (
    <>
      <ToastContainer />
      <AirdropBanner />
      <NavBar />
      <div className="flex h-full w-full flex-1 flex-col justify-end">
        {pathname !== "/login" && <MobileHeader /> }
        <Router />
        {pathname !== "/login" && <MobileNavBar />}
      </div>
    </>
  );
}

export default App;
