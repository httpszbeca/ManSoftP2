const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORTA = 3000;
app.listen(PORTA, function iniciarServidor() {
  console.log(`Servidor rodando na porta ${PORTA}`);
});

const produtos = require("./produtos");
const clientes = require("./clientes");
const pedidos = require("./pedidos");

app.use("/produtos", produtos.router);
app.use("/clientes", clientes.router);
app.use("/pedidos", pedidos.router);
