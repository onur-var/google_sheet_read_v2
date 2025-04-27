const API_KEY = 'AIzaSyDltb5FbPvL9bLgj_GK4_DEDaPK0A7oM_g'; 
const SHEET_ID = '16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk'; 
const RANGE = 'Sayfa1'; 

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

    const headers = ["Malzeme ismi", "Part number", "Kategori", "Uçak Tipi", "Resim"];
    const filterRow = document.createElement('tr');
    const headerRow = document.createElement('tr');

    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);

        const filterCell = document.createElement('td');
        const filterInput = document.createElement('select');
        filterInput.innerHTML = '<option value="">Tümü</option>';

        const uniqueValues = [...new Set(data.slice(1).map(row => row[index] || ''))];
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            filterInput.appendChild(option);
        });

        filterInput.addEventListener('change', () => filterTable(data));
        filterCell.appendChild(filterInput);
        filterRow.appendChild(filterCell);
    });

    thead.appendChild(headerRow);
    thead.appendChild(filterRow);

    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, index) => {
            const td = document.createElement('td');

            if (index === 4) {
                const fileId = cell.split('/')[5];
                const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
                const originalUrl = `https://drive.google.com/file/d/${fileId}/view`;

                const link = document.createElement('a');
                link.href = originalUrl;
                link.target = '_blank';

                const img = document.createElement('img');
                img.src = thumbnailUrl;
                img.alt = 'Catalog Image';
                img.style.width = '70px'; // daha dar
                img.style.height = 'auto';
                link.appendChild(img);

                td.appendChild(link);
            } else {
                td.textContent = cell;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function filterTable(data) {
    const filters = Array.from(document.querySelectorAll("thead select")).map(select => select.value);
    const tbody = document.querySelector("#catalog-table tbody");
    tbody.innerHTML = '';

    data.slice(1).forEach(row => {
        if (row.every((cell, index) => {
            if (index === 4) return !filters[4] || row[4].includes(filters[4]);
            return !filters[index] || cell === filters[index];
        })) {
            const tr = document.createElement('tr');
            row.forEach((cell, index) => {
                const td = document.createElement('td');

                if (index === 4) {
                    const fileId = cell.split('/')[5];
                    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
                    const originalUrl = `https://drive.google.com/file/d/${fileId}/view`;

                    const link = document.createElement('a');
                    link.href = originalUrl;
                    link.target = '_blank';

                    const img = document.createElement('img');
                    img.src = thumbnailUrl;
                    img.alt = 'Catalog Image';
                    img.style.width = '70px';
                    img.style.height = 'auto';
                    link.appendChild(img);

                    td.appendChild(link);
                } else {
                    td.textContent = cell;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
    });
}

function init() {
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', (e) => filterTableBySearch(e.target.value));

    fetchSheetData().then(data => populateTable(data));
}

function filterTableBySearch(query) {
    const rows = document.querySelectorAll("#catalog-table tbody tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

init();
