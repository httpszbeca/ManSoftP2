const express = require("express");

const router = express.Router();

const clientes = [
  { id: 1, clienteNome: "Ana Souza", tipo: "vip", cidade: "Campo Grande" },
  { id: 2, clienteNome: "Bruno Lima", tipo: "normal", cidade: "Sao Paulo" },
  { id: 3, clienteNome: "Carla Dias", tipo: "normal", cidade: "Curitiba" },
];

function buscarCliente(clienteId) {
  for (let i = 0; i < clientes.length; i++) {
    if (clientes[i].id === clienteId) {
      return clientes[i];
    }
  }
  return null;
}

router.get("/", function listarClientes(req, res) {
  res.json(clientes);
});

module.exports = { router, clientes, buscarCliente };
