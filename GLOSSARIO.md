# Glossário de Nomes — Sistema de Pedidos

| Termo | Significado |
|---|---|
| **Cliente** | Pessoa cadastrada que pode fazer pedidos no sistema. |
| **Cliente VIP** | Cliente do tipo `vip`, com direito a desconto adicional quando o subtotal do pedido ultrapassa determinado valor. |
| **Produto** | Item disponível para venda, com nome, preço, categoria e estoque. |
| **Estoque** | Quantidade disponível de um produto para venda. |
| **Pedido** | Conjunto de itens comprados por um cliente em uma única transação. |
| **Item do Pedido** | Um produto e a quantidade solicitada dele dentro de um pedido específico. |
| **Subtotal** | Soma do preço de todos os itens do pedido, já com o desconto por quantidade aplicado, mas antes do desconto de cliente VIP e do frete. |
| **Desconto por Quantidade** | Redução no preço de um item do pedido, aplicada quando a quantidade comprada desse item atinge certos limites. |
| **Desconto de Cliente VIP** | Redução adicional no subtotal do pedido, aplicada apenas a clientes VIP quando o subtotal ultrapassa determinado valor. |
| **Frete** | Valor cobrado pela entrega do pedido, calculado com base na cidade do cliente, podendo ser gratuito acima de um subtotal mínimo. |
| **Total** | Valor final do pedido: subtotal menos desconto de cliente VIP, mais frete. |
| **Status do Pedido** | Situação atual do pedido em seu ciclo de vida: `pendente`, `pago`, `enviado`, `entregue` ou `cancelado`. |
| **Transição de Status** | Mudança permitida de um status para outro (ex.: de `pendente` só é permitido ir para `pago` ou `cancelado`). |

## Termos que NÃO fazem parte da linguagem ubíqua

Estes são termos técnicos, do conhecimento apenas de quem desenvolve o
sistema, e não devem ser usados ao se comunicar com o especialista de
domínio (ex.: quem administra a loja):

`req`, `res`, `body`, `endpoint`, `rota`, `middleware`, `array`, `JSON`,
`repository`, `controller`, `service`.
