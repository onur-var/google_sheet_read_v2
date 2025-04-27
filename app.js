const API_KEY = 'AIzaSyDltb5FbPvL9bLgj_GK4_DEDaPK0A7oM_g';
const SHEET_ID = '16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk';
const RANGE = 'Sayfa1';

let theme = 'light';

async function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values;
}

function populateTable(data) {
    const tbody = document.querySelector("#catalog-table tbody");
    const thead = document.querySelector("#catalog-table thead");
    tbody.innerHTML = '';
    thead.innerHTML = '';

    const headers = ["Resim", "Malzeme ismi", "Part number", "Kategori", "Uçak Tipi"];

    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const filterRow = document.createElement('tr');
    const filterCategories = ["Kategori", "Uçak Tipi"];
    headers.forEach((header, index) => {
        const td = document.createElement('td');

        // Kategori ve Uçak Tipi için filtreleme
        if (filterCategories.includes(header)) {
            const select = document.createElement('select');
            select.innerHTML = `<option value="">Tümü</option>`;
            const uniqueValues = [...new Set(data.slice(1).map(row => row[index]))];
            uniqueValues.forEach(value => {
                select.innerHTML += `<option value="${value}">${value}</option>`;
            });
            select.addEventListener('change', filterTableBySelect);
            td.appendChild(select);
        }

        filterRow.appendChild(td);
    });
    thead.appendChild(filterRow);

    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        const imgUrl = `https://drive.google.com/thumbnail?id=${row[4].split('/')[5]}`;
        const linkUrl = `https://drive.google.com/file/d/${row[4].split('/')[5]}/view`;

        const imageCell = document.createElement('td');
        const imgLink = document.createElement('a');
        imgLink.href = linkUrl;
        imgLink.target = '_blank';
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'Catalog Image';
        img.style.width = '100px';
        img.style.height = 'auto';
        imgLink.appendChild(img);
        imageCell.appendChild(imgLink);
        tr.appendChild(imageCell);

        row.slice(0, 4).forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function filterTableBySelect() {
    const selects = document.querySelectorAll("thead select");
    const selectedValues = Array.from(selects).map(select => select.value.toLowerCase());
    const rows = document.querySelectorAll("#catalog-table tbody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let match = true;
        selectedValues.forEach((value, i) => {
            if (value && !cells[i + 1].textContent.toLowerCase().includes(value)) {
                match = false;
            }
        });
        row.style.display = match ? '' : 'none';
    });
}

function init() {
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', (e) => filterTableBySearch(e.target.value));

    // Theme toggle
    document.getElementById('mode-btn').addEventListener('click', toggleTheme);

    fetchSheetData().then(data => populateTable(data));
}

function filterTableBySearch(query) {
    const rows = document.querySelectorAll("#catalog-table tbody tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function toggleTheme() {
    if (theme === 'light') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        document.getElementById('mode-btn').textContent = 'Gündüz Modu';
        theme = 'dark';
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        document.getElementById('mode-btn').textContent = 'Gece Modu';
        theme = 'light';
    }
}

init();
