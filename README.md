# Attus — Listagem de Usuários

Aplicação Angular 17 para listar, criar e editar usuários, replicando o protótipo fornecido. Dados mockados em serviço, sem backend.

## Stack

- **Angular 17+** (standalone components, signals, OnPush)
- **Angular Material 17** (toolbar, card, dialog, paginator, form-field, select, spinner, icon)
- **RxJS 7** — operadores: `switchMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `combineLatest`, `startWith`, `take`, `map`
- **Reactive Forms** + validadores customizados (CPF, telefone)
- **Jest 29** com `jest-preset-angular`
- TypeScript 5.4

## Pré-requisitos

- **Node.js ≥ 20** (testado em Node 24)
- **npm ≥ 10**

## Instalação

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` é necessário por uma divergência de peer de `zone.js` no npm moderno; a aplicação roda normalmente.

## Executando

### Servidor de desenvolvimento

```bash
npm start
```

Acesse [http://localhost:4200](http://localhost:4200). Hot-reload habilitado.

### Build de produção

```bash
npm run build
```

Saída em `dist/attus-users`.

### Testes

```bash
npm test            # roda a suíte completa
npm run test:cov    # com relatório de cobertura
```

Cobertura atual: **~93%** statements / lines (mínimo exigido: 60%).

## Estrutura

```
src/app/
├── app.component.ts          # raiz, apenas renderiza <app-user-list />
├── app.config.ts             # provideAnimations + zone change detection
└── users/
    ├── components/
    │   ├── user-list/        # listagem + toolbar + paginação
    │   └── user-form-dialog/ # modal de criação/edição
    ├── services/
    │   └── user.service.ts   # CRUD em memória, BehaviorSubject + timer
    ├── models/
    │   └── user.model.ts     # User, PhoneType
    ├── validators/
    │   └── validators.ts     # cpfValidator (DV), phoneValidator (10/11 dígitos)
    └── directives/
        └── mask.directive.ts # [appMask]="'cpf' | 'phone'"
```

## Funcionalidades

### Listagem ([user-list.component.ts](src/app/users/components/user-list/user-list.component.ts))

- Cards com avatar (iniciais + cor derivada do nome via hash), nome, e-mail, badge do tipo de telefone e botão de editar.
- Campo de busca por nome com **debounce 300ms** + `distinctUntilChanged`.
- Estados de **loading** (spinner) e **erro** (mensagem) durante o carregamento.
- **Paginação client-side** (`MatPaginator`) com opções 5/10/25 por página.
- Botão flutuante (FAB) abre o modal de criação.
- Subscriptions gerenciadas via `takeUntilDestroyed(destroyRef)`.

### Modal de criação/edição ([user-form-dialog.component.ts](src/app/users/components/user-form-dialog/user-form-dialog.component.ts))

Formulário reativo com os campos:

| Campo | Validações |
|-------|-----------|
| E-mail | obrigatório, `Validators.email` |
| Nome | obrigatório, mínimo 2 caracteres |
| CPF | obrigatório, 11 dígitos com dígitos verificadores válidos |
| Telefone | obrigatório, 10 ou 11 dígitos |
| Tipo de telefone | obrigatório (`CELULAR` / `RESIDENCIAL` / `COMERCIAL`) |

- Mensagens de erro por campo, exibidas após `touched`/`dirty`.
- Botão **SALVAR** desabilitado enquanto o formulário estiver inválido.
- No modo edição, o formulário é pré-preenchido a partir do usuário recebido em `MAT_DIALOG_DATA`.
- Máscaras aplicadas via diretiva `[appMask]` em CPF (`000.000.000-00`) e telefone (`(00) 00000-0000` / `(00) 0000-0000`).

### Dados mockados

Não há backend. O `UserService` mantém os usuários em um `BehaviorSubject` em memória e simula latência de rede com `timer(400)`. As alterações persistem durante a sessão.

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento em `:4200` |
| `npm run build` | Build de produção em `dist/attus-users` |
| `npm test` | Roda os testes (Jest) |
| `npm run test:cov` | Testes com relatório de cobertura |
| `npx ng build --configuration development` | Build sem otimização (mais rápido) |

## Notas

- **Permissões de cache do npm**: caso encontre `EACCES` em `~/.npm`, use um cache local: `npm install --legacy-peer-deps --cache /tmp/npm-cache`.
- O preset do Jest avisa sobre `setup-jest.js` deprecado — é apenas um warning do `jest-preset-angular` 14, não afeta a execução.
