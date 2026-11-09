function montarOpcaoDeCliente(cliente) {
  return `<option value="${cliente.id}">${cliente.clienteNome} (${cliente.tipo})</option>`;
}

async function carregarClientesParaSelect() {
  try {
    const resposta = await fetch(`${API_URL}/clientes`);
    const clientes = await resposta.json();

    const select = document.getElementById("selectCliente");
    select.innerHTML = clientes.map(montarOpcaoDeCliente).join("");
  } catch (erro) {
    console.error("Erro ao carregar clientes:", erro);
  }
}
