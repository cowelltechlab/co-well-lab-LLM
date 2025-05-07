import { useState, useEffect } from "react";
import { AdminContext } from "./adminContext";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem("isAdmin");
    return saved === "true";
  });

  // Sync changes to localStorage
  useEffect(() => {
    localStorage.setItem("isAdmin", String(isAdmin));
  }, [isAdmin]);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}
