document.addEventListener('DOMContentLoaded', function() {
    // Attach event listeners for download buttons
    document.getElementById('downloadRentRoll').addEventListener('click', downloadRentRoll);
    document.getElementById('downloadDeposits').addEventListener('click', downloadDeposits);
    document.getElementById('downloadBatchPayoutTable').addEventListener('click', downloadBatchPayoutTable);
    
    // Attach event listeners for management buttons
    document.getElementById('updateDeposits').addEventListener('click', updateDeposits);
    
    // Attach event listeners for upload buttons
    document.getElementById('uploadTransactionButton').addEventListener('click', uploadTransactionList);
    document.getElementById('uploadPropertyButton').addEventListener('click', uploadProperties);
    document.getElementById('uploadLeasesButton').addEventListener('click', uploadLeases);
    document.getElementById('uploadIndluPayoutButton').addEventListener('click', uploadIndluPayoutList);
    document.getElementById('reconcileIndluPayoutButton').addEventListener('click', reconcileIndluPayoutList);
    document.getElementById('uploadCitiqMeters').addEventListener('click', uploadCitiqMeters);
    document.getElementById('uploadCitiqRemit').addEventListener('click', uploadCitiqRemit);
    document.getElementById('sendCitiqValuesButton').addEventListener('click', sendCitiqValuesToAllHomeowners);
    
    // Attach event listeners for function buttons
    document.getElementById('reconcileTransactions').addEventListener('click', reconcileTransactions);
    document.getElementById('generateInvoices').addEventListener('click', generateInvoices);
});

// Define functions for each operation
function downloadRentRoll() {
    var month = document.getElementById('rentRollMonth').value;
    var year = document.getElementById('rentRollYear').value;
    console.log('Downloading Rent Roll for the month', month);
    const azureFunctionURL = 'https://python38-functions.azurewebsites.net/api/downloadRentRoll?code=2ZRFLWuU_SoSAvlKNPN8_-ATQSQ55F6uJpqLTNXnElvSAzFu4C4JYg==';
            // const month = document.getElementById('filterMonth').value;
            console.log('month: ', month);
            fetch(azureFunctionURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"month": month, "year": year}),
            })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `rentRollSchedule_${month}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error calling Azure Function:', error);
            });
}

function downloadDeposits() {
    console.log('Downloading Deposit Schedule...');
    const azureFunctionURL = 'https://python38-functions.azurewebsites.net/api/downloadExcel?code=OmWnz5qzTyTy1Zrp3nQSLGWHbk0tKN4BAsr0QA9wgVAlAzFunCDdNA==';

    fetch(azureFunctionURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'depositSchedule.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error calling Azure Function:', error);
    });
}

async function downloadBatchPayoutTable() {
    // Display a loading message
    downloadBatchPayoutMessage.textContent = 'Downloading Batch Payout File...';

    try {
        // Send a POST request to trigger the reconciliation function
        const response = await fetch('https://python38-functions.azurewebsites.net/api/downloadIndluReconTable?code=R1g1QFfV2Rzds15gWDaCG8glhZRs5K7BFJtc2xdhMmNMAzFuS6VXNA==', {
            method: 'POST',
            mode: 'cors',
        });

        if (response.ok) {
            // Create a Blob from the response data
            const blob = await response.blob();
            
            // Create an object URL for the blob object
            const url = window.URL.createObjectURL(blob);
            
            // Create a new anchor element
            const a = document.createElement('a');
            a.href = url;

            // Create a date string for appending
            const now = new Date();
            const dateString = now.toISOString().replace(/[\-:]/g, '').replace('T', '_').split('.')[0];

            // Set the file name for download, including the date and time for uniqueness
            a.download = `batchPayoutTable_${dateString}.xlsx`; // Set the file name for download

            document.body.appendChild(a); // Append the anchor to the body
            a.click(); // Programmatically click the anchor to trigger the download
            
            // Clean up by revoking the object URL and removing the anchor element
            window.URL.revokeObjectURL(url);
            a.remove();

            // Display a success message
            downloadBatchPayoutMessage.textContent = 'Download successful.';
        } else {
            // Display an error message
            downloadBatchPayoutMessage.textContent = 'Download failed. Please try again.';
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        // Display an error message
        downloadBatchPayoutMessage.textContent = 'An error occurred. Please try again later.';
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationContent = document.getElementById('notification-content');
    notificationContent.innerText = message;
    notification.style.display = 'block';
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}

async function updateDeposits() {
    console.log('Updating deposit interest and status');
    showNotification('Function is running...');

    try {
        await updateDepositInterest();
        showNotification('Deposit interest and status updated successfully');
        setTimeout(() => hideNotification(), 3000);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error occurred during function execution');
        setTimeout(() => hideNotification(), 3000);
    }
}

async function updateDepositInterest() {
    const depositInterestUrl = 'https://python38-functions.azurewebsites.net/api/depositInterestCalc?code=UDBOfGGuESjm_UznLdbouSW7azBNnYDiOo7fTVgw6QOEAzFuc_L4aQ==';
    const response = await fetch(depositInterestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) throw new Error('Failed to calculate interest');

    console.log('Interest calculation completed:', await response.text());

    // Call deposit status update only if interest calculation succeeds
    return depositStatusCalc();
}

async function depositStatusCalc() {
    const depositStatusCalcUrl = 'https://python38-functions.azurewebsites.net/api/depositStatus?code=rGLnNfM0TlY5f1GYMPRzA2T17Zq4VB_nOSMv3KgH5Jt3AzFuOmnSug==';
    const response = await fetch(depositStatusCalcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) throw new Error('Failed to update deposit status');

    console.log('Status update completed:', await response.text());
}


async function uploadTransactionList() {
    const transactionFile = transactionFileInput.files[0];

    if (transactionFile) {
        // Display a loading message
        uploadTransactionStatusMessage.textContent = 'Uploading...';

        // Create a FormData object and append the transaction file
        const formData = new FormData();
        formData.append('excelFile', transactionFile);

        try {
            // Send a POST request to your backend with the transaction file data
            const response = await fetch('https://python38-functions.azurewebsites.net/api/importTransactions?code=T1Bb45aNKoWlbngF3fKdiH6boPexIEQfgMdDfweuwdowAzFuWfpjTg==', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (response.ok) {
                // Display a success message
                uploadTransactionStatusMessage.textContent = 'Upload successful.';
                // updateLastUpdatedLabel('lastUpdatedTransactions', 'last_updated_transactions');
                // updateMetadataLabels();
            } else {
                // Display an error message
                uploadTransactionStatusMessage.textContent = 'Upload failed. Please try again.';
            }
        } catch (error) {
            console.error('Error uploading transaction file:', error);
            // Display an error message
            uploadTransactionStatusMessage.textContent = 'An error occurred. Please try again later.';
        }
    } else {
        // Display a message if no transaction file is selected
        uploadTransactionStatusMessage.textContent = 'Please select a transaction file to upload.';
    }
}

async function uploadProperties() {
    const propertyFile = propertyFileInput.files[0];

    if (propertyFile) {
        // Display a loading message
        uploadPropertyStatusMessage.textContent = 'Uploading...';

        // Create a FormData object and append the property file
        const formData = new FormData();
        formData.append('excelFile', propertyFile);

        try {
            // Send a POST request to your backend with the property file data
            const response = await fetch('https://python38-functions.azurewebsites.net/api/importProperties?code=ZpSs6qZHqFPMfDZOFuL3IIzlSo01TdWShJnW4SoLjRp1AzFufC4Vbw==', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (response.ok) {
                // Display the message from the response
                const message = await response.text(); // Assuming the message is plain text
                uploadPropertyStatusMessage.textContent = message;
                // updateLastUpdatedLabel('lastUpdatedProperties', 'last_updated_properties');
                // updateMetadataLabels();
            } else {
                // Display an error message
                uploadPropertyStatusMessage.textContent = 'Upload failed. Please try again.';
            }
        } catch (error) {
            console.error('Error uploading property file:', error);
            // Display an error message
            uploadPropertyStatusMessage.textContent = 'An error occurred. Please try again later.';
        }
    } else {
        // Display a message if no property file is selected
        uploadPropertyStatusMessage.textContent = 'Please select a property file to upload.';
    }
}

async function uploadLeases() {
    const leasesFile = leasesFileInput.files[0];

    if (leasesFile) {
        // Display a loading message
        uploadLeasesStatusMessage.textContent = 'Uploading...';

        // Create a FormData object and append the transaction file
        const formData = new FormData();
        formData.append('excelFile', leasesFile);

        try {
            // Send a POST request to your backend with the transaction file data
            const response = await fetch('https://python38-functions.azurewebsites.net/api/importLeasing?code=ol-9jV6Uyogv6a6o3n-ZtCd8FSvSrTTXZitNunl1mWz_AzFujr81BQ==', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (response.ok) {
                // Display a success message
                console.log(response);
                uploadLeasesStatusMessage.textContent = 'Upload successful.';
                // updateLastUpdatedLabel('lastUpdatedLeases', 'leases_last_updated');
                // updateMetadataLabels();
            } else {
                // Display an error message
                uploadTransactionStatusMessage.textContent = 'Upload failed. Please try again.';
            }
        } catch (error) {
            console.error('Error uploading transaction file:', error);
            // Display an error message
            uploadTransactionStatusMessage.textContent = 'An error occurred. Please try again later.';
        }
    } else {
        // Display a message if no transaction file is selected
        uploadTransactionStatusMessage.textContent = 'Please select a transaction file to upload.';
    }
}

async function uploadIndluPayoutList() {
    const indluPayoutFile = indluPayoutFileInput.files[0];

    if (indluPayoutFile) {
        // Display a loading message
        uploadIndluPayoutMessage.textContent = 'Uploading...';

        // Create a FormData object and append the property file
        const formData = new FormData();
        formData.append('excelFile', indluPayoutFile);

        try {
            // Send a POST request to your backend with the property file data
            const response = await fetch('https://python38-functions.azurewebsites.net/api/importIndluPayoutList?code=ELmDi9SMiY5MgjEScE2OzA0_1rQ6aGN3azmkH1kWYTt2AzFunxdXtA==', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (response.ok) {
                // Display the message from the response
                const message = await response.text(); // Assuming the message is plain text
                uploadIndluPayoutMessage.textContent = message;
            } else {
                // Display an error message
                uploadIndluPayoutMessage.textContent = 'Upload failed. Please try again.';
            }
        } catch (error) {
            console.error('Error uploading Indlu payout file:', error);
            // Display an error message
            uploadIndluPayoutMessage.textContent = 'An error occurred. Please try again later.';
        }
    } else {
        // Display a message if no property file is selected
        uploadIndluPayoutMessage.textContent = 'Please select an Indlu payout file to upload.';
    }
}

async function reconcileIndluPayoutList() {
    // Display a loading message
    uploadIndluPayoutMessage.textContent = 'Reconciling Indlu payout...';

    try {
        // Send a POST request to trigger the reconciliation function
        const response = await fetch('https://python38-functions.azurewebsites.net/api/reconcileIndluPayout?code=zAHmuFY9vRCuWPtuuKLX8E059BdX1FisEB6381aIgsGJAzFuz6Spdg==', {
            method: 'POST',
            mode: 'cors',
        });

        if (response.ok) {
            // Display a success message
            uploadIndluPayoutMessage.textContent = 'Reconciliation successful.';
        } else {
            // Display an error message
            uploadIndluPayoutMessage.textContent = 'Reconciliation failed. Please try again.';
        }
    } catch (error) {
        console.error('Error reconciling transactions:', error);
        // Display an error message
        uploadIndluPayoutMessage.textContent = 'An error occurred. Please try again later.';
    }
}

async function uploadCitiqMeters() {
    const meterFile = citiqMetersInput.files[0];

    if (meterFile) {
        // Display a loading message
        uploadMetersStatusMessage.textContent = 'Uploading...';

        // Create a FormData object and append the property file
        const formData = new FormData();
        formData.append('excelFile', meterFile);

        try {
            // Send a POST request to your backend with the property file data
            const response = await fetch('https://python38-functions.azurewebsites.net/api/importCitiqMeters?code=p3PH_F5byFQWxXr4nl7khOwoGP5Mug3zPO39SvwQp41WAzFuuBBCJw==', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (response.ok) {
                // Display the message from the response
                const message = await response.text(); // Assuming the message is plain text
                uploadMetersStatusMessage.textContent = message;
                // updateLastUpdatedLabel('lastUpdatedProperties', 'last_updated_properties');
                // updateMetadataLabels();
            } else {
                // Display an error message
                uploadMetersStatusMessage.textContent = 'Upload failed. Please try again.';
            }
        } catch (error) {
            console.error('Error uploading property file:', error);
            // Display an error message
            uploadMetersStatusMessage.textContent = 'An error occurred. Please try again later.';
        }
    } else {
        // Display a message if no property file is selected
        uploadMetersStatusMessage.textContent = 'Please select a property file to upload.';
    }
}

async function uploadCitiqRemit() {
    const files = multipleFileInput.files;
    const month = document.getElementById('monthDropdown').value;
    const year = document.getElementById('yearInput').value;
    // const propertyRef = document.getElementById('property').value;
    console.log('month: ', month);
    console.log('year: ', year);
    // console.log('property ref: ', propertyRef);

    if (files.length > 0) {
        // Display a loading message
        uploadMultipleStatusMessage.textContent = 'Uploading...';

        // Iterate over each file and upload it
        for (const file of files) {
            const formData = new FormData();
            formData.append('csvFile', file);
            formData.append('month', month);
            formData.append('year', year);
            // formData.append('propertyRef', propertyRef);

            try {
                const response = await fetch('https://python38-functions.azurewebsites.net/api/importCitiqStatements?code=IYDMZ2ic0zjNk8Qva2qHxbiVvGagGlyz1vOlpl1P4ydMAzFunf5d5A==', {
                    method: 'POST',
                    body: formData,
                    mode: 'cors',
                });

                if (response.ok) {
                    // Display a success message for each file
                    uploadMultipleStatusMessage.textContent += `Uploaded ${file.name} successfully.\n`;
                    // updateLastUpdatedLabel('lastUpdatedMultiple', 'last_updated_multiple');
                    // updateMetadataLabels();
                } else {
                    // Display an error message for each file
                    uploadMultipleStatusMessage.textContent += `Upload failed for ${file.name}. Please try again.\n`;
                }
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
                uploadMultipleStatusMessage.textContent += `An error occurred while uploading ${file.name}. Please try again later.\n`;
            }
        }
    } else {
        // Display a message if no files are selected
        uploadMultipleStatusMessage.textContent = 'Please select files and fill in all fields.';
    }
}

async function sendCitiqValuesToAllHomeowners() {
    // Display a loading message
    uploadMultipleStatusMessage.textContent = 'Sending values to homeowners...';

    try {
        const requestBody = {
            "send_to_all": true
        };
        const response = await fetch('https://python38-functions.azurewebsites.net/api/sendCitiqValues?code=0BNSZemnxrYh4-43wD7uaGzAw8Ia-r7OzgQKcL8qZTExAzFuQ6INDA==', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            // Display a success message for each file
            uploadMultipleStatusMessage.textContent += `Messages sent successfully.\n`;
            // updateLastUpdatedLabel('lastUpdatedMultiple', 'last_updated_multiple');
            // updateMetadataLabels();
        } else {
            // Display an error message for each file
            uploadMultipleStatusMessage.textContent += `Message sending failed. Please try again.\n`;
        }
    } catch (error) {
        console.error(`Error (line 390)`, error);
        uploadMultipleStatusMessage.textContent += `An error occurred (line 390). Please try again later.\n`;
    }
}

async function updateMetadataLabels() {
    let metadata = await fetchMetadata();
    if (metadata) {
        // Assuming your metadata returns an array or an object.
        // Adjust according to your actual response structure.
        document.getElementById('lastUpdatedTransactions').textContent = metadata['last_updated_transactions'] || 'N/A';
        document.getElementById('lastUpdatedProperties').textContent = metadata['last_updated_properties'] || 'N/A';
        document.getElementById('lastUpdatedLeases').textContent = metadata['leases_last_updated'] || 'N/A';
        document.getElementById('reconciliationStatusMessage').textContent = metadata['last_reconciled_transactions'] || 'N/A';
        document.getElementById('lastGeneratedInvoices').textContent = metadata['last_generated_invoices'] || 'N/A';
        //... Add other metadata updates here
    }
}

function updateLastUpdatedLabel(labelId, metaKey) {
    const timestamp = new Date().toLocaleString();

    document.getElementById(labelId).textContent = timestamp;

    // Prepare data to send to the server
    const data = {
        meta_key: metaKey,
        meta_value: timestamp
    };

    // Send data to server
    fetch('https://dashboard-function-app-1.azurewebsites.net/api/updateMetaData?code=nIb1Jt8EvziIXHh4d6dkl8wFqV6VheAed_OTu-xFK_-AAzFuWf2-Yg==', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => console.error('Error:', error));
}

async function reconcileTransactions() {
    reconciliationStatusMessage.textContent = 'Reconciling transactions...';

    try {
        // Send a POST request to trigger the reconciliation function
        const response = await fetch('https://python38-functions.azurewebsites.net/api/reconcileTransactions?code=F4nIHNnNeWzZbFqK0skrFc_qJ1hUoirQhaUbfBOu1HpmAzFucx6XtA==', {
            method: 'POST',
            mode: 'cors',
        });

        if (response.ok) {
            // Display a success message
            reconciliationStatusMessage.textContent = 'Reconciliation successful.';
            updateLastUpdatedLabel('reconciliationStatusMessage', 'last_reconciled_transactions');
            updateMetadataLabels();
        } else {
            // Display an error message
            reconciliationStatusMessage.textContent = 'Reconciliation failed. Please try again.';
        }
    } catch (error) {
        console.error('Error reconciling transactions:', error);
        // Display an error message
        reconciliationStatusMessage.textContent = 'An error occurred. Please try again later.';
    }
}

async function generateInvoices() {
    generateInvoicesStatusMessage.textContent = 'Generating invoices...';

    try {
        // Send a POST request to trigger the generate invoices function
        const response = await fetch('https://python38-functions.azurewebsites.net/api/generateInvoices?code=TpsCxku4LFCcOFvNpk6csT96x_AxH0SPuazhPUk88FAkAzFu3Ee25w==', {
            method: 'POST',
            mode: 'cors',
        });

        if (response.ok) {
            // Display a success message
            generateInvoicesStatusMessage.textContent = 'Invoices generated successfully.';
            // updateLastUpdatedLabel('lastGeneratedInvoices', 'last_generated_invoices');
            // updateMetadataLabels();
        } else {
            // Display an error message
            generateInvoicesStatusMessage.textContent = 'Invoice generation failed. Please try again.';
        }
    } catch (error) {
        console.error('Error generating invoices:', error);
        // Display an error message
        generateInvoicesStatusMessage.textContent = 'An error occurred. Please try again later.';
    }
}

async function fetchMetadata() {
    try {
        let response = await fetch('https://dashboard-function-app-1.azurewebsites.net/api/fetchMetadata?code=xjpjkjqlvPUq9zFlqqZumqeHdnL0fLg7P01YjDZ2Kl2AAzFuBbFEVQ==');
        let data = await response.json();
        console.log('Raw data: ', data);
        let metadata = {};
        if (Array.isArray(data)) {
            data
                data.forEach(item => {
                    if (item.meta_key && item.meta_value) {
                        metadata[item.meta_key] = item.meta_value;
                    } else {
                        console.warn('Skipped item due to missing meta_key or meta_value:', item);
                    }
                   
                });
        } else {
            console.error('Unexpected data format:', data); // Log an error if data is not an array
        }
        return metadata;
    } catch (error) {
        console.error("Error fetching metadata:", error);
    }
}

async function updateMetadataLabels() {
    let metadata = await fetchMetadata();
    if (metadata) {
        // Assuming your metadata returns an array or an object.
        // Adjust according to your actual response structure.
        document.getElementById('lastUpdatedTransactions').textContent = metadata['last_updated_transactions'] || 'N/A';
        document.getElementById('lastUpdatedProperties').textContent = metadata['last_updated_properties'] || 'N/A';
        document.getElementById('lastUpdatedLeases').textContent = metadata['leases_last_updated'] || 'N/A';
        document.getElementById('reconciliationStatusMessage').textContent = metadata['last_reconciled_transactions'] || 'N/A';
        document.getElementById('lastGeneratedInvoices').textContent = metadata['last_generated_invoices'] || 'N/A';
        //... Add other metadata updates here
    }
}

// Add this function to update Last Updated labels
function updateLastUpdatedLabel(labelId, metaKey) {
    const timestamp = new Date().toLocaleString();

    document.getElementById(labelId).textContent = timestamp;

    // Prepare data to send to the server
    const data = {
        meta_key: metaKey,
        meta_value: timestamp
    };

    // Send data to server
    fetch('https://dashboard-function-app-1.azurewebsites.net/api/updateMetaData?code=nIb1Jt8EvziIXHh4d6dkl8wFqV6VheAed_OTu-xFK_-AAzFuWf2-Yg==', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => console.error('Error:', error));
}