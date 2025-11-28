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

        console.log("pokemonsList", pokemonsList)
        console.log("pokemonData:cada um", pokemonsData)


    } catch (error) {
        //tratar erro melhor em tela
        console.error("Error fetching pokemons from API:", error);
        throw error;
    }

}

handlePageLoad();