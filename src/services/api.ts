import axios, { AxiosError } from "axios";
import { singOut } from "context/AuthContext";
import Router from "next/router";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { AuthErrorAuthentication } from "./Errors/AuthErrorAuthentication";

type FaliedRequest = {
  resolve(token: string): void;
  reject(error: AxiosError): void;
};

let isRefreshing = false;
let failedRequestQueue: Array<FaliedRequest> = [];

export function SetupApi(ctx: any = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
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

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days,
                  path: "/",
                });

                setCookie(ctx, "nextauth.refreshtoken", refreshToken, {
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
          if (process.browser) {
            singOut();
          } else {
            return Promise.reject(new AuthErrorAuthentication());
          }
        }

        return Promise.reject(error);
      }
    }
  );
  return api;
}
