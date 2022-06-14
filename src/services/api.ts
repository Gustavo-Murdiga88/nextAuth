import axios, { AxiosError } from "axios";
import Router from "next/router";
import { parseCookies, setCookie, destroyCookie } from "nookies";

type FaliedRequest = {
  resolve(token: string): void;
  reject(error: AxiosError): void;
};

let cookies = parseCookies();

let isRefreshing = false;
let failedRequestQueue: Array<FaliedRequest> = [];

export function singOut() {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshtoken");

  Router.push("/");
}

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === "token.expired") {
        const { "nextauth.refreshtoken": refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              const { token, refreshToken } = response?.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days,
                path: "/",
              });

              setCookie(undefined, "nextauth.refreshtoken", refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days,
                path: "/",
              });

              //@ts-ignore
              api.defaults.headers["Authorization"] = `Bearer ${token}`;
              failedRequestQueue.forEach((request) => request.resolve(token));
              failedRequestQueue = [];
            })
            .catch((error) => {
              failedRequestQueue.forEach((request) => request.reject(error));
              failedRequestQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
        return new Promise((onSuccess, onReject) => {
          failedRequestQueue.push({
            resolve: (token: string) => {
              //@ts-ignore
              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              onSuccess(api(originalConfig));
            },
            reject: (error: AxiosError) => {
              onReject(error);
            },
          });
        });
      } else {
        singOut();
      }

      return Promise.reject(error);
    }
  }
);
