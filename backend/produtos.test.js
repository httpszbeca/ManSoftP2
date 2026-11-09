const request = require("supertest");
const express = require("express");
const { router, produtos, buscarProduto } = require("./produtos");

const app = express();
app.use(express.json());
app.use("/produtos", router);

describe("Testes - Produtos", () => {

  describe("Função buscarProduto() - Integridade de todos os produtos", () => {

    test("deve encontrar o produto 1 (Teclado Mecanico)", () => {
      expect(buscarProduto(1)).toEqual({
        id: 1,
        nomeProduto: "Teclado Mecanico",
        precoProduto: 250.0,
        categoria: "periferico",
        estoque: 15,
      });
    });

    test("deve encontrar o produto 2 (Mouse Gamer - Mata mutante ObjectLiteral linha 13)", () => {
      expect(buscarProduto(2)).toEqual({
        id: 2,
        nomeProduto: "Mouse Gamer",
        precoProduto: 120.0,
        categoria: "periferico",
        estoque: 30,
      });
    });

    test("deve encontrar o produto 3 (Monitor 24pol)", () => {
      expect(buscarProduto(3)).toEqual({
        id: 3,
        nomeProduto: "Monitor 24pol",
        precoProduto: 899.9,
        categoria: "monitor",
        estoque: 8,
      });
    });

    test("deve encontrar o produto 4 (Cadeira Gamer - Mata mutantes das linhas 27, 29 e 31)", () => {
      expect(buscarProduto(4)).toEqual({
        id: 4,
        nomeProduto: "Cadeira Gamer",
        precoProduto: 1200.0,
        categoria: "movel",
        estoque: 5,
      });
    });

    test("deve encontrar o produto 5 (Notebook)", () => {
      expect(buscarProduto(5)).toEqual({
        id: 5,
        nomeProduto: "Notebook",
        precoProduto: 3500.0,
        categoria: "computador",
        estoque: 3,
      });
    });

    test("deve retornar null para ID inexistente", () => {
      expect(buscarProduto(999)).toBeNull();
    });

    test("deve retornar null se o ID for string (Mata mutante === para ==)", () => {
      expect(buscarProduto("1")).toBeNull();
    });

  });

  describe("Rota GET /produtos (listarProdutos)", () => {

    test("deve retornar a lista exata e completa contendo todos os 5 produtos iniciais", async () => {
      const response = await request(app).get("/produtos");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(produtos);
      expect(response.body[1]).toEqual({
        id: 2,
        nomeProduto: "Mouse Gamer",
        precoProduto: 120.0,
        categoria: "periferico",
        estoque: 30,
      });
      expect(response.body[3]).toEqual({
        id: 4,
        nomeProduto: "Cadeira Gamer",
        precoProduto: 1200.0,
        categoria: "movel",
        estoque: 5,
      });
    });

  });

  describe("Rota cadastrarProduto", () => {

    test("deve cadastrar um novo produto calculando ID = tamanho + 1", () => {
      const cadastrarLayer = router.stack.find(
        (layer) => layer.route && layer.route.stack[0].name === "cadastrarProduto"
      );
      const cadastrarHandler = cadastrarLayer.route.stack[0].handle;

      const tamanhoInicial = produtos.length;
      const novoItem = {
        nomeProduto: "Headset Gamer",
        precoProduto: 350.0,
        categoria: "periferico",
        estoque: 20,
      };

      const req = { body: novoItem };
      const res = { json: jest.fn() };

      cadastrarHandler(req, res);

      const idEsperado = tamanhoInicial + 1;
      const produtoAdicionado = produtos.find((p) => p.id === idEsperado);

      expect(produtoAdicionado).toBeDefined();
      expect(produtoAdicionado.nomeProduto).toBe("Headset Gamer");
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

  });

});