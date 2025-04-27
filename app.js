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

    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const filterRow = document.createElement('tr');
    headers.forEach((header, index) => {
        const td = document.createElement('td');

        // SADECE "Malzeme ismi" ve "Part number" için kutucuk ekle
        if (index === 0 || index === 1) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = "Ara...";
            input.dataset.index = index;

            input.addEventListener('input', filterTableByInputs);

            td.appendChild(input);
        }
        filterRow.appendChild(td);
    });
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
    });
}

function filterTableByInputs() {
    const inputs = document.querySelectorAll("thead input");
    const filters = Array.from(inputs).map(input => input.value.toLowerCase());
    const rows = document.querySelectorAll("#catalog-table tbody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let match = true;
        filters.forEach((filter, i) => {
            const index = inputs[i].dataset.index;
            if (filter && !cells[index].innerText.toLowerCase().includes(filter)) {
                match = false;
            }
        });
        row.style.display = match ? '' : 'none';
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
