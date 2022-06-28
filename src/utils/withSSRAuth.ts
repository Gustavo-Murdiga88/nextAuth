import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import decode from "jwt-decode";
import { destroyCookie, parseCookies } from "nookies";

import { validateUserPermisson } from "./validateUserPermissons";

interface WithSSRAuthOptions {
  permissions?: string[];
  roles?: string[];
}

export function WithSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const { "nextauth.token": token } = parseCookies(ctx);

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const user = decode<{ roles: string[]; permissions: string[] }>(token);

    const userHasValidate = validateUserPermisson({
      user,
      permissions: options?.permissions,
      roles: options?.roles,
    });

    if (!userHasValidate) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (err) {
      destroyCookie(ctx, "nextauth.token");
      destroyCookie(ctx, "nextauth.refreshtoken");
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  };
}
