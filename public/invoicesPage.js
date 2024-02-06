// invoicesPage.js
import { fetchInvoicesData } from './dataFetcher.js';
import { renderInvoicesTable } from './propertiesRenderer.js';

let allInvoices = []; // Variable to store all fetched invoices

function populatePayoutDateFilter(uniqueDates) {
    const payoutDateFilter = document.getElementById('payoutDateFilter');
    uniqueDates.forEach(fullDate => {
        if (fullDate) { // Only process if fullDate is not null
            let dateOnly = fullDate.substring(0, 10); // Extract only the date part
            let option = document.createElement('option');
            option.value = dateOnly;
            option.text = dateOnly;
            payoutDateFilter.appendChild(option);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('property_id');
    const propertyRef = urlParams.get('property_ref');
    const owner = urlParams.get('owner');

    // Set the heading with property details
    const propertyDetailsDiv = document.getElementById('propertyDetails');
    propertyDetailsDiv.innerHTML = `<h1>${owner}, ${propertyRef}</h1>`;

    if (propertyId) {
        fetchInvoicesData(propertyId).then(data => {
            allInvoices = data; // Store fetched data

            // Set the default filter to 'Incomplete' and apply it
            document.getElementById('paidFilter').value = 'Incomplete';
            renderInvoicesTable(data, 'invoicesData');
            applyFilters(); // This will filter and render the table with the default filter


            attachFilterEventListeners(); // Attach event listeners for filters
            document.getElementById('resetFilters').addEventListener('click', resetFilters);
            // Populate Payout Date Filter
            const uniqueDates = [...new Set(data.map(invoice => invoice.payout_date).filter(date => date !== null))];
            populatePayoutDateFilter(uniqueDates);
        });
    } else {
        console.error('No property_id found in URL');
    }
    // Attach event listener to the back button
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = 'properties.html'; // Redirect to the Properties page
    });
});

function attachFilterEventListeners() {
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
}

function applyFilters() {
    const paidStatusFilter = document.getElementById('paidFilter').value;
    const monthFilter = parseInt(document.getElementById('monthFilter').value);
    const yearFilter = parseInt(document.getElementById('yearFilter').value);
    const payoutDateFilter = document.getElementById('payoutDateFilter').value;

    console.log('Filter Values:', { paidStatusFilter, monthFilter, yearFilter, payoutDateFilter });

    let filteredData = allInvoices;

    console.log('Original Data:', filteredData);

    // Filter by Paid/Unpaid/Incomplete status
    if (paidStatusFilter) {
        if (paidStatusFilter === "Incomplete") {
            filteredData = filteredData.filter(invoice => 
                invoice.payout_status === 'Unpaid' || invoice.payout_status === 'Partially Paid');
        } else {
            filteredData = filteredData.filter(invoice => invoice.payout_status === paidStatusFilter);
        }
    }

    // Filter by Month
    if (monthFilter) {
        filteredData = filteredData.filter(invoice => {
            console.log('Comparing Month:', invoice.month, monthFilter);
            return parseInt(invoice.month) === parseInt(monthFilter);
        });
    }

    // Filter by Year
    if (yearFilter) {
        filteredData = filteredData.filter(invoice => {
            console.log('Comparing Year:', invoice.year, yearFilter);
            return parseInt(invoice.year) === parseInt(yearFilter);
        });
    }

    // Filter by Payout Date
    if (payoutDateFilter) {
        filteredData = filteredData.filter(invoice => {
            // Check if payout_date is not null or undefined
            if (invoice.payout_date) {
                const invoiceDate = invoice.payout_date.substring(0, 10);
                return invoiceDate === payoutDateFilter;
            }
            return false; // Exclude invoices where payout_date is null or undefined
        });
    }

    console.log('Filtered Data:', filteredData);

    renderInvoicesTable(filteredData, 'invoicesData');
}

function resetFilters() {
    // Reset filter values
    document.getElementById('paidFilter').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('yearFilter').value = ''; // Or the default value you prefer
    document.getElementById('payoutDateFilter').value = '';

    // Render the table again with all invoices
    renderInvoicesTable(allInvoices, 'invoicesData');
}

export { renderInvoicesTable };
