let contadorDeLinhasDeItem = 0;

// -------- NOVO PEDIDO --------

function montarOpcoesDeProduto() {
  return listaDeProdutosCarregada
    .map((produto) => `<option value="${produto.id}">${produto.nomeProduto}</option>`)
    .join("");
}

function adicionarLinhaItem() {
  contadorDeLinhasDeItem += 1;
  const id = contadorDeLinhasDeItem;

  const div = document.createElement("div");
  div.className = "linha-item";
  div.id = `linha-${id}`;
  div.innerHTML = `
    <select id="produto-${id}">${montarOpcoesDeProduto()}</select>
    Qtd: <input type="number" id="qtd-${id}" value="1" style="width:50px" />
    <button onclick="removerLinha(${id})">remover</button>
  `;

  document.getElementById("itensPedido").appendChild(div);
}

function removerLinha(id) {
  document.getElementById(`linha-${id}`).remove();
}

function lerItensDoFormulario() {
  const itens = [];
  for (let i = 1; i <= contadorDeLinhasDeItem; i += 1) {
    const selectEl = document.getElementById(`produto-${i}`);
    const qtdEl = document.getElementById(`qtd-${i}`);
    if (selectEl !== null && qtdEl !== null) {
      itens.push({
        produtoId: parseInt(selectEl.value, 10),
        quantidade: parseInt(qtdEl.value, 10),
      });
    }
  }
  return itens;
}

function exibirResultadoDoPedido(mensagem, cor) {
  document.getElementById("resultadoPedido").innerHTML = `<p style="color:${cor}">${mensagem}</p>`;
}

async function enviarPedido() {
  const clienteId = document.getElementById("selectCliente").value;
  const itens = lerItensDoFormulario();

  try {
    const resposta = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId: parseInt(clienteId, 10), itens }),
    });
    const pedido = await resposta.json();

    if (pedido.erro) {
      exibirResultadoDoPedido(`Erro: ${pedido.erro}`, "red");
    } else {
      exibirResultadoDoPedido(
        `Pedido #${pedido.id} criado! Total: R$ ${pedido.total.toFixed(2)}`,
        "green"
      );
    }
  } catch (erro) {
    exibirResultadoDoPedido("Erro ao enviar pedido. Tente novamente.", "red");
    console.error("Erro ao criar pedido:", erro);
  }
}

// -------- LISTAGEM DE PEDIDOS --------

function montarItensDoPedido(itens) {
  return itens
    .map((item) => `<li>${item.quantidade}x ${item.nomeProduto} - R$ ${item.precoTotal.toFixed(2)}</li>`)
    .join("");
}

function montarCardDePedido(pedido) {
  return `
    <div class="pedido-card">
      <b>Pedido #${pedido.id}</b> - ${pedido.clienteNome} -
      <span class="status-${pedido.status}">${pedido.status}</span><br/>
      <ul>${montarItensDoPedido(pedido.itens)}</ul>
      Subtotal: R$ ${pedido.subtotal.toFixed(2)} |
      Desconto: R$ ${pedido.descontoCliente.toFixed(2)} |
      Frete: R$ ${pedido.frete.toFixed(2)} |
      <b>Total: R$ ${pedido.total.toFixed(2)}</b><br/>
      ${gerarBotoesDeStatus(pedido)}
    </div>
  `;
}

async function carregarPedidos() {
  try {
    const resposta = await fetch(`${API_URL}/pedidos`);
    const pedidos = await resposta.json();
    document.getElementById("listaPedidos").innerHTML = pedidos.map(montarCardDePedido).join("");
  } catch (erro) {
    console.error("Erro ao carregar pedidos:", erro);
  }
}

function gerarBotoesDeStatus(pedido) {
  const PROXIMOS_STATUS_POR_STATUS_ATUAL = {
    pendente: ["pago", "cancelado"],
    pago: ["enviado"],
    enviado: ["entregue"],
  };

  const proximosStatus = PROXIMOS_STATUS_POR_STATUS_ATUAL[pedido.status] || [];

  return proximosStatus
    .map(
      (status) =>
        `<button onclick="mudarStatus(${pedido.id}, '${status}')">Marcar como ${status}</button>`
    )
    .join(" ");
}

async function mudarStatus(id, novoStatus) {
  try {
    await fetch(`${API_URL}/pedidos/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    carregarPedidos();
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);
  }
}
