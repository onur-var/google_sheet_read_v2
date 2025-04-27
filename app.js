const API_KEY = 'AIzaSyDltb5FbPvL9bLgj_GK4_DEDaPK0A7oM_g';
const SHEET_ID = '16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk';
const RANGE = 'Sayfa1';

async function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    document.getElementById('loading-spinner').classList.add('active');
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Veri alınamadı');
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Hata:', error);
        alert('Veriler yüklenirken bir hata oluştu.');
        return [];
    } finally {
        document.getElementById('loading-spinner').classList.remove('active');
    }
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
        const fileId = row[4].split('/')[5];
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

        const fields = [
            { label: 'Malzeme İsmi', value: row[0] },
            { label: 'Part Number', value: row[1] },
            { label: 'Kategori', value: row[2] },
            { label: 'Uçak Tipi', value: row[3] }
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

        const searchMatch = !searchQuery || 
            malzeme.includes(searchQuery) || 
            partNo.includes(searchQuery);

        const categoryMatch = !categoryFilter || kategori.includes(categoryFilter);
        const aircraftMatch = !aircraftFilter || ucakTipi.includes(aircraftFilter);

        card.style.display = searchMatch && categoryMatch && aircraftMatch ? '' : 'none';
    });
}

function toggleMode() {
    const body = document.body;
    const button = document.getElementById('mode-toggle-btn');
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        button.textContent = 'Gündüz Modu';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        button.textContent = 'Gece Modu';
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');
    menu.classList.toggle('hidden');
}

function showDeveloperPopup() {
    const popup = document.getElementById('developer-popup');
    popup.classList.remove('hidden');
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hidden');
    }, 2000);
}

function openSheet() {
    window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}`, '_blank');
}

function init() {
    const searchBox = document.getElementById('search-box');
    const categoryFilter = document.getElementById('category-filter');
    const aircraftFilter = document.getElementById('aircraft-filter');
    const modeToggleBtn = document.getElementById('mode-toggle-btn');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const developerBtn = document.getElementById('developer-btn');
    const sheetBtn = document.getElementById('sheet-btn');

    searchBox.addEventListener('input', filterCatalog);
    categoryFilter.addEventListener('change', filterCatalog);
    aircraftFilter.addEventListener('change', filterCatalog);
    modeToggleBtn.addEventListener('click', toggleMode);
    menuToggleBtn.addEventListener('click', toggleMenu);
    developerBtn.addEventListener('click', showDeveloperPopup);
    sheetBtn.addEventListener('click', openSheet);

    fetchSheetData().then(data => {
        if (data.length > 0) {
            populateFilters(data);
            populateCatalog(data);
        }
    });
}

init();
