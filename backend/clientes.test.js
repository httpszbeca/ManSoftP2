const request = require("supertest");
const express = require("express");
const { router, clientes, buscarCliente } = require("./clientes");

const app = express();
app.use("/clientes", router);
describe("Testes - Clientes", () => {
  describe("Função buscarCliente()", () => {
    test("deve encontrar o primeiro cliente da lista", () => {
      const resultado = buscarCliente(1);
      expect(resultado).toEqual({
        id: 1,
        clienteNome: "Ana Souza",
        tipo: "vip",
        cidade: "Campo Grande",
      });
    });
    test("deve encontrar o cliente no meio da lista", () => {
      const resultado = buscarCliente(2);
      expect(resultado).toEqual({
        id: 2,
        clienteNome: "Bruno Lima",
        tipo: "normal",
        cidade: "Sao Paulo",
      });
    });

    test("deve encontrar o último cliente da lista (Mata mutantes de limite do laço: i < clientes.length)", () => {
      const resultado = buscarCliente(3);
      expect(resultado).toEqual({
        id: 3,
        clienteNome: "Carla Dias",
        tipo: "normal",
        cidade: "Curitiba",
      });
    });

    test("deve retornar null para ID inexistente (Mata mutantes no retorno padrão 'return null')", () => {
      const resultado = buscarCliente(99);
      expect(resultado).toBeNull();
    });

    test("deve retornar null se o ID for string em vez de número (Mata mutantes de igualdade estrita: === para ==)", () => {
      const resultado = buscarCliente("1");
      expect(resultado).toBeNull();
    });
  });

  describe("Rota GET /clientes", () => {
    test("deve retornar a lista completa de clientes e status 200 (Mata mutantes na resposta do Express)", async () => {
      const response = await request(app).get("/clientes");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(clientes);
      expect(response.body).toHaveLength(3);
    });
  });
});
