let allPokemons = [];
let validPokemonTypes = []; // cache de tipos válidos

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

const fetchPokemonsFromAPI = async () => {
    const data = await fetchFromAPI('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0.');
    if (!data) throw new Error('Failed to fetch initial pokemons');

    const pokemonsList = data.results;

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

const handlePageLoad = async () => {

    try {
        // Carrega tipos válidos no cache
        validPokemonTypes = await loadValidPokemonTypes();
        console.log('Valid pokemon types loaded:', validPokemonTypes.length, 'types');

        const { pokemonsList, pokemonsData } = await fetchPokemonsFromAPI();

        const pokemonsWithDataAndImage = getPokemonData(pokemonsData);

        allPokemons = pokemonsWithDataAndImage;
        renderPokemonsGrid(allPokemons);

        const searchInput = document.querySelector('.search-container input');
        const searchBtn = document.querySelector('.search-btn');

        if (searchBtn && searchInput) {
            const runSearch = async () => {
                const term = searchInput.value.trim();

                if (!term) {
                    renderPokemonsGrid(allPokemons);
                    return;
                }

                const remoteResults = await searchRemotely(term);
                if (remoteResults.length > 0) {
                    renderPokemonsGrid(remoteResults);
                    return;
                }

                //todo: fazer uma mensagem de "nenhum resultado encontrado" em tela
                renderPokemonsGrid([]);
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