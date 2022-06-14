import { useAuthContext } from "context/AuthContext";
import Router from "next/router";
import { destroyCookie } from "nookies";
import { useEffect } from "react";
import { api, singOut } from "services/api";

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
