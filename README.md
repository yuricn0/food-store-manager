# Food Store Manager

Sistema web para gerenciamento de uma loja de alimentos, desenvolvido como trabalho acadêmico.

A aplicação controla o catálogo de produtos e o estoque, registra pedidos de clientes e organiza as entregas em lotes, agrupando pedidos para otimizar as rotas do entregador.

## Status

Em desenvolvimento, com entregas incrementais:

- [x] **Entrega 1** — Catálogo de produtos com controle de estoque
- [ ] **Entrega 2** — Clientes e pedidos
- [ ] **Entrega 3** — Entregas em lotes
- [ ] **Entrega 4** — Autenticação e dashboard

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Front-end | React 19 + Vite + Tailwind CSS 4 |
| Back-end | Node.js + Express 5 |
| ORM | Prisma 6 |
| Banco de dados | PostgreSQL (hospedado no Supabase) |

## Arquitetura

O front-end não acessa o banco diretamente. Toda comunicação passa pela API, que concentra as regras de negócio.


O back-end é organizado em camadas com responsabilidades separadas:

- **routes** — define os endpoints
- **controllers** — traduz requisição e resposta HTTP
- **services** — regras de negócio e validações
- **repositories** — acesso ao banco via Prisma

Essa divisão isola as regras de negócio do protocolo HTTP e do banco: o service não sabe que existe uma requisição, e o controller não sabe que existe SQL.


## Como executar

### Pré-requisitos

- Node.js 18 ou superior
- Uma instância PostgreSQL (o projeto usa Supabase, mas qualquer Postgres funciona)

### Back-end

```bash
cd backend
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Preencha as variáveis com os dados do seu banco:

DATABASE_URL="postgresql://usuario:senha@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:senha@host:5432/postgres"
PORT=3000


> `DATABASE_URL` usa o pooler de conexões, utilizado pela aplicação.
> `DIRECT_URL` é a conexão direta, exigida pelas migrations.
> Se a senha tiver caracteres especiais (`@`, `#`, `%`), eles precisam ser codificados na URL.

Crie as tabelas e popule com dados de exemplo:

```bash
npx prisma migrate dev
npm run seed
```

Inicie o servidor:

```bash
npm run dev
```

A API fica disponível em `http://localhost:3000`.

### Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## API

### Produtos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/produtos` | Lista os produtos ativos |
| GET | `/produtos/:id` | Busca um produto |
| POST | `/produtos` | Cadastra um produto |
| PUT | `/produtos/:id` | Atualiza um produto |
| DELETE | `/produtos/:id` | Desativa um produto |
| PATCH | `/produtos/:id/estoque` | Soma ou subtrai do estoque |

Exemplo de cadastro:

```http
POST /produtos
Content-Type: application/json

{
  "nome": "Arroz Branco Tipo 1 - 5kg",
  "descricao": "Pacote de arroz agulhinha tipo 1",
  "preco": 27.90,
  "estoque": 60
}
```

Erros de validação retornam status 400 com a mensagem no campo `erro`:

```json
{ "erro": "Preço deve ser um número maior que zero" }
```

## Decisões de projeto

**Exclusão lógica.** Produtos não são apagados do banco, apenas marcados como inativos. Como os pedidos vão referenciar produtos, apagar um registro quebraria o histórico de vendas anteriores.

**Preço como `Decimal`.** Valores monetários usam `Decimal(10,2)` em vez de `Float`, que acumula erro de arredondamento. Por isso o preço trafega como string no JSON, e é convertido para número apenas na exibição.

**Estoque atualizado pelo banco.** O ajuste de estoque usa a operação `increment` do Prisma, que delega a soma ao PostgreSQL. Isso evita inconsistência quando duas requisições alteram o mesmo produto simultaneamente.

**Busca no cliente.** O filtro de produtos roda no navegador sobre a lista carregada, adequado para o volume atual. Com um catálogo grande, a busca deve migrar para o back-end.

## Autor

Yuri da Cruz Nunes.