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

    const headers = ["Resim", "Malzeme ismi", "Part number", "Kategori", "Uçak Tipi"];
    
    // Table header
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Filter row for category and aircraft type
    const filterRow = document.createElement('tr');
    const filterCategories = ["Kategori", "Uçak Tipi"];
    filterCategories.forEach((header, index) => {
        const td = document.createElement('td');
        const select = document.createElement('select');
        const values = Array.from(new Set(data.slice(1).map(row => row[index]))); // Get unique values
        
        select.innerHTML = '<option value="">Filtrele</option>';
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
        select.addEventListener('change', () => filterTableBySelect(select, index));

        td.appendChild(select);
        filterRow.appendChild(td);
    });
    thead.appendChild(filterRow);

    // Populate table rows
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
                img.style.width = '100px';
                img.style.height = 'auto';
                link.appendChild(img);

                td.appendChild(link);
            } else {
                const div = document.createElement('div');
                const span = document.createElement('span');
                span.textContent = cell;
                div.appendChild(span);
                td.appendChild(div);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function filterTableBySelect(select, index) {
    const value = select.value.toLowerCase();
    const rows = document.querySelectorAll("#catalog-table tbody tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const cellValue = cells[index].textContent.toLowerCase();
        row.style.display = cellValue.includes(value) || !value ? '' : 'none';
    });
}

function init() {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });

    fetchSheetData().then(data => populateTable(data));
}

init();
