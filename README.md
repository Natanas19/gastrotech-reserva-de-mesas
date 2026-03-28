# 🍽 GastroTech

Sistema de reserva de mesas para restaurante — **React + Vite + LocalStorage**

---

## 📁 Estrutura de Pastas

```
gastrotech/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── (coloque aqui logo.png, mesas.jpg quando tiver)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AppContext.jsx       ← Estado global (usuários, reservas, auth)
    ├── components/
    │   ├── Header.jsx           ← Header com logo e botão logout
    │   ├── Footer.jsx           ← Footer com copyright
    │   ├── Dropdown.jsx         ← Dropdown customizado
    │   ├── MesaMap.jsx          ← Mapa de mesas interativo
    │   └── Modals.jsx           ← AlertToast, ConfirmModal, InfoModal
    └── pages/
        ├── LoginPage.jsx        ← Tela 1
        ├── HomePage.jsx         ← Tela 2
        ├── ReservaPage.jsx      ← Tela 3
        ├── ConfirmacaoPage.jsx  ← Tela 4
        ├── CadastroPage.jsx     ← Tela 5
        ├── AdminPage.jsx        ← Tela 6
        ├── MinhasReservasPage.jsx
        └── EditarReservaPage.jsx
```

---

## 🚀 Como Rodar

### 1. Instale as dependências

```bash
npm install
```

### 2. Rode em desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:5173**

### 3. Build para produção

```bash
npm run build
```

---

## 🔐 Acesso Admin

Na tela de login, use:
- **E-mail:** `admin`
- **Senha:** `0000`

---

## 🎨 Paleta de Cores

| Nome             | Hex       |
|------------------|-----------|
| Preto            | `#1F1F1F` |
| Branco           | `#FEFEFD` |
| Vinho            | `#3A1C21` |
| Vinho Fraco      | `#58343E` |
| Dourado          | `#EBBA55` |
| Dourado Contorno | `#F58634` |
| Vermelho         | `#ED3237` |
| Verde            | `#00A859` |

---

## 📦 Dependências

| Pacote             | Uso                        |
|--------------------|----------------------------|
| `react`            | UI                         |
| `react-dom`        | Renderização               |
| `react-router-dom` | Navegação entre telas      |
| `qrcode`           | Geração de QR Code         |
| `vite`             | Build tool                 |
| `@vitejs/plugin-react` | Plugin React para Vite |

---

## 💡 Regras de Mesas por Capacidade

| Filtro     | Mesas visíveis |
|------------|----------------|
| 2 lugares  | 1, 2, 3, 4     |
| 4 lugares  | 5, 6, 7, 8     |
| 8 lugares  | 9, 10          |
| 16 lugares | 11, 12         |

---

## 🗄 Banco de Dados (futuro)

Atualmente usa **LocalStorage**. Para migrar ao banco:
1. Crie um backend (Node.js + Express ou similar)
2. Substitua as funções em `AppContext.jsx` por chamadas `fetch()` à API
3. Os componentes **não precisam mudar**, apenas o contexto

---

## 📝 Observações

- Fonte atual: **Playfair Display** (display) + **DM Sans** (corpo) via Google Fonts
- O mapa de mesas é gerado em **SVG inline** — para usar a imagem `mesas.jpg`, troque o `<svg>` em `MesaMap.jsx` por `<img src="/mesas.jpg" className="mesa-map-img" />`
- Logo: coloque `logo.png` em `/public/` e importe no `Header.jsx`

---

## 🔄 Próximos Passos

- [ ] Conectar banco de dados (MySQL / PostgreSQL / Firebase)
- [ ] Validação completa de CPF
- [ ] Tela de recuperação de senha
- [ ] Zoom e tela cheia no mapa de mesas
- [ ] Deploy no GitHub Pages ou Vercel
