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
                        if (key !== 'property_id' && key !== 'unit_id' && key !== 'amount_paid_out') {
                            if (key === 'month') {
                                table += '<th>Month</th>'; // Display 'Month' label instead of key name
                            } else if (key === 'date_paid') {
                                table += '<th>Date Paid</th>'; // Display 'Date Paid' label instead of key name
                            } else {
                                table += `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`;
                            }
                        }
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
                            if (key !== 'property_id' && key !== 'unit_id' && key !== 'amount_paid_out') {
                                if (key === 'month') {
                                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                    const monthIndex = parseInt(txn[key]) - 1; // Convert month value to index
                                    table += `<td>${monthNames[monthIndex]}</td>`; // Display month name
                                } else if ((key === 'date_paid' || key === 'payout_date') && txn[key]) {
                                    table += `<td>${txn[key].substring(0, 10)}</td>`; // Display only the first 10 characters of date_paid if it exists
                                } else {
                                    table += `<td>${txn[key]}</td>`;
                                }
                            }
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
                    table += '<tr class="total-row">';
                    table += `<td colspan="${Object.keys(transactions[0]).length - 10}"></td>`; // Empty cell
                    table += `<td>Total Paid</td>`;
                    table += `<td>${totalAmount.toFixed(2)}</td>`;
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
