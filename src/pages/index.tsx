import { useState, FormEvent } from "react";
import Head from "next/head";
import type { NextPage, GetServerSideProps } from "next";

import { parseCookies } from "nookies";

import { useAuthContext } from "context/AuthContext";

import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const { isAuthenticated, singIn } = useAuthContext();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    singIn({
      email,
      senha,
    });
  }

  return (
    <>
      <Head>
        <title> React Auth</title>
      </Head>

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className="form">
          <div className={styles.form}>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button className={styles.button}>enviar</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { "nextauth.token": token } = parseCookies(ctx);

  if (token) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
