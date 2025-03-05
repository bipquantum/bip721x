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
    <ThemeContext.Provider value={{ theme, setTheme: rawSetTheme }}>
      <div className="flex h-screen w-full flex-col sm:flex-row bg-background dark:bg-background-dark">
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
        {pathname !== "/login" && <TopBar />}
        {pathname !== "/login" && <MobileHeader />}
        <div className="flex h-full flex-row items-start justify-start">
          <div className="flex h-full w-fit items-center justify-center">
            <ChatHistory />
          </div>
          <Router />
        </div>
        {pathname !== "/login" && <MobileNavBar />}
      </div>
    </>
  );
}

export default App;
