import { createContext } from "react";

export type AdminContextType = {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
};

export const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  setIsAdmin: () => {},
});
