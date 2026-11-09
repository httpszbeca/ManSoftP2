const express = require("express");

const router = express.Router();

const produtos = [
  {
    id: 1,
    nomeProduto: "Teclado Mecanico",
    precoProduto: 250.0,
    categoria: "periferico",
    estoque: 15,
  },
  {
    id: 2,
    nomeProduto: "Mouse Gamer",
    precoProduto: 120.0,
    categoria: "periferico",
    estoque: 30,
  },
  {
    id: 3,
    nomeProduto: "Monitor 24pol",
    precoProduto: 899.9,
    categoria: "monitor",
    estoque: 8,
  },
  {
    id: 4,
    nomeProduto: "Cadeira Gamer",
    precoProduto: 1200.0,
    categoria: "movel",
    estoque: 5,
  },
  {
    id: 5,
    nomeProduto: "Notebook",
    precoProduto: 3500.0,
    categoria: "computador",
    estoque: 3,
  },
];

function buscarProduto(produtoId) {
  for (let i = 0; i < produtos.length; i++) {
    if (produtos[i].id === produtoId) {
      return produtos[i];
    }
  }
  return null;
}

router.get("/", function listarProdutos(req, res) {
  res.json(produtos);
});

router.get("/", function cadastrarProduto(req, res) {
  const novoProduto = req.body;
  const idNovoProduto = produtos.length + 1;
  produtos.push({
    id: idNovoProduto,
    nomeProduto: novoProduto.nomeProduto,
    precoProduto: novoProduto.precoProduto,
    categoria: novoProduto.categoria,
    estoque: novoProduto.estoque,
  });
  res.json({ ok: true });
});

module.exports = { router, produtos, buscarProduto };
