# PLAYBOOK — PDV + NFC-e Açaí (UN Refresco)

> **Leia este arquivo antes de qualquer coisa.** Ele contém todo o contexto do projeto
> para que o Claude possa continuar a codificação sem precisar redescobrir decisões já tomadas.

---

## 1. Contexto do Negócio

**Cliente:** UN Refresco — loja de açaí em Brasília-DF  
**Objetivo:** Substituir o sistema pago Codeltec por um PDV próprio com emissão de NFC-e  
**Dono:** Rhanieri (rhanieri14@gmail.com)

### Regras de negócio críticas (PDV)

| Regra | Detalhe |
|---|---|
| Complementos grátis | Definido por GrupoComplemento.limiteMax (ex.: 3 acompanhamentos) |
| Complemento pago | item.preco > 0 → sempre somado ao total |
| Complemento grátis | item.preco = 0 → incluso dentro do limite do grupo |
| Barca | Regra especial (definir quando chegar na NFC-e) |

---

## 2. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Java 17 + Spring Boot 3.2.5 |
| ORM | Spring Data JPA + Hibernate |
| Banco | PostgreSQL 15 |
| Validação | jakarta.validation (spring-boot-starter-validation) |
| Utilitários | Lombok, MapStruct não usado (mapeamento manual) |
| Frontend | Angular 17 |
| UI Components | PrimeNG 17 |
| Forms | ReactiveFormsModule + FormsModule |
| HTTP | HttpClient + forkJoin (RxJS) |
| Infra | Docker + Docker Compose |

---

## 3. Como rodar

```bash
# Primeira vez ou após mudanças no banco (schema):
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up

# Demais vezes (mantém os dados):
docker compose -f docker-compose.dev.yml up --build
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080/api |
| Banco | localhost:5432 / acainfe / acainfe123 |

**Hot reload:** o frontend tem volume montado em `./frontend/src` — salvar um arquivo já recompila.  
O backend faz rebuild completo via Docker quando há mudança (não tem hot reload configurado ainda).

---

## 4. Arquitetura

```
acai-nfe/
├── backend/                  # Spring Boot
│   └── src/main/java/com/acainfe/
│       ├── config/           # Initializers (seed) + CORS
│       ├── controller/       # REST endpoints
│       ├── dto/              # Records de entrada/saída
│       ├── enums/            # StatusPedido, FormaPagamento, Ambiente, RegimeTributario
│       ├── model/            # Entidades JPA
│       ├── repository/       # Spring Data JPA
│       └── service/          # Regras de negócio
│
├── frontend/                 # Angular 17
│   └── src/app/
│       ├── layout/           # Shell com sidebar + topbar
│       ├── models/           # Interfaces TypeScript
│       ├── pages/            # Um componente por tela
│       └── services/         # HttpClient wrappers
│
├── docker-compose.dev.yml    # Ambiente de desenvolvimento
└── PLAYBOOK.md               # Este arquivo
```

---

## 5. Modelo de Dados

### Hierarquia principal

```
Categoria (1) ──> (N) Produto (N) ──> (M) GrupoComplemento (1) ──> (N) ItemComplemento

Pedido (1) ──> (N) ItemPedido (1) ──> (N) ItemPedidoComplemento
```

> Produto ↔ GrupoComplemento é **ManyToMany** (grupos compartilhados entre produtos).
> Editar nome/limites de um grupo afeta **todos os produtos** que o utilizam.

### Entidades — Cardápio

**Categoria**
```java
id, nome, icone (pi pi-*), cor (#hex), ordem (int), ativo
```

**Produto**
```java
id, nome, descricao, categoria (FK), tamanho, preco, ativo, ordem
grupos: List<GrupoComplemento>  // ManyToMany via tabela produto_grupos
```

**GrupoComplemento**
```java
id, nome, limiteMin (int), limiteMax (int), ativo, ordem
itens: List<ItemComplemento>    // OneToMany, EAGER
```

**ItemComplemento**
```java
id, nome, preco (BigDecimal), grupo (FK), ativo, ordem
// preco = 0,00 → grátis dentro do limite; preco > 0 → sempre cobrado
```

### Entidades — Pedidos

**Pedido**
```java
id, dataHora, status (PAGO|ABERTO|CANCELADO), formaPagamento (DINHEIRO|DEBITO|CREDITO|PIX)
valorTotal, valorPago, troco
itens: List<ItemPedido>    // OneToMany, EAGER
```

**ItemPedido**
```java
id, pedido (FK), nomeProduto (snapshot), produtoId (ref), precoUnitario, quantidade, subtotal
complementos: List<ItemPedidoComplemento>    // OneToMany, EAGER
```

> **Snapshots:** `nomeProduto`, `nomeComplemento`, `nomeGrupo` e preços são copiados no momento
> da venda. Se o produto for editado ou excluído, o histórico fica intacto.

**ItemPedidoComplemento**
```java
id, itemPedido (FK), nomeComplemento (snapshot), nomeGrupo (snapshot), itemComplementoId (ref), preco (snapshot)
```

### Empresa
```java
id, razaoSocial, cnpj, ie, csc, cscId, serie, proximoNumero, ambiente, regimeTributario, ...
```

### ⚠️ Arquivos órfãos (modelo antigo)
- `Complemento.java` + `TipoComplemento.java` — substituídos por GrupoComplemento/ItemComplemento. Compilam e criam tabela `complementos` (inofensivo). Não remover sem ferramenta de delete.
- `enums/Categoria.java` — enum antigo substituído pela entidade `model/Categoria.java`. Não usado, não causa erro.

---

## 6. Endpoints da API

### Cardápio

| Método | URL | Descrição |
|---|---|---|
| GET | /api/categorias | Lista todas |
| POST | /api/categorias | Cria |
| PUT | /api/categorias/{id} | Atualiza |
| DELETE | /api/categorias/{id} | Remove |
| GET | /api/produtos | Lista todos |
| POST | /api/produtos | Cria |
| PUT | /api/produtos/{id} | Atualiza |
| PATCH | /api/produtos/{id}/toggle | Ativa/desativa |
| DELETE | /api/produtos/{id} | Remove |
| POST | /api/produtos/copiar | Copia produtos entre categorias |
| GET | /api/produtos/{id}/grupos | Lista grupos de complementos do produto |
| POST | /api/produtos/{id}/grupos/{grupoId} | Associa grupo ao produto |
| DELETE | /api/produtos/{id}/grupos/{grupoId} | Remove associação grupo↔produto |
| GET | /api/grupos | Lista todos os grupos (com itens) |
| POST | /api/grupos | Cria novo grupo |
| PUT | /api/grupos/{id} | Atualiza nome/limites do grupo |
| DELETE | /api/grupos/{id} | Remove grupo |
| POST | /api/grupos/{id}/itens | Adiciona item ao grupo |
| PUT | /api/grupos/{id}/itens/{itemId} | Atualiza item |
| DELETE | /api/grupos/{id}/itens/{itemId} | Remove item |
| POST | /api/grupos/{id}/produtos/lote | Aplica grupo a vários produtos de uma vez |

### Pedidos

| Método | URL | Descrição |
|---|---|---|
| POST | /api/pedidos | Cria e finaliza um pedido (payload: CriarPedidoDTO) |
| GET | /api/pedidos | Lista pedidos de hoje |
| GET | /api/pedidos/{id} | Busca pedido por id |

### Empresa

| Método | URL | Descrição |
|---|---|---|
| GET | /api/empresa | Configurações da empresa |
| PUT | /api/empresa | Atualiza configurações |

---

## 7. Telas implementadas

| Rota | Componente | Status |
|---|---|---|
| /dashboard | DashboardComponent | Placeholder |
| /novo-pedido | NovoPedidoComponent | ✅ Completo |
| /pedidos-do-dia | PedidosDoDiaComponent | **Próxima tarefa** |
| /cardapio | CardapioComponent | ✅ Completo (inclui gestão de grupos de complementos) |
| /historico | HistoricoComponent | Placeholder |
| /configuracoes | ConfiguracoesComponent | ✅ Completo |

> A rota `/complementos` foi removida. Os grupos de complementos são gerenciados
> dentro do Cardápio, clicando no ícone `pi-th-large` em cada produto.

---

## 8. Funcionamento do PDV (NovoPedidoComponent)

### Fluxo completo

1. **Tela principal** — dois painéis lado a lado:
   - **Esquerdo:** chips de categoria + grid de produtos por categoria
   - **Direito:** resumo do pedido atual com subtotais e total

2. **Clicar num produto:**
   - Chama `GET /api/produtos/{id}/grupos` para carregar os grupos do produto
   - Se produto não tem grupos → adiciona direto ao pedido sem abrir modal
   - Se tem grupos → abre Modal de Complementos

3. **Modal de complementos:**
   - Cada GrupoComplemento aparece como seção com título e legenda "Obrigatório · Escolha X"
   - `limiteMax = 1` → visual de radio button (seleção única)
   - `limiteMax > 1` → visual de checkbox (seleção múltipla até o limite)
   - Botão "Adicionar" fica desabilitado até todos os grupos com `limiteMin > 0` estarem satisfeitos

4. **Cálculo do preço do item:**
   - `precoItem = produto.preco + soma(complemento.preco para cada selecionado)`
   - Os complementos com `preco = 0` não alteram o total (são grátis dentro do limite)

5. **Modal de pagamento (botão "Pagamento"):**
   - 4 botões de forma de pagamento: Dinheiro / Débito / Crédito / Pix
   - Dinheiro: campo de valor recebido + cálculo de troco em tempo real
   - Outros: aviso "Confirme na maquininha"
   - Botão "Finalizar" → `POST /api/pedidos`

6. **Modal de sucesso:**
   - Exibe número do pedido e troco a devolver
   - Botão "Novo pedido" zera tudo

### Estado local (não persiste até finalizar)
O pedido vive em memória no Angular como `itensPedido: ItemPedidoLocal[]`. Só é persistido
no banco quando o usuário clica em "Finalizar pedido". Não há endpoint de "pedido em aberto".

---

## 9. Convenções de código

### Backend
- **DTOs como records Java** (`public record XxxDTO(...)`)
- **Mapeamento manual** em `XxxService.toDTO()` — sem MapStruct
- **Sem `@CrossOrigin`** — CORS configurado globalmente em `CorsConfig.java`
- **Initializers com `@Order`**: DataInitializer(1) → ProdutoInitializer(2) → ComplementoInitializer(3)
- **Snapshots em pedidos:** copiar nome/preço no momento da venda, nunca referenciar o objeto original
- **`@Transactional(readOnly = true)`** obrigatório em métodos que acessam coleções LAZY

### Frontend
- **Design system próprio** — classes `.finput`, `.flabel`, `.ferror`, `.dfield`, `.dlabel`, `.dhint`
- **Inputs:** 40px altura, 1.5px border, 8px border-radius, foco com glow na cor accent
- **Modais:** `[showHeader]="false"` no p-dialog (cardápio) ou header padrão com `header="Título"` (PDV)
- **Cores accent:** CSS custom properties `--accent`, `--cat-color` via `[style.--accent]="cat.cor"`
- **forkJoin** para carregar múltiplos recursos em paralelo
- **trackBy obrigatório** em todo `*ngFor` — nunca usar tipo errado (criar um trackBy por tipo de array)
- **`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`** para formatar preços (nunca `| currency` pipe sem registrar locale)
- **`.map()` no template Angular é inválido** — criar método helper no componente

### Qualidade
> "Codifique como um dev senior. Crie componentes reutilizáveis quando houver repetição."

---

## 10. Próxima tarefa — Pedidos do Dia

**Rota:** `/pedidos-do-dia`  
**Componente:** `PedidosDoDiaComponent`

### O que deve ser construído

Tela de acompanhamento dos pedidos registrados no dia:

1. **Header com totalizadores:**
   - Total de pedidos do dia
   - Faturamento total do dia
   - Distribuição por forma de pagamento (Dinheiro / Débito / Crédito / Pix)

2. **Lista/tabela de pedidos:**
   - Horário, número do pedido, forma de pagamento, valor total, status
   - Expandir pedido para ver os itens e complementos

3. **Ações:**
   - Cancelar pedido (muda status para CANCELADO, não exclui)
   - Reemitir cupom (placeholder por enquanto)

### Endpoint disponível
```
GET /api/pedidos  →  retorna List<PedidoRespostaDTO> dos pedidos de hoje
```

O `PedidoRespostaDTO` já inclui: id, dataHora, status, formaPagamento, valorTotal, valorPago, troco, itens (com complementos).

### Backend adicional necessário
- Endpoint `PATCH /api/pedidos/{id}/cancelar` para cancelamento
- Considerar filtro por data no `GET /api/pedidos?data=2026-05-03`

---

## 11. Módulos futuros (backlog)

1. ✅ ~~Cardápio com grupos de complementos~~
2. ✅ ~~Novo Pedido (PDV)~~
3. **Pedidos do Dia** — listagem, totalizadores, cancelamento (PRÓXIMA)
4. **Histórico** — filtro por data, exportação
5. **Dashboard** — faturamento, produtos mais vendidos, ticket médio
6. **NFC-e** — integração com SEFAZ-DF para emissão fiscal (deixar para o fim)
