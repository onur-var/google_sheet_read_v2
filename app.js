function init() {
    const searchBox = document.getElementById('search-box');
    const categoryFilter = document.getElementById('category-filter');
    const aircraftFilter = document.getElementById('aircraft-filter');
    const modeToggleBtn = document.getElementById('mode-toggle-btn');
    const developerBtn = document.getElementById('developer-btn');
    const sheetBtn = document.getElementById('sheet-btn');
    const developerPopup = document.getElementById('developer-popup');

    // Mevcut event listener'lar
    searchBox.addEventListener('input', filterCatalog);
    categoryFilter.addEventListener('change', filterCatalog);
    aircraftFilter.addEventListener('change', filterCatalog);
    modeToggleBtn.addEventListener('click', toggleMode);

    // Geliştirici butonu event'i
    developerBtn.addEventListener('click', () => {
        developerPopup.classList.add('show');
        setTimeout(() => {
            developerPopup.classList.remove('show');
        }, 1500);
    });

    // Veri sayfası butonu event'i
    sheetBtn.addEventListener('click', () => {
        window.open('https://docs.google.com/spreadsheets/d/16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk/edit?usp=sharing', '_blank');
    });

    fetchSheetData().then(data => {
        populateFilters(data);
        populateCatalog(data);
    });
}
