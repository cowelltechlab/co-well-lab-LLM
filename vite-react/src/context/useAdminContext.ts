import { useContext } from "react";
import { AdminContext } from "./adminContext";

export function useAdminContext() {
  return useContext(AdminContext);
}
