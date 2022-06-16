import { useAuthContext } from "context/AuthContext";
import { GetServerSideProps } from "next";
import Router from "next/router";
import { destroyCookie } from "nookies";
import { useEffect } from "react";

import { singOut, SetupApi } from "services/api";
import { api } from "services/apiCliente";
import { WithSSRAuth } from "utils/withSSRAuth";

export default function Dashborad() {
  const { user } = useAuthContext();

  useEffect(() => {
    api
      .get("/me")
      .then((response) => console.log(response))
      .catch(() => {
        singOut();
      });
  }, []);

  return <h1>Dashboard: {`${user?.email}`}</h1>;
}

export const getServerSideProps: GetServerSideProps = WithSSRAuth(
  async (ctx) => {
    const apiCliente = SetupApi(ctx);

    const response = await apiCliente.get("/me");

    return {
      props: {},
    };
  }
);
