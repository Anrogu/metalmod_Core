import { createContext, useContext } from "react";

export const SesionContext = createContext({ username: "", rol: "", esAdmin: false });

export function useSesion() {
  return useContext(SesionContext);
}
