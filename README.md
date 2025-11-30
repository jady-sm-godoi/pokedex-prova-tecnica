# 🎮 Pokédex - Prova Técnica Front-end

Uma aplicação web moderna e responsiva para visualização e busca de Pokémon, desenvolvida como prova técnica para vaga de desenvolvedor front-end júnior.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Explicação das Lógicas de Desenvolvimento](#explicação-das-lógicas-de-desenvolvimento)
- [Arquitetura do Código](#arquitetura-do-código)

## 🎯 Sobre o Projeto

Este projeto é uma Pokédex interativa que permite aos usuários:
- Visualizar uma lista paginada de Pokémon
- Buscar Pokémon por nome, ID ou tipo
- Navegar entre páginas de resultados
- Ter uma experiência responsiva em dispositivos móveis

A aplicação consome dados da [PokeAPI](https://pokeapi.co/), uma API pública e gratuita que fornece informações sobre Pokémon.

## 🛠 Tecnologias Utilizadas

### Front-end Core
- **HTML5**: Estrutura semântica da aplicação
- **CSS3**: Estilização com recursos modernos como:
  - Flexbox e Grid Layout
  - Media Queries para responsividade
  - Transições e animações
  - Variáveis CSS (implícitas)
- **JavaScript ES6+**: Lógica da aplicação utilizando:
  - **Módulos ES6** (`import`/`export`): Organização modular do código
  - **Async/Await**: Tratamento assíncrono de requisições
  - **Fetch API**: Comunicação com a API externa
  - **Arrow Functions**: Sintaxe moderna de funções
  - **Template Literals**: Interpolação de strings
  - **Destructuring**: Desestruturação de objetos e arrays

### APIs e Serviços
- **PokeAPI**: API REST pública para dados de Pokémon
  - Endpoint principal: `https://pokeapi.co/api/v2/`

### Fontes
- **Google Fonts**: 
  - Inter
  - Roboto
  - DM Sans

## ✨ Funcionalidades

### 1. Listagem de Pokémon
- Exibe 18 Pokémon por página
- Paginação com botões "Anterior" e "Próximo"
- Indicadores de página numérica
- Carregamento dinâmico de dados da API

### 2. Sistema de Busca Inteligente
A busca funciona de três formas diferentes:

- **Busca por ID**: Digite um número (ex: `25` ou `#25`) para buscar pelo ID do Pokémon
- **Busca por Tipo**: Digite um tipo válido (ex: `fire`, `water`, `electric`) para listar Pokémon desse tipo
- **Busca por Nome**: Digite o nome do Pokémon (ex: `pikachu`, `charizard`)

### 3. Interface Responsiva
- Layout adaptável para desktop, tablet e mobile
- Menu hambúrguer para dispositivos móveis
- Grid de cards responsivo que se ajusta ao tamanho da tela

### 4. Paginação Dinâmica
- Mostra até 3 indicadores de página visíveis
- Oculta paginação quando não há necessidade
- Desabilita botões quando não há páginas anteriores/próximas

## 📁 Estrutura do Projeto

```
PROVA-TECNICA-POKEDEX/
│
├── index.html          # Estrutura HTML principal
├── script.js           # Lógica principal da aplicação
├── api.js              # Funções de comunicação com a API
├── utils.js            # Funções auxiliares de renderização
├── style.css           # Estilos da aplicação
├── assets/
│   └── pokedex-logo.png  # Logo da aplicação
└── README.md           # Documentação do projeto
```

## 🚀 Como Executar

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor local (opcional, mas recomendado)

### Passo a Passo

1. **Clone ou baixe o repositório**
   ```bash
   git clone https://github.com/jady-sm-godoi/pokedex-prova-tecnica.git
   cd PROVA-TECNICA-POKEDEX
   ```

2. **Abra o projeto**
   
   **Opção 1: Usar extensão Go Live (VS Code) - Recomendado**
   - Abra o projeto no Visual Studio Code
   - Instale a extensão "Live Server" (Ritwick Dey) ou "Go Live" se ainda não tiver
   - Clique com o botão direito no arquivo `index.html`
   - Selecione "Open with Live Server" ou clique no botão "Go Live" na barra inferior do VS Code
   - O projeto abrirá automaticamente no navegador em `http://127.0.0.1:5500` (ou porta similar)
   - ✅ **Vantagem**: Atualiza automaticamente quando você salva alterações nos arquivos
   
   **Opção 2: Abrir diretamente no navegador**
   - Abra o arquivo `index.html` diretamente no navegador
   - ⚠️ **Nota**: Alguns navegadores podem bloquear requisições CORS quando o arquivo é aberto diretamente
   

## 📚 Explicação das Lógicas de Desenvolvimento

### 1. Sistema de Módulos ES6

Módulos ES6 permitem dividir o código JavaScript em arquivos separados, onde cada arquivo pode exportar funções, variáveis ou classes usando `export`, e importar essas funcionalidades em outros arquivos usando `import`. Isso facilita a organização, manutenção e reutilização do código.

O projeto utiliza **módulos ES6** para organizar o código em arquivos separados:

```javascript
// api.js
export const fetchFromAPI = async (url) => { ... }

// script.js
import { fetchFromAPI } from './api.js';
```

**Por que usar módulos?**
- **Organização**: Cada arquivo tem uma responsabilidade específica
- **Reutilização**: Funções podem ser importadas onde necessário
- **Manutenção**: Facilita encontrar e corrigir bugs
- **Colaboração**: Múltiplos desenvolvedores podem trabalhar em arquivos diferentes

### 2. Comunicação com API (Fetch API)

A aplicação usa `fetch()` para fazer requisições HTTP:

```javascript
const resp = await fetch(url);
const data = await resp.json();
```

**Como funciona:**
1. `fetch()` retorna uma **Promise** (promessa de um resultado futuro)
2. `await` pausa a execução até a Promise ser resolvida
3. `.json()` converte a resposta em um objeto JavaScript

**Tratamento de Erros:**
```javascript
try {
    const data = await fetchFromAPI(url);
    // usar os dados
} catch (err) {
    console.error('Erro:', err);
    // tratar o erro
}
```

### 3. Busca Inteligente (searchRemotely)

A função `searchRemotely` implementa uma lógica de busca em três etapas:

```javascript
// 1. Verifica se é número (busca por ID)
if (isNumericSearch) {
    // Busca direta por ID
}

// 2. Verifica se é um tipo válido
if (validPokemonTypes.includes(cleaned)) {
    // Busca todos os Pokémon desse tipo
}

// 3. Caso contrário, busca por nome
// Busca direta por nome
```

**Por que essa abordagem?**
- **Eficiência**: Evita fazer múltiplas requisições desnecessárias
- **Experiência do usuário**: Responde rapidamente ao tipo de busca
- **Flexibilidade**: Aceita diferentes formatos de entrada

### 4. Paginação

O sistema de paginação funciona de duas formas:

**Paginação Normal (sem busca):**
- Calcula o `offset` baseado na página atual
- Faz uma nova requisição à API para cada página
- Exemplo: Página 2 com 18 itens = `offset: 18`

**Paginação de Resultados (com busca):**
- Mantém todos os resultados da busca em memória
- Divide os resultados em "fatias" (slices) para cada página
- Não precisa fazer nova requisição ao mudar de página

```javascript
// Paginação local (mais rápida)
const startIdx = (currentPage - 1) * pokemonsPerPage;
const endIdx = startIdx + pokemonsPerPage;
renderPokemonsGrid(searchResults.slice(startIdx, endIdx));
```

### 5. Transformação de Dados (getPokemonData)

A API retorna muitos dados, mas a aplicação só precisa de alguns:

```javascript
// Dados da API (complexos)
{
    id: 25,
    name: "pikachu",
    types: [{ type: { name: "electric" } }],
    sprites: { 
        other: { 
            'official-artwork': { 
                front_default: "url..." 
            } 
        } 
    }
}

// Dados transformados (simplificados)
{
    id: 25,
    name: "pikachu",
    types: ["electric"],
    imageUrl: "url..."
}
```

**Por que transformar?**
- **Simplicidade**: Facilita o uso dos dados no código
- **Performance**: Menos dados para processar
- **Manutenção**: Se a API mudar, só precisa ajustar em um lugar

### 6. Renderização Dinâmica

A função `renderPokemonsGrid` cria HTML dinamicamente:

```javascript
grid.innerHTML = pokemons.map(pokemon => `
    <div class="card">
        <p>${pokemon.name}</p>
        <img src="${pokemon.imageUrl}">
    </div>
`).join('');
```

**Como funciona:**
1. `.map()` cria um array de strings HTML (uma para cada Pokémon)
2. `.join('')` une todas as strings em uma única string
3. `innerHTML` insere o HTML no elemento do DOM

**Por que renderizar dinamicamente?**
- **Sem recarregar a página**: A renderização dinâmica atualiza apenas o conteúdo necessário sem recarregar toda a página, proporcionando uma experiência mais fluida e rápida para o usuário
- **Melhor performance**: Apenas os elementos que mudaram são atualizados, não toda a página
- **Experiência moderna**: Cria uma aplicação mais interativa e responsiva, similar a aplicações Single Page Application (SPA)

**Por que usar Template Literals?**
- Permite interpolar variáveis diretamente: `${variável}`
- Suporta múltiplas linhas
- Mais legível que concatenação de strings



## 🏗 Arquitetura do Código

### Fluxo de Dados

```
1. Usuário abre a página
   ↓
2. handlePageLoad() executa
   ↓
3. Carrega tipos válidos de Pokémon (cache)
   ↓
4. Busca primeira página de Pokémon na API
   ↓
5. Transforma dados (getPokemonData)
   ↓
6. Renderiza cards na tela (renderPokemonsGrid)
   ↓
7. Configura event listeners (busca, paginação)
```

### Separação de Responsabilidades

- **`api.js`**: Toda comunicação com a API externa
- **`utils.js`**: Funções de renderização e manipulação do DOM
- **`script.js`**: Orquestração geral, gerenciamento de estado, eventos
- **`style.css`**: Aparência visual e layout

### Gerenciamento de Estado

A aplicação mantém estado global através de variáveis:

```javascript
let allPokemons = [];           // Lista completa de Pokémon
let validPokemonTypes = [];     // Tipos válidos (cache)
let currentPage = 1;            // Página atual
let pokemonsPerPage = 18;       // Itens por página
let totalPokemons = 0;          // Total de Pokémon disponíveis
let searchTerm = '';            // Termo de busca atual
let searchResults = [];         // Resultados da busca
```

**Por que variáveis globais?**
- Simplicidade para um projeto pequeno
- Fácil acesso de qualquer função


## 📄 Licença

Este projeto foi desenvolvido como prova técnica e está disponível para fins educacionais.

---

**Desenvolvido com ❤️ para demonstração de habilidades front-end**
