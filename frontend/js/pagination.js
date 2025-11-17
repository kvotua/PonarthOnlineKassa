/**
 * Рендер пагинации
 * @param {HTMLElement} container - контейнер пагинации
 * @param {number} currentPage - текущая страница
 * @param {number} totalPages - общее количество страниц
 * @param {function} onPageClick - функция, вызываемая при клике на страницу
 */
function renderPagination(container, currentPage, totalPages, onPageClick) {
    container.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const createButton = (page, text = null, isActive = false) => {
        const btn = document.createElement("button");
        btn.textContent = text || page;
        btn.classList.add("page-btn");
        if (isActive) btn.classList.add("active");
        if (page !== currentPage) {
            btn.addEventListener("click", () => onPageClick({ page: page }));
        }
        return btn;
    };

    const createEllipsis = () => {
        const span = document.createElement("span");
        span.textContent = "...";
        span.classList.add("ellipsis");
        return span;
    };

    // <
    if (currentPage > 1) {
        container.appendChild(createButton(currentPage - 1, "‹"));
    }

    // 1
    container.appendChild(createButton(1, "1", currentPage === 1));

    // Левый "..."
    if (currentPage > 3) {
        container.appendChild(createEllipsis());
    }

    // Страница слева от текущей
    if (currentPage - 1 > 1) {
        container.appendChild(createButton(currentPage - 1));
    }

    // Текущая
    if (currentPage !== 1 && currentPage !== totalPages) {
        container.appendChild(createButton(currentPage, String(currentPage), true));
    }

    // Страница справа от текущей
    if (currentPage + 1 < totalPages) {
        container.appendChild(createButton(currentPage + 1));
    }

    // Правый "..."
    if (currentPage < totalPages - 2) {
        container.appendChild(createEllipsis());
    }

    // Последняя страница
    if (totalPages > 1) {
        container.appendChild(createButton(totalPages, String(totalPages), currentPage === totalPages));
    }

    // >
    if (currentPage < totalPages) {
        container.appendChild(createButton(currentPage + 1, "›"));
    }
}
