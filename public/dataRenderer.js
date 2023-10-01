// dataRenderer.js

let currentInvoiceId;

function renderTable(data, commentModal) {
    console.log('Rendering table for:');

    const currentMonth = new Date().getMonth() + 1; // Get the current month (1-12)

    // Get the container where the data will be displayed
    const dataContainer = document.getElementById('functionData');

    // Clear any existing data in the container
    while (dataContainer.firstChild) {
        dataContainer.removeChild(dataContainer.firstChild);
    }

    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = `<h2>Rent Roll</h2>`;

    if (data.length === 0) {
        tableDiv.innerHTML += '<p>No data available.</p>';
        dataContainer.appendChild(tableDiv);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'rent-roll-table'); // Set a CSS class for styling

    const headerRow = table.insertRow();
    console.log('CREATING TABLE');

    for (const key in data[0]) {
        const headerCell = headerRow.insertCell();
        headerCell.innerText = key;
        const className = key.replace(/\s+/g, '-').toLowerCase();
        headerCell.classList.add(className);
        console.log(`Class '${className}' assigned to header cell`);
        headerCell.addEventListener('click', () => {
            // Placeholder for sorting logic
        });
    }

    data.forEach((rowData) => {
        const row = table.insertRow();
        for (const key in rowData) {
            const cell = row.insertCell();
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
            } else {
                cell.innerText = rowData[key];
            }
        }

        // Add the "Add Comment" button in the last cell of each row
        const addButtonCell = row.insertCell();
        const addButton = document.createElement('button');
        addButton.innerText = 'Add Comment';
        addButton.addEventListener('click', () => {
            // Set the current invoice ID
            console.log('Button clicked');
            document.getElementById('comment').value = '';
            console.log(rowData);
            currentInvoiceId = rowData['invoice_id']; // Replace 'invoice_id' with the actual column name containing the invoice ID

            // Open the comment modal
            $(commentModal).modal('show');
        });
        addButtonCell.appendChild(addButton);
    });

    tableDiv.appendChild(table);
    dataContainer.appendChild(tableDiv);


    // Add an event listener for the "Save Comment" button in the modal
    document.getElementById('saveCommentButton').addEventListener('click', async () => {
        try {
            // Capture the comment text from the textarea
            const commentText = document.getElementById('comment').value;

            // Check if there's a current invoice ID
            if (!currentInvoiceId) {
                console.error('No current invoice selected.');
                return;
            }

            // Make an API request to update the comment in the database
            const response = await fetch(`https://dashboard-function-app-1.azurewebsites.net/api/updateComments?code=d2O6a2c4ZB-XRtNhCCm5bxtSye0viZVQ-bog5Q9NpvO3AzFuhig-iQ==`, {
                method: 'POST', // Use the appropriate HTTP method (e.g., PUT) for updating data
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    tableName: 'Invoices',
                    recordId: currentInvoiceId,
                    comment: commentText,
                }),
            });

            if (!response.ok) {
                throw new Error('Error updating comment.');
            }

            // After successfully updating the comment in the database, you may want to refresh the table to reflect the updated comment.
            // You can call a function to fetch and display the data for the selected table or view here.

            // Close the modal
            $('#commentModal').modal('hide');
            console.log('calling applyfilter again');
            applyFiltersAndSort();
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    });


}


console.log('Data rendered');
export { renderTable };