import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";

export function WithSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const { "nextauth.token": token } = parseCookies(ctx);

    if (token) {
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
