import { createContext } from "../../../../packages/remini/lib";

type Session = {
  token: string | null;
  setToken: (token: string) => void;
};

export const SessionContext = createContext<Session>();
