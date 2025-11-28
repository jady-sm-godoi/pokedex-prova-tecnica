let allPokemons = [];

const getPokemonData = (pokemons) => {
    return pokemons.map(pokemon => ({
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types.map(typeInfo => typeInfo.type.name),
        imageUrl: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
    }));
}

const fetchPokemonsFromAPI = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0.');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const {results: pokemonsList} = await response.json();

        const pokemonsData = await Promise.all(
            pokemonsList.map(pokemon => fetch(pokemon.url).then(r => r.json()))
        );

        return { pokemonsList, pokemonsData };
    } catch (error) {
        console.error("Error fetching pokemons from API:", error);
        throw error;
    }
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

const searchPokemons = (pokemons, term) => {
    if (!term || !term.toString().trim()) return pokemons;

    const normalized = term.toString().trim().toLowerCase();
    //regex para remover # no termo de busca
    const cleaned = normalized.replace(/^#/, ''); 

    const asNumber = Number(cleaned);
    const isNumericSearch = cleaned !== '' && !Number.isNaN(asNumber);

    return pokemons.filter(poke => {
        // filtro nome
        if (poke.name && poke.name.toLowerCase().includes(cleaned)) return true;

        // filtro pelo id
        if (isNumericSearch) {
            if (poke.id === asNumber) return true;
            if (String(poke.id).padStart(3, '0') === cleaned) return true;
        }

        // filtro pelo tipo
        if (poke.types && poke.types.some(t => t.toLowerCase().includes(cleaned))) return true;

        return false;
    });
}

const handlePageLoad = async () => {

    try {
        const { pokemonsList, pokemonsData } = await fetchPokemonsFromAPI();

        const pokemonsWithDataAndImage = getPokemonData(pokemonsData);

        allPokemons = pokemonsWithDataAndImage;
        renderPokemonsGrid(allPokemons);

        const searchInput = document.querySelector('.search-container input');
        const searchBtn = document.querySelector('.search-btn');

        if (searchBtn && searchInput) {
            const runSearch = () => {
                const term = searchInput.value;
                const results = searchPokemons(allPokemons, term);
                renderPokemonsGrid(results);
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