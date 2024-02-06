// main.js

// Import functions from other modules
import { fetchData, fetchDepositData } from './dataFetcher.js';
import { filterData } from './dataFilter.js';
import { renderTable } from './dataRenderer.js';

function applyFiltersAndSort() {
  console.log('applyfilterandsort: ', currentTable);
  if (window.currentTable === 'rentRoll') {
    console.log('calling fetchData');
    fetchData().then(originalData => {
      console.log('Month value', document.getElementById('filterMonth').value);
      console.log('Homeowner filter value', document.getElementById('filterHomeowner').value);
      const filterCriteria = {
      itemsPerPage: parseInt(document.getElementById('itemsPerPage').value, 10),
      month: parseInt(document.getElementById('filterMonth').value, 10),
      homeowner: document.getElementById('filterHomeowner').value,
      unitRef: document.getElementById('filterUnit').value
      };
      const filteredData = filterData(originalData, filterCriteria, 'rentRoll');
      renderTable(filteredData, commentModal, 'rentRoll');
    });
  } else if (window.currentTable === 'deposits') {
    console.log('calling fetch deposit data');
    fetchDepositData().then(originalData => {
      console.log('Month value', document.getElementById('filterMonth').value);
      console.log('Homeowner filter value', document.getElementById('filterHomeowner').value);
      const filterCriteria = {
      itemsPerPage: parseInt(document.getElementById('itemsPerPage').value, 10),
      month: parseInt(document.getElementById('filterMonth').value, 10),
      homeowner: document.getElementById('filterHomeowner').value,
      unitRef: document.getElementById('filterUnit').value
      };
      const filteredData = filterData(originalData, filterCriteria, 'deposits');
      renderTable(filteredData, commentModal, 'deposits');
    });
  } 
}

// Attach event listeners
// Check if the element exists before adding an event listener
if (document.getElementById('itemsPerPage')) {
  document.getElementById('itemsPerPage').addEventListener('change', applyFiltersAndSort);
}

if (document.getElementById('filterMonth')) {
  document.getElementById('filterMonth').addEventListener('change', applyFiltersAndSort);
}

if (document.getElementById('filterHomeowner')) {
  document.getElementById('filterHomeowner').addEventListener('input', applyFiltersAndSort);
}

if (document.getElementById('filterUnit')) {
  document.getElementById('filterUnit').addEventListener('input', applyFiltersAndSort);
}

