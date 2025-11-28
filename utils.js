// Funções relacionadas a renderização e UI

export const renderPokemonsGrid = (pokemons) => {
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

export const renderWarnningNoResults = () => {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    grid.innerHTML = `<h2 class="no-results">Não encontrei nenhum Pokémon com esse termo!</h2> `;
}

export const getTotalPages = (totalPokemons, pokemonsPerPage) => Math.ceil(totalPokemons / pokemonsPerPage);

export const updatePaginationsBtnsStyles = (currentPage, totalPages) => {
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

export const constructorPaginationButtons = (pagesToShow, nextBtn, goToPageCallback, currentPage) => {
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
            elem.addEventListener('click', () => goToPageCallback(pageNum));
        }
        nextBtn.parentNode.insertBefore(elem, nextBtn);
    });
}

export const renderPaginationIndicators = (searchTerm, searchResults, pokemonsPerPage, totalPokemons, currentPage, goToPageCallback) => {
    let totalPages;
    if (searchTerm && searchResults.length > pokemonsPerPage) {
        totalPages = Math.ceil(searchResults.length / pokemonsPerPage);
    } else {
        totalPages = getTotalPages(totalPokemons, pokemonsPerPage);
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

    constructorPaginationButtons(pagesToShow, nextBtn, goToPageCallback, currentPage);
}

export const togglePaginationVisibility = (show) => {
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.display = show ? '' : 'none';
    }
}
