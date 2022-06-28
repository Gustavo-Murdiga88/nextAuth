import { GetServerSideProps } from "next";

import { SetupApi } from "services/api";
import { WithSSRAuth } from "utils/withSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = WithSSRAuth(
  async (ctx) => {
    const apiCliente = SetupApi(ctx);

    const response = await apiCliente.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
