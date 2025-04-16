import type { AppState } from "./types";
import { createContext } from "react";

export const AppContext = createContext<AppState | undefined>(undefined);
