const API_KEY = 'AIzaSyDltb5FbPvL9bLgj_GK4_DEDaPK0A7oM_g';
const SHEET_ID = '16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk';
const RANGE = 'Sayfa1';

async function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    document.getElementById('loading-spinner').classList.add('active');
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Veri alınırken hata oluştu:', error);
        return null;
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

    if (!data || data.length < 2) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Gösterilecek veri bulunamadı</p>';
        return;
    }

    data.slice(1).forEach(row => {
        const card = document.createElement('div');
        card.className = 'catalog-card';

        // Image section
        const imgDiv = document.createElement('div');
        imgDiv.className = 'card-image';
        
        let imgUrl = '';
        if (row[5] && row[5].includes('drive.google.com')) {
            const fileId = row[5].split('/')[5];
            imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h200-c`;
        } else {
            imgUrl = 'https://via.placeholder.com/400x200.png?text=Resim+Yok';
        }

        const link = document.createElement('a');
        link.href = row[5] || '#';
        link.target = '_blank';
        link.style.display = 'flex';
        link.style.justifyContent = 'center';
        link.style.alignItems = 'center';
        link.style.height = '100%';
        link.style.width = '100%';

        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'Ürün Görseli';
        img.loading = 'lazy';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        link.appendChild(img);
        imgDiv.appendChild(link);

        // Content section
        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        const fields = [
            { label: 'Malzeme İsmi', value: row[0] || 'Belirtilmemiş' },
            { label: 'Part Number', value: row[1] || 'Belirtilmemiş' },
            { label: 'Kategori', value: row[2] || 'Belirtilmemiş' },
            { label: 'Uçak Tipi', value: row[3] || 'Belirtilmemiş' },
            { label: 'Not', value: row[4] || 'Belirtilmemiş' }
        ];

        fields.forEach(field => {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${field.label}:</strong> <span>${field.value}</span>`;
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
        const fields = content.querySelectorAll('div');
        
        const malzeme = fields[0].textContent.toLowerCase();
        const partNo = fields[1].textContent.toLowerCase();
        const kategori = fields[2].textContent;
        const ucakTipi = fields[3].textContent;
        const not = fields[4].textContent.toLowerCase();

        const searchMatch = !searchQuery || 
            malzeme.includes(searchQuery) || 
            partNo.includes(searchQuery) ||
            not.includes(searchQuery);

        const categoryMatch = !categoryFilter || kategori.includes(categoryFilter);
        const aircraftMatch = !aircraftFilter || ucakTipi.includes(aircraftFilter);

        card.style.display = searchMatch && categoryMatch && aircraftMatch ? '' : 'none';
    });
}

function toggleMode() {
    const body = document.body;
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function showDeveloperPopup() {
    const popup = document.getElementById('developer-popup');
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000);
}

function openSheet() {
    window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`, '_blank');
}

async function init() {
    // Set initial theme from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Event listeners
    document.getElementById('search-box').addEventListener('input', filterCatalog);
    document.getElementById('category-filter').addEventListener('change', filterCatalog);
    document.getElementById('aircraft-filter').addEventListener('change', filterCatalog);
    document.getElementById('mode-toggle-btn').addEventListener('click', toggleMode);
    document.getElementById('developer-btn').addEventListener('click', showDeveloperPopup);
    document.getElementById('sheet-btn').addEventListener('click', openSheet);

    // Load data
    const data = await fetchSheetData();
    if (data) {
        populateFilters(data);
        populateCatalog(data);
    } else {
        document.getElementById('catalog-container').innerHTML = 
            '<p style="grid-column:1/-1;text-align:center;color:red;">Veri yüklenirken hata oluştu. Lütfen sayfayı yenileyin.</p>';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
