function renderPropertiesTable(data, containerId) {
    const dataContainer = document.getElementById(containerId);

    // Clear existing data in the container
    while (dataContainer.firstChild) {
        dataContainer.removeChild(dataContainer.firstChild);
    }

    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = '<h2>Properties</h2>';

    // Handle no data case
    if (data.length === 0) {
        tableDiv.innerHTML += '<p>No data available.</p>';
        dataContainer.appendChild(tableDiv);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'rent-roll-table'); // Reuse the class from the original table

    // Create table header
    const headerRow = table.insertRow();
    for (const key in data[0]) {
        const headerCell = headerRow.insertCell();
        headerCell.innerText = key.replace(/_/g, ' ').toUpperCase();
        headerCell.classList.add('header-cell'); // Reuse the header cell class
        
    }

    // Create table rows
    data.forEach((rowData) => {
        const row = table.insertRow();
        for (const key in rowData) {
            const cell = row.insertCell();
            cell.innerText = rowData[key];

            // Add link to invoices on clicking a cell
            cell.addEventListener('click', () => {
                window.location.href = `invoices.html?property_id=${rowData['property_id']}&property_ref=${rowData['property_ref']}&owner=${rowData['homeowner']}`;
            });

            // Reuse the cell class names
            const className = key.replace(/\s+/g, '-').toLowerCase();
            cell.classList.add(className);
        }
    });

    tableDiv.appendChild(table);
    dataContainer.appendChild(tableDiv);
}

function renderInvoicesTable(data, containerId) {
    const dataContainer = document.getElementById(containerId);

    // Clear existing data in the container
    while (dataContainer.firstChild) {
        dataContainer.removeChild(dataContainer.firstChild);
    }

    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = '<h2>Invoices</h2>';

    // Handle no data case
    if (data.length === 0) {
        tableDiv.innerHTML += '<p>No data available.</p>';
        dataContainer.appendChild(tableDiv);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'rent-roll-table'); // Reuse the class from the original table

    // Create table header
    const headerRow = table.insertRow();
    for (const key in data[0]) {
        const headerCell = headerRow.insertCell();
        headerCell.innerText = key.replace(/_/g, ' ').toUpperCase();
        headerCell.classList.add('header-cell'); // Reuse the header cell class
        
    }

    // Add 'Approve Payout' header
    const approveHeaderCell = headerRow.insertCell();
    approveHeaderCell.innerText = 'Approve Payout';
    approveHeaderCell.classList.add('header-cell');

    // Add 'To Pay Out' header
    const toPayOutHeaderCell = headerRow.insertCell();
    toPayOutHeaderCell.innerText = 'To Pay Out';
    toPayOutHeaderCell.classList.add('header-cell');

    // Add 'Payout Batch' header
    const payoutBatchHeaderCell = headerRow.insertCell();
    payoutBatchHeaderCell.innerText = 'Select Payout Batch';
    payoutBatchHeaderCell.classList.add('header-cell');

    // Create table rows
    data.forEach((rowData) => {
        const row = table.insertRow();
        for (const key in rowData) {
            const cell = row.insertCell();
            cell.innerText = rowData[key];

            // Reuse the cell class names
            const className = key.replace(/\s+/g, '-').toLowerCase();
            cell.classList.add(className);
        }
        // Add 'Approve Payout' checkbox for each row
        const approveCell = row.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'approve-' + rowData.invoice_id; // Unique ID for the checkbox
        if (rowData.payout_status === 'Paid') {
            checkbox.checked = true;
            checkbox.disabled = true; // Disable the checkbox if status is 'Paid'
        }
        // Add event listener using invoice_id
        checkbox.addEventListener('change', () => handleCheckboxChange(checkbox, rowData.property_id, rowData.invoice_id, rowData));

        approveCell.appendChild(checkbox);

        // Add a cell for 'To Pay Out' (currently blank or with a placeholder)
        const toPayOutCell = row.insertCell();
        toPayOutCell.setAttribute('data-to-pay-out', ''); // Add a data attribute
        toPayOutCell.id = 'toPayOut-' + rowData.invoice_id; // Use invoice_id
        toPayOutCell.innerText = '0';

        // Add 'Select Payout Batch' dropdown for each row
        const payoutBatchCell = row.insertCell();
        const select = document.createElement('select');
        select.id = 'payoutBatch-' + rowData.invoice_id; // Unique ID for the dropdown
        select.disabled = rowData.payout_status === 'Paid' || !checkbox.checked; // Disable if status is 'Paid'

        // Add 'None' option as the default
        const noneOption = document.createElement('option');
        noneOption.value = 'None';
        noneOption.text = 'None';
        select.appendChild(noneOption);

        // Fetch options from the backend API
        fetch('https://dashboard-function-app-1.azurewebsites.net/api/fetchBatchPayouts?code=mWP35g4lxIJkk_aOceVlKTGbhmA2-YhdhD932BhUFp3hAzFus4EeQA==') // Adjust the API endpoint URL
            .then((response) => response.json())
            .then((options) => {
                // Filter and add options for 'Unpaid' batches
                options.forEach((option) => {
                    if (option.status === 'Unpaid') {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.id;
                        optionElement.text = option.payout_name; // You can adjust this based on your data structure
                        select.appendChild(optionElement);
                    }
                });

                // Set 'None' as the default option
                select.value = 'None';

                // Add event listener for dropdown change
                select.addEventListener('change', () => handleDropdownChange(select, rowData.property_id, rowData.invoice_id));
            })
            .catch((error) => {
                console.error('Error fetching payout batches:', error);
            });

        payoutBatchCell.appendChild(select);

        // Add event listener for dropdown change
        select.addEventListener('change', () => handleDropdownChange(select, rowData.property_id, rowData.invoice_id));
    });

    tableDiv.appendChild(table);
    dataContainer.appendChild(tableDiv);
}

// Global variable to store selected invoice IDs
let selectedInvoiceIds = [];

function handleCheckboxChange(checkbox, property_id, invoiceId, rowData) {
    const toPayOutCell = document.getElementById('toPayOut-' + invoiceId);
    console.log('Property id:', property_id);
    if (checkbox.checked) {
        const amountPaid = parseFloat(rowData.amount_paid) || 0; // Default to 0 if undefined or null
        const amountPaidOut = parseFloat(rowData.amount_paid_out) || 0; // Default to 0 if undefined or null
        let payout_ratio = 0;
        if (property_id === 137) {
            payout_ratio = 0.35;
        } else if (property_id === 151) {
            payout_ratio = 0.175;
        } else {
            payout_ratio = 0.15;
        }
        console.log('Payout ratio:', payout_ratio);
        const toPayOut = (amountPaid - amountPaidOut) * payout_ratio;
        toPayOutCell.innerText = toPayOut.toFixed(2);

        // Add the invoice ID to the selected list
        selectedInvoiceIds.push(invoiceId);
        
        // Enable the dropdown when the checkbox is checked
        const select = document.getElementById('payoutBatch-' + invoiceId);
        if (select) {
            select.disabled = false;
        }
    } else {
        toPayOutCell.innerText = '0';
        // Remove the invoice ID from the selected list
        selectedInvoiceIds = selectedInvoiceIds.filter(id => id !== invoiceId);
        
        // Disable the dropdown when the checkbox is unchecked
        const select = document.getElementById('payoutBatch-' + invoiceId);
        if (select) {
            select.disabled = true;
        }
    }
    calculateTotalToPayOut();
}


function calculateTotalToPayOut() {
    let total = 0;
    const toPayOutCells = document.querySelectorAll('[data-to-pay-out]');
    toPayOutCells.forEach(cell => {
        let value = parseFloat(cell.innerText) || 0;
        total += value;
    });

    // Update the total display
    const totalPayoutElement = document.getElementById('totalPayoutValue');
    if (totalPayoutElement) {
        totalPayoutElement.innerText = total.toFixed(2);
    }
}

function handleDropdownChange(selectElement, property_id, invoiceId) {
    const selectedValue = selectElement.value;
    
    // Check if the selected dropdown is for filters or payout batch selection
    if (selectElement.id.startsWith('filter')) {
        // Handle filter changes
        console.log('Filter ID:', selectElement.id);
        console.log('Selected Value:', selectedValue);
        // Implement logic to update the filter based on selectedValue
    } else if (selectElement.id.startsWith('payoutBatch')) {
        // Handle payout batch selection changes
        console.log('Payout Batch ID:', selectElement.id);
        console.log('Selected Payout Batch:', selectedValue);
        console.log('Property id:', property_id);
        console.log('Invoice ID:', invoiceId);
        // Implement logic to update the selected payout batch
    }
}
export { renderPropertiesTable, renderInvoicesTable };
