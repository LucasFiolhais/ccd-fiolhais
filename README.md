# Centro Cultural e Desportivo de Fiolhais

Projeto web desenvolvido para o **Centro Cultural e Desportivo de Fiolhais**, com o objetivo de criar uma plataforma moderna para divulgação de eventos, gestão de sócios, acompanhamento de quotas, inscrições em atividades e partilha de memórias da comunidade.

Este projeto foi desenvolvido como aplicação de treino e demonstração, usando dados mockados e persistência local através de `localStorage`.

---

## Objetivo do projeto

O objetivo principal deste projeto é simular uma plataforma completa para uma associação local.

A aplicação inclui uma área pública, onde visitantes podem consultar eventos, ver publicações e pedir inscrição como sócios, e uma área administrativa, onde é possível gerir sócios, eventos, quotas e publicações do mural.

---

## Funcionalidades principais

### Site público

- Página inicial com apresentação do CCD de Fiolhais.
- Agenda pública de eventos.
- Página individual de cada evento.
- Formulário público de inscrição em eventos.
- Página para pedido de inscrição como sócio.
- Mural público com publicações e memórias da comunidade.
- Página individual de cada publicação.
- Área do sócio com sessão simulada.

### Área do sócio

- Login simulado através do número de sócio.
- Consulta de dados pessoais.
- Consulta do estado atual da quota.
- Histórico de quotas.
- Consulta de inscrições em eventos.

### Backoffice

- Dashboard administrativo com estatísticas gerais.
- Gestão de sócios.
- Criação de novos sócios.
- Edição de dados de sócios.
- Inativação e remoção de sócios.
- Gestão de quotas.
- Geração de quotas anuais.
- Marcação de quotas como pagas.
- Gestão de eventos.
- Criação de eventos.
- Edição de eventos.
- Remoção de eventos.
- Gestão de inscrições em eventos.
- Marcação de inscrições como pagas.
- Cancelamento de inscrições.
- Gestão do mural.
- Criação de publicações.
- Edição de publicações.
- Publicação e despublicação de conteúdos.
- Remoção de publicações.
- Exportação de dados em formato compatível com Excel.

---

## Tecnologias utilizadas

- Nuxt
- Vue 3
- TypeScript
- Nuxt UI
- Tailwind CSS
- Composables
- localStorage
- Git
- GitHub

---

## Estrutura geral do projeto

```txt
app/
├── assets/
│   └── css/
├── components/
│   ├── admin/
│   ├── public/
│   └── shared/
├── composables/
├── layouts/
├── pages/
│   ├── admin/
│   ├── agenda/
│   ├── area-socio/
│   ├── mural/
│   └── socios/
├── types/
└── utils/

public/
└── images/
```

---

## Organização das páginas

### Área pública

```txt
/
 /agenda
 /agenda/[slug]
 /mural
 /mural/[slug]
 /socios/aderir
 /area-socio
 /area-socio/quotas
 /area-socio/eventos
```

### Área administrativa

```txt
/admin
/admin/socios
/admin/socios/novo
/admin/socios/[number]
/admin/socios/[number]/editar
/admin/eventos
/admin/eventos/novo
/admin/eventos/[slug]
/admin/eventos/[slug]/editar
/admin/quotas
/admin/mural
/admin/mural/novo
/admin/mural/[slug]/editar
```

---

## Dados e persistência

Nesta versão, os dados da aplicação são mockados. Isto significa que ainda não existe ligação real a uma base de dados.

Para melhorar a experiência de teste, foi implementada persistência com `localStorage`. Desta forma, quando são criados sócios, eventos, quotas ou publicações, os dados continuam disponíveis mesmo depois de atualizar a página.

Os dados persistidos incluem:

- Sócios.
- Eventos.
- Inscrições em eventos.
- Quotas.
- Publicações do mural.

Também existe a possibilidade de repor os dados locais, apagando os dados guardados no browser.

---

## Identidade visual

A interface foi adaptada à identidade visual do Centro Cultural e Desportivo de Fiolhais, usando como referência o logótipo da associação.

A paleta visual usa principalmente:

- Dourado.
- Preto.
- Cinza escuro.
- Branco.
- Tons neutros claros.

Durante o desenvolvimento, foram corrigidos problemas de contraste para garantir que os textos se mantêm legíveis tanto nas páginas públicas como na área administrativa.

---

## Como correr o projeto localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/LucasFiolhais/ccd-fiolhais.git
```

### 2. Entrar na pasta do projeto

```bash
cd ccd-fiolhais
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Depois, abrir no browser:

```txt
http://localhost:3000
```

---

## Scripts disponíveis

### Iniciar em modo desenvolvimento

```bash
npm run dev
```

### Gerar versão de produção

```bash
npm run build
```

### Pré-visualizar versão de produção

```bash
npm run preview
```

---

## Estado atual do projeto

O projeto encontra-se numa fase funcional de demonstração. As principais áreas da aplicação já estão implementadas, incluindo o site público, a área do sócio e o backoffice administrativo.

Atualmente, a aplicação ainda não utiliza autenticação real nem base de dados externa. As funcionalidades foram implementadas com dados mockados e persistência local, permitindo simular o comportamento de uma aplicação completa.

---

## Melhorias futuras

Algumas melhorias previstas para uma versão futura incluem:

- Integração com Supabase.
- Autenticação real para sócios e administradores.
- Base de dados para sócios, eventos, quotas e publicações.
- Upload real de imagens para o mural.
- Envio automático de emails.
- Sistema de permissões para administradores.
- Melhorias de responsividade em dispositivos móveis.
- Validações mais completas nos formulários.
- Histórico detalhado de alterações no backoffice.

---

## Organização do desenvolvimento

O desenvolvimento foi organizado com uma estratégia baseada em branches:

```txt
main      → versão estável
develop   → branch principal de desenvolvimento
feature/* → funcionalidades específicas
```

Cada funcionalidade foi desenvolvida numa branch própria, permitindo manter o histórico do projeto mais organizado.

Exemplos de branches usadas:

```txt
feature/public-layout
feature/events-page
feature/event-registration-form
feature/admin-layout
feature/admin-members-page
feature/admin-events-page
feature/local-storage-persistence
feature/admin-edit-member
feature/admin-edit-event
feature/admin-edit-post
feature/delete-actions
feature/ui-polish
feature/final-readme
```

---

## Autor

Projeto desenvolvido por **Lucas Fiolhais**.

Este projeto foi criado com fins académicos e de demonstração, tendo como base uma associação local real e procurando simular uma aplicação web completa para gestão comunitária.