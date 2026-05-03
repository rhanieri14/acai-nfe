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
| Acompanhamentos grátis | 3 por produto (padrão) |
| Caldas grátis | 1 por produto (padrão) |
| Extra acima do limite | +R$ 3,00 cada |
| Especiais | Sempre cobrados (preço definido no cadastro) |
| Barca | NÃO aceita Especiais |

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
docker compose -f docker-compose.dev.yml up
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
│       ├── enums/            # TipoComplemento, Ambiente, RegimeTributario
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
├── docker-compose.yml        # Produção (não usado ainda)
└── PLAYBOOK.md               # Este arquivo
```

---

## 5. Modelo de Dados

### Hierarquia principal

```
Categoria (1) ──> (N) Produto (1) ──> (N) Complemento (Subproduto)
```

### Entidades

**Categoria**
```java
id, nome, icone (pi pi-*), cor (#hex), ordem (int), ativo
```

**Produto**
```java
id, nome, descricao, categoria (FK), tamanho, preco, ativo, ordem
```

**Complemento** (chamado "Subproduto" na UI)
```java
id, nome, tipo (ACOMPANHAMENTO|CALDA|ESPECIAL), produto (FK), precoExtra, ativo, ordem
```

**Empresa** — configurações NFC-e
```java
id, razaoSocial, cnpj, ie, csc, cscId, serie, proximoNumero, ambiente, regimeTributario, ...
```

### Dados seed (ProdutoInitializer — só roda se banco vazio)

Categorias criadas automaticamente:
- Açaí Tradicional (#6B2D5C), Açaí Zero (#0D9488), Casadinho (#D97706)
- Barca (#2563EB), Pizza (#7C3AED), Milk-Shake (#0891B2)
- Doces (#B45309), Bebidas (#2563EB)

Produtos: Açaí 200ml–1L em cada categoria açaí, BARCA 1P–8P, Pizza Açaí, Milk-Shake 300/500ml, Bala Fini, Sonho de Valsa, Água, Água com Gás, Refrigerante Lata, Energético.

**Subprodutos não têm seed** — são cadastrados manualmente pela UI (Categoria → Produto → Subproduto).

---

## 6. Endpoints da API

| Método | URL | Descrição |
|---|---|---|
| GET | /api/categorias | Lista todas |
| POST | /api/categorias | Cria |
| PUT | /api/categorias/{id} | Atualiza |
| DELETE | /api/categorias/{id} | Remove |
| GET | /api/produtos | Lista todos (ordenado por categoria.ordem → produto.ordem → nome) |
| POST | /api/produtos | Cria |
| PUT | /api/produtos/{id} | Atualiza |
| PATCH | /api/produtos/{id}/toggle | Ativa/desativa |
| DELETE | /api/produtos/{id} | Remove |
| POST | /api/produtos/copiar | Copia produtos entre categorias |
| GET | /api/complementos | Lista todos (suporta ?produtoId=X&apenasAtivos=true) |
| POST | /api/complementos | Cria subproduto |
| PUT | /api/complementos/{id} | Atualiza |
| PATCH | /api/complementos/{id}/toggle | Ativa/desativa |
| DELETE | /api/complementos/{id} | Remove |
| GET | /api/empresa | Configurações da empresa |
| PUT | /api/empresa | Atualiza configurações |

---

## 7. Telas implementadas

| Rota | Componente | Status |
|---|---|---|
| /dashboard | DashboardComponent | Placeholder |
| /novo-pedido | NovoPedidoComponent | **Próxima tarefa** |
| /pedidos-do-dia | PedidosDoDiaComponent | Placeholder |
| /cardapio | CardapioComponent | ✅ Completo |
| /complementos | ComplementosComponent | ✅ Completo (UI = "Subprodutos") |
| /historico | HistoricoComponent | Placeholder |
| /configuracoes | ConfiguracoesComponent | ✅ Completo |

---

## 8. Convenções de código

### Backend
- **DTOs como records Java** (`public record XxxDTO(...)`)
- **Mapeamento manual** em `XxxService.toDTO()` e `toEntity()` — sem MapStruct
- **Sem `@CrossOrigin`** nos controllers — CORS configurado globalmente em `CorsConfig.java`
- **Initializers com `@Order`**: DataInitializer(1) → ProdutoInitializer(2) → ComplementoInitializer(3)
- **`buscarEntidade(Long id)`** em todo service retorna a entidade JPA (uso interno entre services)
- Ordenação via nome do método JPA: `findAllByOrderByCategoriaOrdemAscOrdemAscNomeAsc()`

### Frontend
- **Design system próprio** — classes `.finput`, `.flabel`, `.ferror`, `.dfield`, `.dlabel`, `.dhint`
- **Inputs:** 40px altura, 1.5px border, 8px border-radius, foco com glow na cor accent
- **Modais:** `[showHeader]="false"` no p-dialog, header customizado com `.dialog-header`
- **Cores dinâmicas:** CSS custom properties `--accent`, `--cat-color` via `[style.--accent]="cat.cor"`
- **forkJoin** para carregar múltiplos recursos em paralelo
- **trackBy obrigatório** em todo `*ngFor`
- Evitar `$any()` para indexar `Record<TipoEnum, ...>` — usar `Record<string, ...>` no modelo

### Qualidade (padrão estabelecido pelo Rhanieri)
> "Codifique como um dev senior. Crie componentes reutilizáveis quando houver repetição."

---

## 9. Problemas conhecidos / Pendências

### ⚠️ Banco desatualizado
O banco atual (antes do down -v) tem dados **antigos** cadastrados manualmente com nomes diferentes dos que o seed gera. Ao trocar de máquina, rodar sempre:
```bash
docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up
```

### ⚠️ Arquivo órfão
`backend/src/main/java/com/acainfe/enums/Categoria.java` — enum antigo que foi substituído pela entidade `model/Categoria.java`. Não é usado mas não foi deletado (sem ferramenta de delete disponível). Não causa erro de compilação.

### ⚠️ Chips do Cardápio
Os chips de filtro de categoria exibiam nomes antigos (Açaí, Barca, Pizza Doce) porque o banco tinha dados pré-seed. Após `down -v` devem mostrar os nomes corretos do seed.

---

## 10. Próxima tarefa — Novo Pedido (PDV)

**O que deve ser construído:**

### Backend
Criar entidades `Pedido` e `ItemPedido`:
```
Pedido: id, numero, status (ABERTO|FECHADO|CANCELADO), total, criadoEm, fechadoEm
ItemPedido: id, pedido(FK), produto(FK), quantidade, precoUnitario, subtotal
ItemComplemento: id, itemPedido(FK), complemento(FK), precoAplicado
```

### Frontend — tela `/novo-pedido`
Fluxo do atendimento:
1. **Selecionar produto** — grade de cards por categoria (como o cardápio)
2. **Configurar item** — modal com:
   - Acompanhamentos: exibe lista, marca os selecionados, calcula extras acima de 3
   - Caldas: exibe lista, 1 grátis, extras +R$3
   - Especiais: exibe lista, sempre cobrado (não mostrar em Barca)
3. **Resumo do pedido** — painel lateral com itens, subtotais e total
4. **Fechar pedido** — confirma e salva

### Regras de preço dos subprodutos no pedido
```
ACOMPANHAMENTO: grátis até 3; a partir do 4º → +R$ complemento.precoExtra
CALDA:          grátis 1; a partir do 2º → +R$ complemento.precoExtra
ESPECIAL:       sempre → +R$ complemento.precoExtra (não disponível em Barca)
```

---

## 11. Módulos futuros (backlog)

1. **Pedidos do Dia** — listagem e gestão dos pedidos do dia
2. **Histórico** — filtro por data, exportação
3. **Dashboard** — faturamento, produtos mais vendidos, ticket médio
4. **NFC-e** — integração com SEFAZ-DF para emissão fiscal
