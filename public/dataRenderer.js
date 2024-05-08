// dataRenderer.js

let currentId;
let currentDataType;
window.currentId = null;
window.currentDataType = null;

// Define the columns to include by name
const columnsToInclude = ['unit_ref', 'homeowner', 'Invoice Date', 'amount_due', 'amount_paid', 'date_paid', 'transaction_ref', 'deposit_balance', 'Vacant/Arrears', 'agent'];

function renderTable(data, commentModal, dataType) {
  
    const currentMonth = new Date().getMonth() + 1; // Get the current month (1-12)

    // Get the container where the data will be displayed
    const dataContainer = document.getElementById('functionData');

    // Clear any existing data in the container
    while (dataContainer.firstChild) {
        dataContainer.removeChild(dataContainer.firstChild);
    }

    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = `<h2>${dataType === 'rentRoll' ? 'Rent Roll' : 'Deposits'}</h2>`;

    if (data.length === 0) {
        tableDiv.innerHTML += '<p>No data available.</p>';
        dataContainer.appendChild(tableDiv);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'rent-roll-table'); // Set a CSS class for styling

    const headerRow = table.insertRow();
    // console.log('CREATING TABLE');

    // Create table headers, including only columns in the inclusion list
    columnsToInclude.forEach(key => {
        const headerCell = headerRow.insertCell();
        headerCell.innerText = key;
        const className = key.replace(/\s+/g, '-').toLowerCase();
        headerCell.classList.add(className);
    });

    // // Add an additional header cell for the toggle column
    // const toggleHeaderCell = headerRow.insertCell();
    // toggleHeaderCell.innerText = 'Toggle Arrears';

    data.forEach((rowData) => {
        const row = table.insertRow();
        let arrearsCell;
        columnsToInclude.forEach(key => {
            const cell = row.insertCell();
            
            if (dataType === 'rentRoll') {
                if (key === 'arrears' || key === 'vacant') {
                    // Common setup for both 'Arrears' and 'Vacant'
                    cell.classList.add('status-cell');  // A common class for styling both cells similarly

                    // Create the label and toggle container inside this cell
                    const statusLabel = document.createElement('div');
                    statusLabel.classList.add('status-label');  // 'arrears-label' or 'vacant-label'
                    statusLabel.textContent = rowData[key] ? (key === 'arrears' ? 'In Arrears' : 'Vacant') : '';
                    
                    // Apply highlight if initial state is true
                    if (rowData[key]) {
                        cell.classList.add('arrears-highlight');
                    }

                    const toggleContainer = document.createElement('div');
                    toggleContainer.classList.add('status-toggle');

                    const toggleCheckbox = document.createElement('input');
                    toggleCheckbox.type = 'checkbox';
                    toggleCheckbox.checked = rowData[key];
                    toggleCheckbox.addEventListener('change', () => {
                        rowData[key] = toggleCheckbox.checked;
                        statusLabel.textContent = toggleCheckbox.checked ? (key === 'arrears' ? 'In Arrears' : 'Vacant') : '';
                        // Dynamically add/remove highlight based on state
                        if (toggleCheckbox.checked) {
                            cell.classList.add('arrears-highlight');
                        } else {
                            cell.classList.remove('arrears-highlight');
                        }
                        // Update the backend
                        if (key === 'arrears') {
                            updateArrearsValue(rowData['unit_id'], toggleCheckbox.checked ? 1 : 0);
                        } else if (key === 'vacant') {
                            updateVacantValue(rowData['unit_id'], toggleCheckbox.checked ? 1 : 0);
                        }
                    });

                    toggleContainer.appendChild(toggleCheckbox);
                    cell.appendChild(statusLabel);
                    cell.appendChild(toggleContainer);
                    
                } else if (key === 'unit_ref' && rowData[key]) {
                    // Create a link for the unit_ref column
                    const link = document.createElement('a');
                    link.href = `unit_deposits.html?unit_ref=${rowData[key]}`; // Specify the link URL
                    link.textContent = rowData[key];
                    cell.appendChild(link);
                } else if (key === 'Invoice Date') {
                        // Check if both month and year data exist
                        const monthName = rowData['month'] ? getMonthName(rowData['month']) : '';
                        const year = rowData['year'] || '';
                        cell.innerText = `${monthName} ${year}`.trim();
                } else if (key === 'amount_due') {
                    cell.innerText = parseFloat(rowData[key]).toFixed(2);
                } else if (key === 'amount_paid') {
                    const amount_due = parseFloat(rowData['amount_due']);
                    const amount_paid = parseFloat(rowData['amount_paid']);

                    cell.innerText = parseFloat(rowData[key]).toFixed(2);

                    // Check if Amount Paid is less than Amount Due and the current month is greater than or equal to the Month value
                    if (!isNaN(amount_due) && !isNaN(amount_paid) && amount_paid < amount_due && currentMonth >= parseInt(rowData['month'], 10)) {
                        cell.classList.add('zero-amount');
                    }

                    // Check if Amount Paid is less than Amount Due and the current month is greater than or equal to the Month value
                    else if (!isNaN(amount_due) && !isNaN(amount_paid) && amount_paid > amount_due) {
                        cell.classList.add('greater-amount');
                    }


                } else if (key === 'date_paid' && rowData[key] !== null) {
                    const dateParts = rowData[key].split('T');
                    if (dateParts.length >= 1) {
                        cell.innerText = dateParts[0];
                    } else {
                        cell.innerText = 'Invalid Date'
                    }
                } else if (key === 'month') {
                    const monthNames = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                    ];
                    const monthValue = parseInt(rowData[key], 10);
                    if (!isNaN(monthValue) && monthValue >= 1 && monthValue <= 12) {
                        cell.innerText = monthNames[monthValue - 1]; // Subtract 1 to get the correct index
                    }
                } else if (key === 'deposit_balance') {
                    // Render deposit_balance with two decimal places
                    // Adding logic to highlight cell if deposit balance is less than zero (indicative of an issue/overdraft)
                    const deposit_balance = parseFloat(rowData[key]);
                    cell.innerText = deposit_balance.toFixed(2);
                    if (!isNaN(deposit_balance) && deposit_balance < 0) {
                        cell.classList.add('zero-amount'); // Assumes you have CSS styling for .negative-balance for highlighting
                    }
                } else if (key === 'Vacant/Arrears') {
                    // Setup combined Vacant/Arrears data cell
                    createStatusCell(cell, rowData);
                } else {
                    cell.innerText = rowData[key];
                }
            } else if (dataType === 'deposits') {
                if (key === 'unit_ref' && rowData[key]) {
                    // Similar logic for creating links for unit_ref column
                    const link = document.createElement('a');
                    link.href = `unit_deposits.html?unit_ref=${rowData[key]}`;
                    link.textContent = rowData[key];
                    cell.appendChild(link);
                } else if (key === 'rent') {
                    // Render rent, assuming it's a numeric value that should be presented with two decimal places
                    cell.innerText = parseFloat(rowData[key]).toFixed(2);
                } else if (key === 'deposit_paid') {
                    // Render deposit_paid with two decimal places
                    cell.innerText = parseFloat(rowData[key]).toFixed(2);
                } else if (key === 'deposit_balance') {
                    // Render deposit_balance with two decimal places
                    // Adding logic to highlight cell if deposit balance is less than zero (indicative of an issue/overdraft)
                    const deposit_balance = parseFloat(rowData[key]);
                    cell.innerText = deposit_balance.toFixed(2);
                    if (!isNaN(deposit_balance) && deposit_balance < 0) {
                        cell.classList.add('zero-amount'); // Assumes you have CSS styling for .negative-balance for highlighting
                    }
                } else {
                    // For any other key, display the data as is
                    cell.innerText = rowData[key];
                }
            }
        });

        // Add the "Add Comment" button in the last cell of each row
        const addButtonCell = row.insertCell();
        const addButton = document.createElement('button');
        addButton.innerText = 'Add Comment';
        addButton.addEventListener('click', () => {
            // Set the current invoice ID
            // console.log('Button clicked');
            document.getElementById('comment').value = '';
            // console.log(rowData);
            if (dataType === 'rentRoll') {
                window.currentId = rowData['invoice_id']; // Replace 'invoice_id' with the actual column name containing the invoice ID
                window.currentDataType = 'Invoices';
            } else if (dataType === 'deposits') {
                window.currentId = rowData['unit_id'];
                window.currentDataType = 'rentalUnits';
            }
            // Open the comment modal
            $(commentModal).modal('show');
        });
        addButtonCell.appendChild(addButton);
    });

    tableDiv.appendChild(table);
    dataContainer.appendChild(tableDiv);

    // Create the div element for the counter dynamically if dataType is 'rentRoll'
    if (dataType === 'rentRoll') {
        // Counting rows where amount_paid is equal to amount_due
        const paidCount = data.filter(row => parseFloat(row.amount_paid) === parseFloat(row.amount_due)).length;
        const atLeastPaidCount = data.filter(row => parseFloat(row.amount_paid) >= parseFloat(row.amount_due)).length;
        const notPaidCount = data.filter(row => parseFloat(row.amount_paid) !== parseFloat(row.amount_due)).length;
        const total = paidCount + notPaidCount;
        const ratio = `${atLeastPaidCount}/${total}`;
        // const paidCount = 3;
        const countDiv = document.createElement('div');
        countDiv.id = 'paidCount';
        countDiv.className = 'mt-2'; // You can add any required classes here
        countDiv.innerHTML = `<small>Paid Items: <span id="paidCounter">${ratio}</span></small>`;
        
        // Find a place to insert the countDiv in your table or page. 
        // In this example, I'm assuming you have a div with an id of 'header' where the title is located.
        const headerDiv = tableDiv.querySelector('h2'); // Adjust this line to find the correct place in your DOM
        headerDiv.insertAdjacentElement('afterend', countDiv); // This inserts countDiv right after headerDiv
    }

}

async function updateArrearsValue(unit_id, arrearsValue) {
    // Construct the payload to send to the server
    const payload = {
        unit_id: unit_id,
        arrears: arrearsValue
    };
    console.log('updateArrearsValue payload:', payload);

    try {
        // Send an HTTP PUT request to update the arrears status on the server
        const response = await fetch('https://dashboard-function-app-1.azurewebsites.net/api/updateArrearsStatus?code=8RjDU-gsn9SF6a5CRuiXunPedcLR9MYzJXmRK4x0VZfIAzFu76_zXw==', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        // Optionally, handle the response data if needed
        const result = await response.json();
        console.log('Arrears status updated successfully:', result);

    } catch (error) {
        console.error('Error updating arrears status:', error.message);
    }
}

async function updateVacantValue(unit_id, vacantValue) {
    // Construct the payload to send to the server
    const payload = {
        unit_id: unit_id,
        vacant: vacantValue
    };
    console.log('updateVacantValue payload:', payload);

    try {
        // Send an HTTP PUT request to update the arrears status on the server
        const response = await fetch('https://dashboard-function-app-1.azurewebsites.net/api/updateOccupiedStatus?code=tDL7qM_rYnW1beY_pfysXIQJlYqSYGNlyn0HrnUov5cVAzFu9cG32Q==', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        // Optionally, handle the response data if needed
        const result = await response.json();
        console.log('Arrears status updated successfully:', result);

    } catch (error) {
        console.error('Error updating arrears status:', error.message);
    }
}

function createStatusCell(cell, rowData) {
    cell.classList.add('status-cell');

    // Container for Arrears status
    const arrearsContainer = document.createElement('div');
    arrearsContainer.classList.add('status-label');
    if (rowData['arrears']) {
        arrearsContainer.classList.add('arrears-highlight');
    }

    // Container for Vacant status
    const vacantContainer = document.createElement('div');
    vacantContainer.classList.add('status-label');
    if (rowData['vacant']) {
        vacantContainer.classList.add('arrears-highlight');
    }

    // Checkbox and label for Arrears
    const arrearsCheckbox = document.createElement('input');
    arrearsCheckbox.type = 'checkbox';
    arrearsCheckbox.checked = rowData['arrears'];
    const arrearsLabel = document.createElement('label');
    arrearsLabel.textContent = 'In Arrears';
    arrearsLabel.style.marginLeft = '8px';

    arrearsCheckbox.addEventListener('change', async () => {
        rowData['arrears'] = arrearsCheckbox.checked;
        arrearsContainer.classList.toggle('arrears-highlight', arrearsCheckbox.checked);

        // Trigger the update function for arrears status
        try {
            await updateArrearsValue(rowData['unit_id'], arrearsCheckbox.checked ? 1 : 0);
        } catch (error) {
            console.error('Error updating arrears:', error);
        }
    });

    // Checkbox and label for Vacant
    const vacantCheckbox = document.createElement('input');
    vacantCheckbox.type = 'checkbox';
    vacantCheckbox.checked = rowData['vacant'];
    const vacantLabel = document.createElement('label');
    vacantLabel.textContent = 'Vacant';
    vacantLabel.style.marginLeft = '8px';

    vacantCheckbox.addEventListener('change', async () => {
        rowData['vacant'] = vacantCheckbox.checked;
        vacantContainer.classList.toggle('arrears-highlight', vacantCheckbox.checked);

        // Trigger the update function for vacant status
        try {
            await updateVacantValue(rowData['unit_id'], vacantCheckbox.checked ? 1 : 0);
        } catch (error) {
            console.error('Error updating vacant status:', error);
        }
    });

    // Assemble Arrears components
    arrearsContainer.appendChild(arrearsCheckbox);
    arrearsContainer.appendChild(arrearsLabel);

    // Assemble Vacant components
    vacantContainer.appendChild(vacantCheckbox);
    vacantContainer.appendChild(vacantLabel);

    // Append each container to the main cell
    cell.appendChild(arrearsContainer);
    cell.appendChild(vacantContainer);
}






function getMonthName(monthIndex) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    return monthNames[monthIndex - 1];  // Convert month index to month name
}

// console.log('Data rendered');
export { renderTable };