// dataRenderer.js

let currentId;
let currentDataType;
window.currentId = null;
window.currentDataType = null;

function renderTable(data, commentModal, dataType) {
    // console.log('Rendering table for:');

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

    for (const key in data[0]) {
        if(key !== 'invoice_id') {
            const headerCell = headerRow.insertCell();
            headerCell.innerText = key;
            const className = key.replace(/\s+/g, '-').toLowerCase();
            headerCell.classList.add(className);
            // console.log(`Class '${className}' assigned to header cell`);
            headerCell.addEventListener('click', () => {
                // Placeholder for sorting logic
            });
        }
    }

    data.forEach((rowData) => {
        const row = table.insertRow();
        for (const key in rowData) {
            if (key !== 'invoice_id') {
                const cell = row.insertCell();
                if (dataType === 'rentRoll') {

                    if (key === 'unit_ref' && rowData[key]) {
                        // Create a link for the unit_ref column
                        const link = document.createElement('a');
                        link.href = `unit_deposits.html?unit_ref=${rowData[key]}`; // Specify the link URL
                        link.textContent = rowData[key];
                        cell.appendChild(link);
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
            }
        }

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
        const notPaidCount = data.filter(row => parseFloat(row.amount_paid) !== parseFloat(row.amount_due)).length;
        const total = paidCount + notPaidCount;
        const ratio = `${paidCount}/${total}`;
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


// console.log('Data rendered');
export { renderTable };