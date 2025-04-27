const API_KEY = 'AIzaSyDltb5FbPvL9bLgj_GK4_DEDaPK0A7oM_g';
const SHEET_ID = '16XhSuD_8tEJ0wK_6H5f7csqIfsF6pFneNSphVb_6wsk';
const RANGE = 'Sayfa1';

let sheetData = [];

async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  sheetData = data.values.slice(1); // Başlığı atla
  populateFilters();
  populateTable(sheetData);
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

  data.forEach(row => {
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
        img.classList.add('thumbnail');
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

function populateFilters() {
  const kategoriFilter = document.getElementById('kategori-filter');
  const ucakFilter = document.getElementById('ucak-filter');

  const kategoriler = [...new Set(sheetData.map(row => row[2]))].sort();
  const ucakTipleri = [...new Set(sheetData.map(row => row[3]))].sort();

  kategoriler.forEach(kat => {
    const option = document.createElement('option');
    option.value = kat;
    option.textContent = kat;
    kategoriFilter.appendChild(option);
  });

  ucakTipleri.forEach(uTip => {
    const option = document.createElement('option');
    option.value = uTip;
    option.textContent = uTip;
    ucakFilter.appendChild(option);
  });
}

function applyFilters() {
  const searchText = document.getElementById('search-box').value.toLowerCase();
  const kategoriValue = document.getElementById('kategori-filter').value;
  const ucakValue = document.getElementById('ucak-filter').value;

  const filtered = sheetData.filter(row => {
    const matchesSearch = row[0].toLowerCase().includes(searchText) || row[1].toLowerCase().includes(searchText);
    const matchesKategori = kategoriValue ? row[2] === kategoriValue : true;
    const matchesUcak = ucakValue ? row[3] === ucakValue : true;
    return matchesSearch && matchesKategori && matchesUcak;
  });

  populateTable(filtered);
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const themeButton = document.getElementById('theme-toggle');
  themeButton.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
}

function init() {
  fetchSheetData();

  document.getElementById('search-box').addEventListener('input', applyFilters);
  document.getElementById('kategori-filter').addEventListener('change', applyFilters);
  document.getElementById('ucak-filter').addEventListener('change', applyFilters);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

init();
