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

const handlePageLoad = async () => {

    try {
        const { pokemonsList, pokemonsData } = await fetchPokemonsFromAPI();

        const pokemonsWithDataAndImage = getPokemonData(pokemonsData);

        console.log("list pokemons:", pokemonsList);
        console.log("list dados necessarios dos pokemons:", pokemonsWithDataAndImage);


    } catch (error) {
        //tratar erro melhor em tela
        console.error("Error fetching pokemons from API:", error);
        throw error;
    }

}

handlePageLoad();