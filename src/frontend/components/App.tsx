import { createContext, useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

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
import MobileHeader from "./layout/MobileHeader";
import TopBar from "./layout/TopBar";
import ChatHistory from "./layout/ChatHistory";

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

  return (
    <div className="flex min-h-screen h-screen w-full flex-col sm:flex-row bg-background dark:bg-background-dark">
      <ThemeContext.Provider value={{ theme, setTheme: rawSetTheme }}>
        <AgentProvider withProcessEnv>
          <BackendActorProvider>
            <BqcLedgerActorProvider>
              <Bip721LedgerActorProvider>
                <BrowserRouter>
                  <ChatHistoryProvider>
                    <BalanceProvider>
                      <AirdropBannerProvider>
                        <AppContent />
                      </AirdropBannerProvider>
                    </BalanceProvider>
                  </ChatHistoryProvider>
                </BrowserRouter>
              </Bip721LedgerActorProvider>
            </BqcLedgerActorProvider>
          </BackendActorProvider>
        </AgentProvider>
      </ThemeContext.Provider>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const { pathname } = location;

  return (
    <>
      <ToastContainer />
      <AirdropBanner />
      {/* Main Layout Container */}
      <div className="flex flex-col min-h-screen w-full sm:flex-row bg-background dark:bg-background-dark">

        { !(pathname.includes("login") || pathname.includes("certificate")) && <NavBar /> }

        {/* Main Content Wrapper */}
        <div className="flex flex-col w-full h-full items-center">
          { !(pathname.includes("login") || pathname.includes("certificate")) && <TopBar/>}
          <div className="flex flex-row w-full h-full overflow-y-auto items-center justify-between">
            <ChatHistory />
            <Router />
          </div>
          {/* Fixed Bottom Nav for Mobile */}
          { !(pathname.includes("login") || pathname.includes("certificate")) && <MobileNavBar /> }
        </div>
      </div>
    </>
  );
}

export default App;