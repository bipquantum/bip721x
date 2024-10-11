import { createContext, useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Router from "./router";
import NavBar from "./layout/NavBar";
import { AgentProvider } from "@ic-reactor/react";
import { BackendActorProvider } from "./actors/BackendActor"
import { IcpLedgerActorProvider} from "./actors/IcpLedgerActor"
import { Icrc7ActorProvider } from './actors/Icrc7Actor';

import "react-toastify/dist/ReactToastify.css";
import MobileNavBar from "./layout/MobileNavBar";

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

  return (
    <ThemeContext.Provider value={{ theme, setTheme: rawSetTheme }}>
      <div className="flex h-screen w-full flex-col sm:flex-row">
        <AgentProvider withProcessEnv>
          <BackendActorProvider>
            <IcpLedgerActorProvider>
              <Icrc7ActorProvider>
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </Icrc7ActorProvider>
            </IcpLedgerActorProvider>
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
      <NavBar />
      <div className="flex h-full w-full flex-1 flex-col justify-end">
        <Router />
        {pathname !== "/" && pathname !== "/login" && <MobileNavBar />}
      </div>
    </>
  );
}

export default App;
