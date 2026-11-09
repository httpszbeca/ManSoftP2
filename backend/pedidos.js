const express = require("express");

const router = express.Router();

const { buscarProduto } = require("./produtos");
const { buscarCliente } = require("./clientes");

const pedidos = [];
let proximoIdPedido = 1;

function buscarPedidoPorId(id) {
  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].id === id) {
      return pedidos[i];
    }
  }
  return null;
}

function calcularPrecoDoItem(produto, quantidade) {
  const QUANTIDADE_MINIMA_DESCONTO_ALTO = 10;
  const DESCONTO_ALTO = 0.15;
  const QUANTIDADE_MINIMA_DESCONTO_MEDIO = 5;
  const DESCONTO_MEDIO = 0.1;
  const QUANTIDADE_MINIMA_DESCONTO_BAIXO = 3;
  const DESCONTO_BAIXO = 0.05;

  const precoBruto = produto.precoProduto * quantidade;

  if (quantidade >= QUANTIDADE_MINIMA_DESCONTO_ALTO) {
    return precoBruto - precoBruto * DESCONTO_ALTO;
  }
  if (quantidade >= QUANTIDADE_MINIMA_DESCONTO_MEDIO) {
    return precoBruto - precoBruto * DESCONTO_MEDIO;
  }
  if (quantidade >= QUANTIDADE_MINIMA_DESCONTO_BAIXO) {
    return precoBruto - precoBruto * DESCONTO_BAIXO;
  }
  return precoBruto;
}

function calcularDescontoCliente(cliente, subtotal) {
  const SUBTOTAL_MINIMO_DESCONTO_VIP_ALTO = 1000;
  const DESCONTO_VIP_ALTO = 0.1;
  const SUBTOTAL_MINIMO_DESCONTO_VIP_MEDIO = 500;
  const DESCONTO_VIP_MEDIO = 0.05;

  if (cliente.tipo !== "vip") {
    return 0;
  }
  if (subtotal > SUBTOTAL_MINIMO_DESCONTO_VIP_ALTO) {
    return subtotal * DESCONTO_VIP_ALTO;
  }
  if (subtotal > SUBTOTAL_MINIMO_DESCONTO_VIP_MEDIO) {
    return subtotal * DESCONTO_VIP_MEDIO;
  }
  return 0;
}

function calcularFrete(cliente, subtotal) {
  const FRETE_CAMPO_GRANDE = 15;
  const FRETE_SAO_PAULO = 25;
  const FRETE_CURITIBA = 30;
  const FRETE_OUTRAS_CIDADES = 40;
  const SUBTOTAL_MINIMO_FRETE_GRATIS = 300;

  if (subtotal > SUBTOTAL_MINIMO_FRETE_GRATIS) {
    return 0;
  }
  if (cliente.cidade === "Campo Grande") {
    return FRETE_CAMPO_GRANDE;
  }
  if (cliente.cidade === "Sao Paulo") {
    return FRETE_SAO_PAULO;
  }
  if (cliente.cidade === "Curitiba") {
    return FRETE_CURITIBA;
  }
  return FRETE_OUTRAS_CIDADES;
}

// atualiza status do pedido, com regras de transicao escritas em cascata de ifs

function transicaoEhValida(statusAtual, novoStatus) {
  if (statusAtual === "pendente") {
    return novoStatus === "pago" || novoStatus === "cancelado";
  }
  if (statusAtual === "pago") {
    return novoStatus === "enviado" || novoStatus === "cancelado";
  }
  if (statusAtual === "enviado") {
    return novoStatus === "entregue";
  }
  return false;
}

router.post("/", function criarPedido(req, res) {
  try {
    const { body: dadosPedido } = req;

    if (!dadosPedido.clienteId) {
      return res.status(400).json({ erro: "cliente obrigatorio" });
    }
    if (dadosPedido.itens === null || dadosPedido.itens.length === 0) {
      return res.status(400).json({ erro: "itens obrigatorio" });
    }

    const cliente = buscarCliente(dadosPedido.clienteId);
    if (cliente === null) {
      return res.status(400).json({ erro: "cliente nao encontrado" });
    }

    const itensPedido = [];
    let subtotal = 0;

    for (let j = 0; j < dadosPedido.itens.length; j++) {
      const itemSolicitado = dadosPedido.itens[j];
      const produtoEncontrado = buscarProduto(itemSolicitado.produtoId);

      if (produtoEncontrado === null) {
        return res
          .status(400)
          .json({ erro: `produto nao encontrado: ${itemSolicitado.produtoId}` });
      }
      if (produtoEncontrado.estoque < itemSolicitado.quantidade) {
        return res
          .status(400)
          .json({ erro: `estoque insuficiente para ${produtoEncontrado.nomeProduto}` });
      }

      const precoItem = calcularPrecoDoItem(produtoEncontrado, itemSolicitado.quantidade);
      subtotal += precoItem;

      itensPedido.push({
        produtoId: produtoEncontrado.id,
        nomeProduto: produtoEncontrado.nomeProduto,
        quantidade: itemSolicitado.quantidade,
        precoUnitario: produtoEncontrado.precoProduto,
        precoTotal: precoItem,
      });

      produtoEncontrado.estoque -= itemSolicitado.quantidade;
    }

    const descontoCliente = calcularDescontoCliente(cliente, subtotal);
    const frete = calcularFrete(cliente, subtotal);
    const total = subtotal - descontoCliente + frete;

    const pedido = {
      id: proximoIdPedido,
      clienteId: cliente.id,
      clienteNome: cliente.clienteNome,
      itens: itensPedido,
      subtotal,
      descontoCliente,
      frete,
      total,
      status: "pendente",
      data: new Date().toISOString(),
    };

    proximoIdPedido += 1;
    pedidos.push(pedido);

    return res.json(pedido);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return res.status(500).json({ erro: "erro interno do servidor" });
  }
});

router.get("/", function listarPedidos(req, res) {
  res.json(pedidos);
});

router.get("/:id", function buscarPedido(req, res) {
  const pedido = buscarPedidoPorId(Number(req.params.id));
  if (pedido === null) {
    return res.status(404).json({ erro: "pedido nao encontrado" });
  }
  return res.json(pedido);
});

router.put("/:id/status", function atualizarStatusDoPedido(req, res) {
  const novoStatus = req.body.status;
  const encontrado = buscarPedidoPorId(Number(req.params.id));

  if (encontrado === null) {
    return res.status(404).json({ erro: "pedido nao encontrado" });
  }
  if (!transicaoEhValida(encontrado.status, novoStatus)) {
    return res.status(400).json({ erro: "transicao invalida" });
  }

  encontrado.status = novoStatus;
  return res.json(encontrado);
});

// No final do arquivo backend/pedidos.js:
module.exports = {
  router,
  pedidos,
  buscarPedidoPorId,
  calcularPrecoDoItem,
  calcularDescontoCliente,
  calcularFrete,
  transicaoEhValida,
};