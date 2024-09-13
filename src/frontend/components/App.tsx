import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "@ic-reactor/react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Router from "./router";
import NavBar from "./layout/NavBar";

import "react-toastify/dist/ReactToastify.css";

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: (theme) => console.warn("no theme provider"),
});

function App() {
  const [theme, setTheme] = useState("light");

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
      <div className="flex h-screen w-full">
        <BrowserRouter>
          <ToastContainer />
          <NavBar />
          <Router />
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
