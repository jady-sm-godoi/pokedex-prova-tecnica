
import { getPokemonData, loadValidPokemonTypes, fetchPokemonsFromAPI, searchRemotely } from './api.js';
import { 
    renderPokemonsGrid, 
    getTotalPages, 
    updatePaginationsBtnsStyles, 
    renderPaginationIndicators, 
    togglePaginationVisibility 
} from './utils.js';

let allPokemons = [];
let validPokemonTypes = [];
let currentPage = 1;
let pokemonsPerPage = 18;
let totalPokemons = 0;
let searchTerm = '';
let searchResults = [];

const renderPokemonsGridWrapper = (pokemons) => {
    renderPokemonsGrid(pokemons);
}

//PAGINAÇÃO
const getTotalPagesLocal = () => getTotalPages(totalPokemons, pokemonsPerPage);

const updatePaginationsBtnsStylesLocal = () => {
    const totalPages = getTotalPagesLocal();
    updatePaginationsBtnsStyles(currentPage, totalPages);
}

//disparado a cada clique de paginação
const goToPage = async (pageNumber) => {
    let totalPages;
    if (searchTerm && searchResults.length > pokemonsPerPage) {
        totalPages = Math.ceil(searchResults.length / pokemonsPerPage);
    } else {
        totalPages = getTotalPagesLocal();
    }
    if (pageNumber < 1 || pageNumber > totalPages) return;

    currentPage = pageNumber;

    if (searchTerm && searchResults.length > pokemonsPerPage) {
        // Paginação local dos resultados da busca
        const startIdx = (currentPage - 1) * pokemonsPerPage;
        const endIdx = startIdx + pokemonsPerPage;
        renderPokemonsGrid(searchResults.slice(startIdx, endIdx));
        renderPaginationIndicators(searchTerm, searchResults, pokemonsPerPage, totalPokemons, currentPage, goToPage);
        updatePaginationsBtnsStylesLocal();
    } else {
        // Paginação normal
        const offset = (currentPage - 1) * pokemonsPerPage;
        try {
            const { pokemonsData, totalPokemons: total } = await fetchPokemonsFromAPI(pokemonsPerPage, offset);
            totalPokemons = total;
            const pokemonsWithData = getPokemonData(pokemonsData);
            renderPokemonsGrid(pokemonsWithData);
            renderPaginationIndicators(searchTerm, searchResults, pokemonsPerPage, totalPokemons, currentPage, goToPage);
            updatePaginationsBtnsStylesLocal();
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

        const { pokemonsData, totalPokemons: total } = await fetchPokemonsFromAPI(pokemonsPerPage, 0);
        totalPokemons = total;
        const pokemonsWithDataAndImage = getPokemonData(pokemonsData);

        allPokemons = pokemonsWithDataAndImage;
        renderPokemonsGrid(allPokemons);
        renderPaginationIndicators(searchTerm, searchResults, pokemonsPerPage, totalPokemons, currentPage, goToPage);
        updatePaginationsBtnsStylesLocal();
        
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
                    togglePaginationVisibility(true);
                    renderPaginationIndicators(searchTerm, searchResults, pokemonsPerPage, totalPokemons, currentPage, goToPage);
                    updatePaginationsBtnsStylesLocal();
                    return;
                }

                searchTerm = term;
                const remoteResults = await searchRemotely(term, validPokemonTypes);
                searchResults = remoteResults;
                currentPage = 1;
                if (remoteResults.length > 0) {
                    if (remoteResults.length > pokemonsPerPage) {
                        togglePaginationVisibility(true);
                        renderPokemonsGrid(remoteResults.slice(0, pokemonsPerPage));
                        renderPaginationIndicators(searchTerm, searchResults, pokemonsPerPage, totalPokemons, currentPage, goToPage);
                        updatePaginationsBtnsStylesLocal();
                    } else {
                        renderPokemonsGrid(remoteResults);
                        togglePaginationVisibility(false);
                    }
                    return;
                }

                //todo: fazer uma mensagem de "nenhum resultado encontrado" em tela
                renderPokemonsGrid([]);
                togglePaginationVisibility(false);
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