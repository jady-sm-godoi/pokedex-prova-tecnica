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

const handlePageLoad = async () => {

    try {
        const { pokemonsList, pokemonsData } = await fetchPokemonsFromAPI();

        const pokemonsWithDataAndImage = getPokemonData(pokemonsData);

        allPokemons = pokemonsWithDataAndImage;
        renderPokemonsGrid(allPokemons);

        // console.log("list pokemons:", pokemonsList);
        // console.log("list dados necessarios dos pokemons:", pokemonsWithDataAndImage);
    } catch (error) {
        //tratar erro melhor em tela
        console.error("Error fetching pokemons from API:", error);
        throw error;
    }

}

handlePageLoad();