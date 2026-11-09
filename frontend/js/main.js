const API_URL = "http://localhost:3000";

function mostrarAba(nome) {
  document.getElementById("aba-produtos").style.display = "none";
  document.getElementById("aba-novoPedido").style.display = "none";
  document.getElementById("aba-pedidos").style.display = "none";

  document.getElementById(`aba-${nome}`).style.display = "block";

  if (nome === "produtos") {
    carregarProdutos();
  }
  if (nome === "novoPedido") {
    carregarProdutosParaSelect();
    carregarClientesParaSelect();
  }
  if (nome === "pedidos") {
    carregarPedidos();
  }
}
