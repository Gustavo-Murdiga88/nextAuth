import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Router from "next/router";
import { setCookie, parseCookies } from "nookies";

import { api, singOut } from "services/api";

type Credentials = {
  email: string;
  senha: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type AuthContext = {
  singIn(credentials: Credentials): Promise<void>;
  isAuthenticated: boolean;
  user: User | undefined;
};

type AuthContextProvider = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContext);

export function AuthContextProvider({ children }: AuthContextProvider) {
  const [user, setUser] = useState<User>({
    email: "",
  } as User);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("me")
        .then((resp) => {
          const { email, permissions, roles } = resp?.data;
          setUser({
            email,
            permissions,
            roles,
          });
        })
        .catch((error) => {
          Router.push("/");
        });
    }
  }, []);

  async function singIn({ email, senha }: Credentials) {
    try {
      const response = await api
        .post("sessions", { email, password: senha })
        .catch((resp) =>
          console.log("email or password incorrect", resp.response.data.message)
        );

      const { token, refreshToken, permissions, roles } = response?.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days,
        path: "/",
      });

      setCookie(undefined, "nextauth.refreshtoken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days,
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      //@ts-ignore
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (erro) {
      singOut();

      Router.push("/");
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, singIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  return context;
}
