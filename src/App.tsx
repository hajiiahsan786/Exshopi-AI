import React, { useEffect, useState } from "react";
import { useStore } from "./store/useStore";
import { AuthScreens } from "./components/AuthScreens";
import { DashboardLayout } from "./components/DashboardLayout";
import { AIAssistant } from "./components/AIAssistant";
import { RefreshCw } from "lucide-react";

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    lockScreenLocked,
    sessionExpired,
    setSessionExpired,
    addLog,
    theme,
    fontFamily
  } = useStore();

  const [initializing, setInitializing] = useState(true);

  // Initial user state load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        
        addLog({
          method: "GET",
          endpoint: "/api/v1/auth/me",
          status: res.status,
          type: "security",
          response: json
        });

        if (json.success && json.data) {
          setCurrentUser(json.data);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        setCurrentUser(null);
      } finally {
        setInitializing(false);
      }
    };

    checkSession();
  }, []);

  // Sync theme with document class list
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "oled");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else if (theme === "oled") {
      root.classList.add("dark", "oled");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Sync font family selection
  useEffect(() => {
    const body = window.document.body;
    body.classList.remove("font-sans", "font-mono", "font-serif");
    if (fontFamily === "sans") body.classList.add("font-sans");
    if (fontFamily === "mono") body.classList.add("font-mono");
    if (fontFamily === "serif") body.classList.add("font-serif");
  }, [fontFamily]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-600" />
        <span className="text-xs uppercase font-semibold font-mono tracking-wider">Synchronizing security session credentials...</span>
      </div>
    );
  }

  // Determine active view gate based on auth
  const isAuthorized = currentUser && !lockScreenLocked && !sessionExpired;

  return (
    <div className="text-zinc-100 min-h-screen select-none antialiased">
      {isAuthorized ? (
        <DashboardLayout onLogout={() => {
          sessionStorage.removeItem("ex_welcome_played");
          setCurrentUser(null);
        }} />
      ) : (
        <AuthScreens onSuccess={() => {}} />
      )}

      {/* Persistent AI experience layer (assistant bubbles, side panels, shortcut command bar) */}
      <AIAssistant />
    </div>
  );
}
