const request = require("supertest");
const express = require("express");

jest.mock("./clientes", () => ({
  buscarCliente: jest.fn(),
}));
jest.mock("./produtos", () => ({
  buscarProduto: jest.fn(),
}));

const { buscarCliente } = require("./clientes");
const { buscarProduto } = require("./produtos");

const {
  router,
  pedidos,
  buscarPedidoPorId,
  calcularPrecoDoItem,
  calcularDescontoCliente,
  calcularFrete,
  transicaoEhValida,
} = require("./pedidos");

const app = express();
app.use(express.json());
app.use("/pedidos", router);

describe("Testes - Pedidos", () => {
  beforeEach(() => {
    pedidos.length = 0;
    jest.clearAllMocks();
  });

  /* 1. UNIDADE: buscarPedidoPorId */
  describe("buscarPedidoPorId()", () => {
    beforeEach(() => {
      pedidos.push(
        { id: 1, clienteId: 1, total: 100 },
        { id: 2, clienteId: 2, total: 200 },
        { id: 3, clienteId: 3, total: 300 },
      );
    });

    test("deve encontrar o primeiro pedido ", () => {
      expect(buscarPedidoPorId(1)).toEqual({ id: 1, clienteId: 1, total: 100 });
    });

    test("deve encontrar o último pedido", () => {
      expect(buscarPedidoPorId(3)).toEqual({ id: 3, clienteId: 3, total: 300 });
    });

    test("deve retornar null para ID inexistente", () => {
      expect(buscarPedidoPorId(999)).toBeNull();
    });

    test("deve retornar null se o ID for String (Mata mutante === para ==)", () => {
      expect(buscarPedidoPorId("1")).toBeNull();
    });
  });

  /* 2. UNIDADE: calcularPrecoDoItem */
  describe("calcularPrecoDoItem()", () => {
    const produto = { precoProduto: 100.0 };

    test("15% de desconto para quantidade = 10", () => {
      expect(calcularPrecoDoItem(produto, 10)).toBe(850);
    });

    test("10% de desconto para quantidade = 9 ", () => {
      expect(calcularPrecoDoItem(produto, 9)).toBe(810);
    });

    test("10% de desconto para quantidade = 5 ", () => {
      expect(calcularPrecoDoItem(produto, 5)).toBe(450);
    });

    test("5% de desconto para quantidade = 4 )", () => {
      expect(calcularPrecoDoItem(produto, 4)).toBe(380);
    });

    test("5% de desconto para quantidade = 3 ", () => {
      expect(calcularPrecoDoItem(produto, 3)).toBe(285);
    });

    test("Sem desconto para quantidade = 2 ", () => {
      expect(calcularPrecoDoItem(produto, 2)).toBe(200);
    });
  });

  /* 3. UNIDADE: calcularDescontoCliente*/
  describe("calcularDescontoCliente()", () => {
    const vip = { tipo: "vip" };
    const normal = { tipo: "normal" };

    test("0 de desconto para cliente não VIP", () => {
      expect(calcularDescontoCliente(normal, 2000)).toBe(0);
    });

    test("10% de desconto para VIP com subtotal > 1000", () => {
      expect(calcularDescontoCliente(vip, 1001)).toBeCloseTo(100.1, 2);
    });

    test("5% de desconto para VIP com subtotal = 1000", () => {
      expect(calcularDescontoCliente(vip, 1000)).toBe(50);
    });

    test("5% de desconto para VIP com subtotal > 500 (ex: 501)", () => {
      expect(calcularDescontoCliente(vip, 501)).toBeCloseTo(25.05, 2);
    });

    test("0 de desconto para VIP com subtotal = 500 (Mata mutante > 500 para >= 500)", () => {
      expect(calcularDescontoCliente(vip, 500)).toBe(0);
    });
  });

  /*  4. UNIDADE: calcularFrete*/
  describe("calcularFrete()", () => {
    test("Frete grátis (0) para subtotal > 300 (ex: 301)", () => {
      expect(calcularFrete({ cidade: "Campo Grande" }, 301)).toBe(0);
    });

    test("Cobrar frete normal para subtotal = 300 (Mata mutante > 300 para >= 300)", () => {
      expect(calcularFrete({ cidade: "Campo Grande" }, 300)).toBe(15);
    });

    test("Frete Campo Grande (15)", () => {
      expect(calcularFrete({ cidade: "Campo Grande" }, 100)).toBe(15);
    });

    test("Frete Sao Paulo (25)", () => {
      expect(calcularFrete({ cidade: "Sao Paulo" }, 100)).toBe(25);
    });

    test("Frete Curitiba (30)", () => {
      expect(calcularFrete({ cidade: "Curitiba" }, 100)).toBe(30);
    });

    test("Frete Outras Cidades (40)", () => {
      expect(calcularFrete({ cidade: "Outra" }, 100)).toBe(40);
    });
  });

  /*
     5. UNIDADE: transicaoEhValida*/
  describe("transicaoEhValida()", () => {
    test("Pendente -> Pago (true)", () => {
      expect(transicaoEhValida("pendente", "pago")).toBe(true);
    });

    test("Pendente -> Cancelado (true)", () => {
      expect(transicaoEhValida("pendente", "cancelado")).toBe(true);
    });

    test("Pendente -> Enviado (false - Mata mutante || para &&)", () => {
      expect(transicaoEhValida("pendente", "enviado")).toBe(false);
    });

    test("Pago -> Enviado (true)", () => {
      expect(transicaoEhValida("pago", "enviado")).toBe(true);
    });

    test("Pago -> Cancelado (true)", () => {
      expect(transicaoEhValida("pago", "cancelado")).toBe(true);
    });

    test("Pago -> Entregue (false - Mata mutante || para &&)", () => {
      expect(transicaoEhValida("pago", "entregue")).toBe(false);
    });

    test("Enviado -> Entregue (true)", () => {
      expect(transicaoEhValida("enviado", "entregue")).toBe(true);
    });

    test("Enviado -> Cancelado (false)", () => {
      expect(transicaoEhValida("enviado", "cancelado")).toBe(false);
    });

    test("Status desconhecido ou final -> false", () => {
      expect(transicaoEhValida("entregue", "pago")).toBe(false);
      expect(transicaoEhValida("invalido", "pago")).toBe(false);
    });

    test("NÃO deve permitir transição para 'entregue' se o status atual não for 'enviado' (Mata mutante if(true) na linha 91)", () => {
      expect(transicaoEhValida("cancelado", "entregue")).toBe(false);
      expect(transicaoEhValida("entregue", "entregue")).toBe(false);
    });
  });

  /* 6. INTEGRACAO HTTP: POST /pedidos (criarPedido)*/
  describe("POST /pedidos", () => {
    test("Erro 400 quando clienteId não é informado", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({ itens: [{ produtoId: 1, quantidade: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "cliente obrigatorio" });
    });

    test("Erro 400 quando itens é null", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: null });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "itens obrigatorio" });
    });

    test("Erro 400 quando itens é lista vazia", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [] });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "itens obrigatorio" });
    });

    test("Erro 400 quando cliente não é encontrado", async () => {
      buscarCliente.mockReturnValue(null);
      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 99, itens: [{ produtoId: 1, quantidade: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "cliente nao encontrado" });
    });

    test("Erro 400 quando produto não é encontrado", async () => {
      buscarCliente.mockReturnValue({
        id: 1,
        clienteNome: "Ana",
        tipo: "normal",
        cidade: "Curitiba",
      });
      buscarProduto.mockReturnValue(null);

      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [{ produtoId: 88, quantidade: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "produto nao encontrado: 88" });
    });

    test("Erro 400 quando estoque é insuficiente", async () => {
      buscarCliente.mockReturnValue({
        id: 1,
        clienteNome: "Ana",
        tipo: "normal",
        cidade: "Curitiba",
      });
      buscarProduto.mockReturnValue({
        id: 10,
        nomeProduto: "Mouse",
        precoProduto: 50,
        estoque: 2,
      });

      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [{ produtoId: 10, quantidade: 5 }] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "estoque insuficiente para Mouse" });
    });

    test("Sucesso na criação do pedido (Atualiza estoque, calcula frete/desconto e incrementa proximoIdPedido)", async () => {
      const clienteMock = {
        id: 1,
        clienteNome: "Ana Souza",
        tipo: "vip",
        cidade: "Campo Grande",
      };
      const produtoMock = {
        id: 10,
        nomeProduto: "Teclado",
        precoProduto: 100,
        estoque: 10,
      };

      buscarCliente.mockReturnValue(clienteMock);
      buscarProduto.mockReturnValue(produtoMock);

      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [{ produtoId: 10, quantidade: 2 }] });

      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe("pendente");
      expect(res.body.subtotal).toBe(200); // 100 * 2
      expect(res.body.frete).toBe(15); // Campo Grande, subtotal <= 300
      expect(res.body.total).toBe(215); // 200 - 0 (VIP subtotal <= 500) + 15
      expect(produtoMock.estoque).toBe(8); // 10 - 2
      expect(pedidos).toHaveLength(1);
    });

    test("Permite compra quando estoque é exatamente igual à quantidade solicitada (Mata mutante estoque < quantidade para <=)", async () => {
      const clienteMock = {
        id: 1,
        clienteNome: "Ana",
        tipo: "normal",
        cidade: "Curitiba",
      };
      const produtoMock = {
        id: 5,
        nomeProduto: "Item",
        precoProduto: 50,
        estoque: 3,
      };

      buscarCliente.mockReturnValue(clienteMock);
      buscarProduto.mockReturnValue(produtoMock);

      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [{ produtoId: 5, quantidade: 3 }] });

      expect(res.status).toBe(200);
      expect(produtoMock.estoque).toBe(0);
    });

    test("Erro 500 quando ocorre exceção interna (Testa bloco catch)", async () => {
      buscarCliente.mockImplementation(() => {
        throw new Error("Erro de banco simulado");
      });

      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [{ produtoId: 1, quantidade: 1 }] });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ erro: "erro interno do servidor" });
    });
    test("Sucesso na criação do pedido (Atualiza estoque, calcula frete/desconto e incrementa proximoIdPedido)", async () => {
      const clienteMock = {
        id: 1,
        clienteNome: "Ana Souza",
        tipo: "vip",
        cidade: "Campo Grande",
      };
      const produtoMock = {
        id: 10,
        nomeProduto: "Teclado",
        precoProduto: 100,
        estoque: 10,
      };

      buscarCliente.mockReturnValue(clienteMock);
      buscarProduto.mockReturnValue(produtoMock);

      const res = await request(app)
        .post("/pedidos")
        .send({ clienteId: 1, itens: [{ produtoId: 10, quantidade: 2 }] });

      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe("pendente");

      expect(res.body.itens).toHaveLength(1);
      expect(res.body.itens[0].produtoId).toBe(10);

      expect(res.body.subtotal).toBe(200);
      expect(res.body.frete).toBe(15);
      expect(res.body.total).toBe(215);
      expect(produtoMock.estoque).toBe(8);
      expect(pedidos).toHaveLength(1);
    });
  });
  /*  7. INTEGRACAO HTTP: GET /pedidos, GET /:id e PUT /:id/status */
  describe("Outras Rotas HTTP de Pedidos", () => {
    beforeEach(() => {
      pedidos.push({
        id: 1,
        clienteId: 1,
        status: "pendente",
        total: 150,
      });
    });

    test("GET /pedidos - deve listar todos os pedidos", async () => {
      const res = await request(app).get("/pedidos");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(pedidos);
    });

    test("GET /pedidos/:id - deve retornar o pedido existente", async () => {
      const res = await request(app).get("/pedidos/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(pedidos[0]);
    });

    test("GET /pedidos/:id - Erro 404 para pedido inexistente", async () => {
      const res = await request(app).get("/pedidos/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: "pedido nao encontrado" });
    });

    test("PUT /pedidos/:id/status - Erro 404 para pedido inexistente", async () => {
      const res = await request(app)
        .put("/pedidos/999/status")
        .send({ status: "pago" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: "pedido nao encontrado" });
    });

    test("PUT /pedidos/:id/status - Erro 400 para transição inválida", async () => {
      const res = await request(app)
        .put("/pedidos/1/status")
        .send({ status: "entregue" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: "transicao invalida" });
    });

    test("PUT /pedidos/:id/status - Sucesso ao atualizar status válido", async () => {
      const res = await request(app)
        .put("/pedidos/1/status")
        .send({ status: "pago" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("pago");
      expect(pedidos[0].status).toBe("pago");
    });
  });

  test("Mata mutante de operador no desconto (- para +): aplica desconto VIP corretamente no total", async () => {
    const clienteVIP = {
      id: 1,
      clienteNome: "Ana",
      tipo: "vip",
      cidade: "Campo Grande",
    };
    const produtoMock = {
      id: 1,
      nomeProduto: "Item",
      precoProduto: 600,
      estoque: 10,
    };

    buscarCliente.mockReturnValue(clienteVIP);
    buscarProduto.mockReturnValue(produtoMock);

    const res = await request(app)
      .post("/pedidos")
      .send({ clienteId: 1, itens: [{ produtoId: 1, quantidade: 1 }] });

    expect(res.status).toBe(200);
    expect(res.body.descontoCliente).toBe(30); // 5% de 600
    expect(res.body.frete).toBe(0); // 600 > 300 = Frete Grátis
    expect(res.body.total).toBe(570); // 600 - 30 + 0 = 570 (Com '+' viraria 630)
  });

  test("Mata mutante de decremento no ID (+= para -=): incrementa ID em pedidos sequenciais", async () => {
    const clienteMock = {
      id: 1,
      clienteNome: "Ana",
      tipo: "normal",
      cidade: "Curitiba",
    };
    const produtoMock = {
      id: 1,
      nomeProduto: "Item",
      precoProduto: 10,
      estoque: 50,
    };

    buscarCliente.mockReturnValue(clienteMock);
    buscarProduto.mockReturnValue(produtoMock);

    const res1 = await request(app)
      .post("/pedidos")
      .send({ clienteId: 1, itens: [{ produtoId: 1, quantidade: 1 }] });

    const res2 = await request(app)
      .post("/pedidos")
      .send({ clienteId: 1, itens: [{ produtoId: 1, quantidade: 1 }] });

    expect(res2.body.id).toBe(res1.body.id + 1);
  });
});
