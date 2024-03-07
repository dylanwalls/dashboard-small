document.addEventListener("DOMContentLoaded", function () {
    // Function to fetch homeowner details
    function fetchHomeownerDetails(propertyId) {
        const apiUrl = "https://dashboard-function-app-1.azurewebsites.net/api/fetchProperty?code=l6jTB7k7HUiJqzWolCR52jucnunMJCl2gpao3_Ulyj6ZAzFuPhq5bw==";

        // Create a JSON object with the propertyId
        const data = {
            property_id: propertyId
        };

        fetch(apiUrl, {
            method: "POST", // Use POST method to send JSON body
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify(data), // Convert the JSON object to a string
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch homeowner details');
                return response.json();
            })
            .then(homeownerDetails => {
                console.log('Homeowner Details', homeownerDetails);
                // Extract homeowner name and phone number from the response and display them
                const firstHomeowner = homeownerDetails[0];
                const homeownerName = firstHomeowner.homeowner;
                console.log('Homeowner', homeownerName);
                const homeownerPhoneNumber = firstHomeowner.phone;
                document.getElementById('homeownerName').innerText = homeownerName; // Display homeowner name
                document.getElementById('homeownerPhoneNumber').innerText = homeownerPhoneNumber; // Display homeowner phone number
            })
            .catch(error => {
                console.error('Error fetching homeowner details:', error);
                // Handle error, e.g., display a message to the user
            });
    }

    // Function to fetch and display transactions
    let rowDataArray = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Define monthNames outside the loop

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
                console.log(transactions);
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
                        let monthIndex;

                        // Generate table rows dynamically from data
                        for (const key in txn) {
                            if (key !== 'property_id' && key !== 'unit_id' && key !== 'amount_paid_out') {
                                if (key === 'month') {
                                    monthIndex = parseInt(txn[key]) - 1; // Convert month value to index
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
                        if (amountPaid > 0) {
                            // Construct the row data and push it to rowDataArray
                            rowDataArray.push({
                                unitRef: txn['unit_ref'],
                                month: monthNames[monthIndex],
                                amountPaid: amountPaid.toFixed(2),
                                homeownerAmount: homeownerAmount.toFixed(2)
                            });
                        }
                        
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

    // Function to send statement message
    function sendStatementMessage() {
        // Retrieve the values to send
        const totalAmountPaid = document.querySelector('.total-row td:nth-child(3)').textContent;
        const totalToHomeowner = document.querySelector('.total-row td:nth-child(7)').textContent;

        // Get the current month in words
        const currentMonthIndex = new Date().getMonth();
        const currentMonth = monthNames[currentMonthIndex];

        // Convert rowDataArray into a single string with the specified format
        const rowDataString = rowDataArray.map(row => `${row.month}: ${row.unitRef} - R${row.amountPaid}`).join(', ');

        console.log(rowDataString);

        // Construct the message data
        const messageData = {
            recipients: [
                {
                    phone: document.getElementById('homeownerPhoneNumber').innerText,
                    hsm_id: "160542",
                    parameters: [
                        { key: "{{1}}", value: document.getElementById('homeownerName').innerText },
                        { key: "{{2}}", value: currentMonth },
                        { key: "{{3}}", value: totalToHomeowner },
                        { key: "{{4}}", value: totalAmountPaid },
                        { key: "{{5}}", value: rowDataString }
                    ]
                }
            ]
        };

        console.log('statement message body:', messageData);


        // Send the message data to the Azure HTTP function
        fetch('https://dashboard-function-app-1.azurewebsites.net/api/sendWhatsappTemplate?code=HMT7Whg8vQmL9C_lOTjFZ0ILLhoLZORZXAd_myIXRdv1AzFuq4O4FQ==', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to send statement message');
            return response.json();
        })
        .then(data => {
            // Handle success response
            console.log('Message sent successfully:', data);
            // You can display a success message to the user here if needed
            document.getElementById('responseMessage').innerText = 'Message sent successfully';
        })
        .catch(error => {
            console.error('Error:', error);
            // You can display an error message to the user here if needed
            document.getElementById('responseMessage').innerText = 'Error sending message: ' + error.message;
        });

    }


    // Parse the URL query parameters to get the propertyId
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    if (propertyId) {
        fetchHomeownerDetails(propertyId);
        fetchAndDisplayTransactions(propertyId);
    } else {
        document.getElementById('transactionsData').innerHTML = "<p>Property ID is missing.</p>";
    }
    // Add event listener for the button to send statement message
    document.getElementById('sendStatementMessageBtn').addEventListener('click', sendStatementMessage);
});
