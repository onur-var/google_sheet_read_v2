const API_KEY = 'AIzaSyDltb5FbPvL9bLgj_GK4_DEDaPK0A7oM_g';
const SHEET_ID = '16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk';
const RANGE = 'Sayfa1';

async function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    document.getElementById('loading-spinner').classList.add('active');
    const response = await fetch(url);
    const data = await response.json();
    document.getElementById('loading-spinner').classList.remove('active');
    return data.values;
}

function populateFilters(data) {
    const categoryFilter = document.getElementById('category-filter');
    const aircraftFilter = document.getElementById('aircraft-filter');

    const categories = [...new Set(data.slice(1).map(row => row[2]))];
    const aircrafts = [...new Set(data.slice(1).map(row => row[3]))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    aircrafts.forEach(aircraft => {
        const option = document.createElement('option');
        option.value = aircraft;
        option.textContent = aircraft;
        aircraftFilter.appendChild(option);
    });
}

function populateCatalog(data) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';

    data.slice(1).forEach(row => {
        const card = document.createElement('div');
        card.className = 'catalog-card';

        const imgDiv = document.createElement('div');
        // Resim linki şimdi 6. sütunda (F)
        const fileId = row[5].split('/')[5];
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
        const originalUrl = `https://drive.google.com/file/d/${fileId}/view`;

        const link = document.createElement('a');
        link.href = originalUrl;
        link.target = '_blank';

        const img = document.createElement('img');
        img.src = thumbnailUrl;
        img.alt = 'Catalog Image';
        link.appendChild(img);
        imgDiv.appendChild(link);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        // Not alanı 5. sütun (E) olarak eklendi
        const fields = [
            { label: 'Malzeme İsmi', value: row[0] },
            { label: 'Part Number', value: row[1] },
            { label: 'Kategori', value: row[2] },
            { label: 'Uçak Tipi', value: row[3] },
            { label: 'Not', value: row[4] }
        ];

        fields.forEach(field => {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${field.label}:</strong> ${field.value}`;
            contentDiv.appendChild(div);
        });

        card.appendChild(imgDiv);
        card.appendChild(contentDiv);
        container.appendChild(card);
    });
}

function filterCatalog() {
    const searchQuery = document.getElementById('search-box').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const aircraftFilter = document.getElementById('aircraft-filter').value;
    const cards = document.querySelectorAll('.catalog-card');

    cards.forEach(card => {
        const content = card.querySelector('.card-content');
        const malzeme = content.children[0].textContent.toLowerCase();
        const partNo = content.children[1].textContent.toLowerCase();
        const kategori = content.children[2].textContent;
        const ucakTipi = content.children[3].textContent;
        const not = content.children[4].textContent.toLowerCase(); // Not eklendi

        const searchMatch = !searchQuery || 
            malzeme.includes(searchQuery) || 
            partNo.includes(searchQuery) ||
            not.includes(searchQuery); // Not aramaya dahil edildi

        const categoryMatch = !categoryFilter || kategori.includes(categoryFilter);
        const aircraftMatch = !aircraftFilter || ucakTipi.includes(aircraftFilter);

        card.style.display = searchMatch && categoryMatch && aircraftMatch ? '' : 'none';
    });
}

function toggleMode() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    }
}

function showDeveloperPopup() {
    const popup = document.getElementById('developer-popup');
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000);
}

function openSheet() {
    window.open('https://docs.google.com/spreadsheets/d/16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk/edit?usp=sharing', '_blank');
}

function init() {
    const searchBox = document.getElementById('search-box');
    const categoryFilter = document.getElementById('category-filter');
    const aircraftFilter = document.getElementById('aircraft-filter');
    const modeToggleBtn = document.getElementById('mode-toggle-btn');
    const developerBtn = document.getElementById('developer-btn');
    const sheetBtn = document.getElementById('sheet-btn');
    const clearSearchBtn = document.getElementById('clear-search');

    searchBox.addEventListener('input', function() {
        filterCatalog();
                // Arama kutusunda yazı varsa temizleme butonunu göster
        clearSearchBtn.style.display = this.value ? 'block' : 'none';
    });

    clearSearchBtn.addEventListener('click', function() {
        searchBox.value = ''; // Arama kutusunu temizle
        clearSearchBtn.style.display = 'none'; // Butonu gizle
        filterCatalog(); // Filtrelemeyi yenile
        
    searchBox.addEventListener('input', filterCatalog);
    categoryFilter.addEventListener('change', filterCatalog);
    aircraftFilter.addEventListener('change', filterCatalog);
    modeToggleBtn.addEventListener('click', toggleMode);
    developerBtn.addEventListener('click', showDeveloperPopup);
    sheetBtn.addEventListener('click', openSheet);

    fetchSheetData().then(data => {
        populateFilters(data);
        populateCatalog(data);
    });
}

init();
