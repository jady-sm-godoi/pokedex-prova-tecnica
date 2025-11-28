const getPokemonData = (pokemons) => {
    return pokemons.map(pokemon => ({
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types.map(typeInfo => typeInfo.type.name),
        imageUrl: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
    }));
}

const handlePageLoad = async () => {

    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0.');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { results: pokemonsList } = await response.json();

        // Fetch detailed data for each Pokémon
        const pokemonsData = await Promise.all(
            pokemonsList.map(pokemon => fetch(pokemon.url).then(response => response.json()))
        );

        const pokemonsWithDataAndImages = getPokemonData(pokemonsData);

        console.log("all", pokemonsWithDataAndImages);


    } catch (error) {
        //tratar erro melhor em tela
        console.error("Error fetching pokemons from API:", error);
        throw error;
    }

}

handlePageLoad();