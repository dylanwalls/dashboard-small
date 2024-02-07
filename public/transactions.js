document.addEventListener("DOMContentLoaded", function () {
    // Function to fetch and display transactions
    function fetchAndDisplayTransactions(propertyId) {
        const apiUrl = "https://dashboard-function-app-1.azurewebsites.net/api/fetchLatestHomeownerInvoices?code=kctk1CbBmXKyOh4pPJIC7XD8wuamyfXjoCTySCUQuNsuAzFuxvJYyw==";

        // Create a JSON object with the propertyId
        const data = {
            propertyId: propertyId,
            month: 1 // You can set the month as needed
        };

        fetch(apiUrl, {
            method: "POST", // Use POST method to send JSON body
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify(data), // Convert the JSON object to a string
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch transactions');
                return response.json();
            })
            .then(transactions => {
                const container = document.getElementById('transactionsData');
                if (transactions.length > 0) {
                    let table = '<table class="table table-striped">'; // Add Bootstrap table class
                    table += '<thead class="thead-dark"><tr>'; // Add Bootstrap table header class

                    // Generate table headings dynamically from variable names
                    for (const key in transactions[0]) {
                        table += `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`;
                    }

                    // Add additional columns for homeowner amounts
                    table += '<th>Homeowner Amount</th>';
                    table += '</tr></thead><tbody>';

                    let totalAmount = 0; // Total amount for the total row
                    let totalToHomeowner = 0; // Total to homeowner for the total row

                    transactions.forEach(txn => {
                        table += '<tr>';

                        // Generate table rows dynamically from data
                        for (const key in txn) {
                            table += `<td>${txn[key]}</td>`;
                        }

                        // Calculate and display homeowner amount for each row (15% of amount paid)
                        const amountPaid = parseFloat(txn['amount_paid']);
                        let homeownerAmount;
                        // Check property_id and calculate homeowner amount accordingly
                        if (propertyId === '151') {
                            // For property_id 151, use 17.5%
                            homeownerAmount = 0.175 * amountPaid;
                        } else if (propertyId === '137') {
                            // For property_id 137, use 35%
                            homeownerAmount = 0.35 * amountPaid;
                        } else {
                            // For all other properties, use 15%
                            homeownerAmount = 0.15 * amountPaid;
                        }
                        table += `<td>${homeownerAmount.toFixed(2)}</td>`;

                        // Add the homeowner amount to the total to homeowner
                        totalToHomeowner += homeownerAmount;

                        // Add the amount paid to the total amount
                        totalAmount += amountPaid;

                        table += '</tr>';
                    });

                    // Add the "Total" row with values at the bottom of columns
                    table += '<tr>';
                    table += `<td colspan="${Object.keys(transactions[0]).length - 8}"></td>`; // Empty cell
                    table += `<td>Total of Amount Paid</td>`;
                    table += `<td>${totalAmount.toFixed(2)}</td>`;
                    table += `<td></td>`;
                    table += `<td></td>`;
                    table += `<td></td>`;
                    table += `<td></td>`;
                    table += `<td></td>`;
                    table += `<td>Total to Homeowner</td>`;
                    table += `<td>${totalToHomeowner.toFixed(2)}</td>`;
                    table += '</tr>';

                    table += '</tbody></table>';
                    container.innerHTML = table;
                } else {
                    container.innerHTML = "<p>No transactions found.</p>";
                }

                // Add CSS class to left-align the table
                const tableElement = document.querySelector('.table');
                tableElement.style.marginLeft = '0'; // Remove margin on the left
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('transactionsData').innerHTML = `<p>Error fetching transactions: ${error.message}</p>`;
            });
    }

    // Parse the URL query parameters to get the propertyId
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    if (propertyId) {
        fetchAndDisplayTransactions(propertyId);
    } else {
        document.getElementById('transactionsData').innerHTML = "<p>Property ID is missing.</p>";
    }
});
