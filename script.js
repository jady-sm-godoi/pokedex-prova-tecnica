
let allPokemons = [];
let validPokemonTypes = [];
let currentPage = 1;
let pokemonsPerPage = 18;
let totalPokemons = 0;
let searchTerm = '';
let searchResults = [];

const getPokemonData = (pokemons) => {
    return pokemons.map(pokemon => ({
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types.map(typeInfo => typeInfo.type.name),
        imageUrl: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
    }));
}

const fetchFromAPI = async (url) => {
    try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (err) {
        console.error('Error fetching from API:', err);
        return null;
    }
}

const loadValidPokemonTypes = async () => {
    const data = await fetchFromAPI('https://pokeapi.co/api/v2/type');
    return data ? data.results.map(t => t.name.toLowerCase()) : [];
}

const fetchPokemonsFromAPI = async (offset = 0) => {
    const data = await fetchFromAPI(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonsPerPage}&offset=${offset}`);
    if (!data) throw new Error('Failed to fetch initial pokemons');

    const pokemonsList = data.results;
    totalPokemons = data.count; // armazena o total para calcular páginas

    const pokemonsData = await Promise.all(
        pokemonsList.map(pokemon => fetch(pokemon.url).then(r => r.json()))
    );

    return { pokemonsList, pokemonsData };
}

const renderPokemonsGrid = (pokemons) => {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    grid.innerHTML = pokemons.map(pokemon => `
        <div class="card">
            <p class="type">${pokemon.types.join(', ')}</p>
            <p class="id">#${String(pokemon.id).padStart(3, '0')}</p>
            <img src="${pokemon.imageUrl}" alt="${pokemon.name}">
            <p class="name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
        </div>
    `).join('');
}


const searchRemotely = async (term) => {
    const cleaned = term.toString().trim().toLowerCase().replace(/^#/, '');
    if (!cleaned) return [];

    const asNumber = Number(cleaned);
    const isNumericSearch = !Number.isNaN(asNumber);

    try {
        // Estratégia 1: se o termo for numérico, busca por ID
        if (isNumericSearch) {
            const data = await fetchFromAPI(`https://pokeapi.co/api/v2/pokemon/${asNumber}`);
            if (data) {
                const [processed] = getPokemonData([data]);
                return [processed];
            }
            return [];
        }

        // Estratégia 2: se o termo for palavra e está na lista de tipos, busca por tipo
        if (validPokemonTypes.includes(cleaned)) {
            const data = await fetchFromAPI(`https://pokeapi.co/api/v2/type/${cleaned}`);
            if (!data) return [];

            const list = data.pokemon.map(poke => poke.pokemon).slice(0, 20);

            const pokemonsData = await Promise.all(
                list.map(pokedata => fetch(pokedata.url).then(resp => resp.json()))
            );

            return getPokemonData(pokemonsData);
        }

        // Estratégia 3: se o termo for palavra e não está em tipos, busca por nome
        const data = await fetchFromAPI(`https://pokeapi.co/api/v2/pokemon/${cleaned}`);
        if (data) {
            const [processed] = getPokemonData([data]);
            return [processed];
        }

        return [];
    } catch (err) {
        console.error('Error searching remotely:', err);
        return [];
    }
}


//PAGINAÇÃO
const getTotalPages = () => Math.ceil(totalPokemons / pokemonsPerPage);

const updatePaginationsBtnsStyles = () => {
    const totalPages = getTotalPages();
    const prevBtn = document.querySelector('.pagination button:first-child');
    const nextBtn = document.querySelector('.pagination button:last-child');
    const pageSpans = document.querySelectorAll('.pagination .page');

    // desabilita botão anterior se está na primeira página
    if (prevBtn) prevBtn.disabled = currentPage === 1;

    // desabilita botão próximo se está na última página
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    // atualiza a classe 'active' nos indicadores de página
    pageSpans.forEach((span) => {
        span.classList.toggle('active', parseInt(span.textContent) === currentPage);
    });
}

const constructorPaginationButtons = (pagesToShow, nextBtn) => {
    pagesToShow.forEach(pageNum => {
        let elem;
        if (pageNum === 'dots-before' || pageNum === 'dots-after') {
            elem = document.createElement('span');
            elem.className = 'pagination-dots';
            elem.textContent = '...';
        } else {
            elem = document.createElement('span');
            elem.className = 'page';
            if (pageNum === currentPage) elem.classList.add('active');
            elem.textContent = pageNum;
            elem.addEventListener('click', () => goToPage(pageNum));
        }
        nextBtn.parentNode.insertBefore(elem, nextBtn);
    });
}

const renderPaginationIndicators = () => {
    let totalPages;
    if (searchTerm && searchResults.length > pokemonsPerPage) {
        totalPages = Math.ceil(searchResults.length / pokemonsPerPage);
    } else {
        totalPages = getTotalPages();
    }

    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    // remove os indicadores antigos
    const oldPageSpans = pagination.querySelectorAll('.page, .pagination-dots');
    oldPageSpans.forEach(span => span.remove());

    const nextBtn = pagination.querySelector('button:last-child');
    
    const maxVisibleIndicators = 3;
    let pagesToShow = [];

    if (totalPages <= maxVisibleIndicators) {
        for (let i = 1; i <= totalPages; i++) {
            pagesToShow.push(i);
        }
    } else {
        const start = Math.max(1, currentPage - 1);
        const end = Math.min(totalPages, currentPage + 1);

        if (start > 1) {
            pagesToShow.push('dots-before');
        }

        for (let i = start; i <= end; i++) {
            pagesToShow.push(i);
        }

        if (end < totalPages) {
            pagesToShow.push('dots-after');
        }
    }

    constructorPaginationButtons(pagesToShow, nextBtn);
}

//disparado a cada clique de paginação
const goToPage = async (pageNumber) => {
    let totalPages;
    if (searchTerm && searchResults.length > pokemonsPerPage) {
        totalPages = Math.ceil(searchResults.length / pokemonsPerPage);
    } else {
        totalPages = getTotalPages();
    }
    if (pageNumber < 1 || pageNumber > totalPages) return;

    currentPage = pageNumber;

    if (searchTerm && searchResults.length > pokemonsPerPage) {
        // Paginação local dos resultados da busca
        const startIdx = (currentPage - 1) * pokemonsPerPage;
        const endIdx = startIdx + pokemonsPerPage;
        renderPokemonsGrid(searchResults.slice(startIdx, endIdx));
        renderPaginationIndicators();
        updatePaginationsBtnsStyles();
    } else {
        // Paginação normal
        const offset = (currentPage - 1) * pokemonsPerPage;
        try {
            const { pokemonsData } = await fetchPokemonsFromAPI(offset);
            const pokemonsWithData = getPokemonData(pokemonsData);
            renderPokemonsGrid(pokemonsWithData);
            renderPaginationIndicators();
            updatePaginationsBtnsStyles();
        } catch (error) {
            console.error('Error changing page:', error);
        }
    }
}

const handlePageLoad = async () => {

    try {
        // Carrega tipos válidos no cache
        validPokemonTypes = await loadValidPokemonTypes();
        console.log('Valid pokemon types loaded:', validPokemonTypes.length, 'types');

        const { pokemonsList, pokemonsData } = await fetchPokemonsFromAPI();

        const pokemonsWithDataAndImage = getPokemonData(pokemonsData);

        allPokemons = pokemonsWithDataAndImage;
        renderPokemonsGrid(allPokemons);
        renderPaginationIndicators();
        updatePaginationsBtnsStyles();
        
        const prevBtn = document.querySelector('.pagination button:first-child');
        const nextBtn = document.querySelector('.pagination button:last-child');
        
        if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        
        const searchInput = document.querySelector('.search-container input');
        const searchBtn = document.querySelector('.search-btn');

        if (searchBtn && searchInput) {
            const runSearch = async () => {
                const term = searchInput.value.trim();

                if (!term) {
                    searchTerm = '';
                    searchResults = [];
                    currentPage = 1;
                    renderPokemonsGrid(allPokemons);
                    const pagination = document.querySelector('.pagination');
                    if (pagination) pagination.style.display = '';
                    renderPaginationIndicators();
                    updatePaginationsBtnsStyles();
                    return;
                }

                searchTerm = term;
                const remoteResults = await searchRemotely(term);
                searchResults = remoteResults;
                currentPage = 1;
                const pagination = document.querySelector('.pagination');
                if (remoteResults.length > 0) {
                    if (remoteResults.length > pokemonsPerPage) {
                        pagination.style.display = '';
                        renderPokemonsGrid(remoteResults.slice(0, pokemonsPerPage));
                        renderPaginationIndicators();
                        updatePaginationsBtnsStyles();
                    } else {
                        renderPokemonsGrid(remoteResults);
                        pagination.style.display = 'none';
                    }
                    return;
                }

                //todo: fazer uma mensagem de "nenhum resultado encontrado" em tela
                renderPokemonsGrid([]);
                if (pagination) pagination.style.display = 'none';
            }

            searchBtn.addEventListener('click', runSearch);
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') runSearch();
            });
        }

        // console.log("list pokemons:", pokemonsList);
        // console.log("list dados necessarios dos pokemons:", pokemonsWithDataAndImage);
    } catch (error) {
        //tratar erro melhor em tela
        console.error("Error fetching pokemons from API:", error);
        throw error;
    }

}

handlePageLoad();