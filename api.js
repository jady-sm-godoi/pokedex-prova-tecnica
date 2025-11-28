// Funções relacionadas a API e transformação de dados

export const getPokemonData = (pokemons) => {
    return pokemons.map(pokemon => ({
        name: pokemon.name,
        id: pokemon.id,
        types: pokemon.types.map(typeInfo => typeInfo.type.name),
        imageUrl: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
    }));
}

export const fetchFromAPI = async (url) => {
    try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (err) {
        console.error('Error fetching from API:', err);
        return null;
    }
}

export const loadValidPokemonTypes = async () => {
    const data = await fetchFromAPI('https://pokeapi.co/api/v2/type');
    return data ? data.results.map(t => t.name.toLowerCase()) : [];
}

export const fetchPokemonsFromAPI = async (pokemonsPerPage, offset = 0) => {
    const data = await fetchFromAPI(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonsPerPage}&offset=${offset}`);
    if (!data) throw new Error('Failed to fetch initial pokemons');

    const pokemonsList = data.results;
    const totalPokemons = data.count;

    const pokemonsData = await Promise.all(
        pokemonsList.map(pokemon => fetch(pokemon.url).then(r => r.json()))
    );

    return { pokemonsList, pokemonsData, totalPokemons };
}

export const searchRemotely = async (term, validPokemonTypes) => {
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
