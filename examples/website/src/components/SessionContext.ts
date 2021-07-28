import { createContext } from "../../../../lib";

type Session = {
  token: string | null;
  setToken: (token: string) => void;
};

export const SessionContext = createContext<Session>();
