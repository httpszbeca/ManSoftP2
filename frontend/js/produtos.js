let listaDeProdutosCarregada = [];

function montarCardDeProduto(produto) {
  return `
    <div class="produto-card">
      <b>${produto.nomeProduto}</b><br/>
      Preco: R$ ${produto.precoProduto.toFixed(2)}<br/>
      Categoria: ${produto.categoria}<br/>
      Estoque: ${produto.estoque}
    </div>
  `;
}

async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);
    const produtos = await resposta.json();
    listaDeProdutosCarregada = produtos;
    document.getElementById("listaProdutos").innerHTML = produtos.map(montarCardDeProduto).join("");
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

async function carregarProdutosParaSelect() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);
    listaDeProdutosCarregada = await resposta.json();
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

// carrega produtos assim que a pagina abre
carregarProdutos();
