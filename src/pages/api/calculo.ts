// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name?: string;
  repo?: any;
  error?: string;
};

type Requisicao = {
  numero1: string;
  numero2: string;
};

export default function Hello(req: NextApiRequest, res: NextApiResponse<Data>) {
  const teste = req.query;
  const valores = JSON.stringify(teste);
  const teste2: Requisicao = JSON.parse(valores);
  console.log(teste2);

  let repo;

  if (req.method === "GET") {
    repo = Number(teste2.numero1) + Number((teste2.numero2 ||= "900"));
  }

  if (repo) {
    res.status(200).json({
      name: "John Doe",
      repo,
    });
  } else {
    res.status(401).json({ error: "é deu errado mano" });
  }
}
