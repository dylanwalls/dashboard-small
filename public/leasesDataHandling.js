async function fetchLeasesData() {
    const apiUrl = 'https://dashboard-function-app-1.azurewebsites.net/api/fetchLeases?code=Yfl0IjcwSQWSx6a8N0bYfkqpr2zeBOMGunnXGLyVdOKCAzFu69K0xQ==';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error('There was a problem fetching the lease data.', e);
    }
}

async function populateLeasesData() {
    const leasesData = await fetchLeasesData();
    console.log('Fetched leases data:', leasesData); // Log initial data for diagnostic purposes

    if (leasesData && leasesData.length > 0) {
        const leasesWithValidTimestamps = leasesData.filter(lease => lease.importTimestamp !== null);
        console.log('Leases with valid timestamps:', leasesWithValidTimestamps.length); // Verify filtered data

        if (leasesWithValidTimestamps.length === 0) {
            console.error('No leases with valid importTimestamps found.');
            return;
        }

        // Ensure initialization of the reduce function to avoid undefined values
        const initialTimestamp = leasesWithValidTimestamps[0].importTimestamp;
        const mostRecentTimestampStr = leasesWithValidTimestamps.reduce((max, lease) => {
            const current = lease.importTimestamp;
            console.log(`Comparing: ${current} with max: ${max}`); // Diagnostic log
            return current > max ? current : max;
        }, initialTimestamp);

        console.log('Most recent timestamp string:', mostRecentTimestampStr);

        const recentLeasesData = leasesData.filter(lease => lease.importTimestamp === mostRecentTimestampStr);
        console.log('Recent leases data count:', recentLeasesData.length); // Confirm filtering result

        // Populate the full list of recent leases
        const allLeasesTableBody = document.getElementById('leases-table-body');
        populateTable(allLeasesTableBody, recentLeasesData);

        // Calculate the start of next month and then add three months to find the cutoff date
        const today = new Date();
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const threeMonthsFromNextMonth = new Date(startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 3));

        // Filter leases to find those ending before or on the cutoff date
        const leasesEndingSoonData = leasesData.filter(lease => {
            const rentEscalationDate = new Date(lease.rentEscalationDate);
            return rentEscalationDate <= threeMonthsFromNextMonth;
        });

    } else {
        console.error('No lease data was returned from the API or the data is empty.');
        // Handle the empty data case appropriately here.
    }

    // // Populate the "Leases Ending Soon" table
    // const leasesEndingSoonTableBody = document.getElementById('leases-ending-soon-body');
    // populateTable(leasesEndingSoonTableBody, leasesEndingSoonData);
}

function populateTable(tableBody, leases) {
    tableBody.innerHTML = ''; // Clear existing rows
    leases.forEach((lease, index) => {
        // Main row
        const row = tableBody.insertRow();
        // Construct the address string
        const address = lease.unitNo + ' ' + lease.propertyAddress;
        
        // Add the address to the lease object
        lease.address = address;
        const leaseDataStr = encodeURIComponent(JSON.stringify(lease)); // Encode the lease object
        // Calculate time difference in months
        const today = new Date();
        const rentEscalationDate = new Date(lease.rentEscalationDate);
        const monthsAway = (rentEscalationDate.getFullYear() - today.getFullYear()) * 12 + rentEscalationDate.getMonth() - today.getMonth();
        
        // Apply color-coding based on conditions
        if (monthsAway <= 3) {
            if (!lease.escalationStatus) {
                row.classList.add('red-row');
            } else if (lease.escalationStatus === 'Notice sent' && !lease.tenantResponse) {
                row.classList.add('yellow-row');
            } else if (lease.escalationStatus === 'Confirmed' && lease.tenantResponse) {
                row.classList.add('green-row');
            }
        }
        row.innerHTML = `
            <td>${lease.unitNo}</td>
            <td>${lease.tenantName}</td>
            <td>${lease.tenantIdNo}</td>
            <td>${lease.tenantEmail}</td>
            <td>${lease.tenantMobileNo}</td>
            <td>${lease.currentRent}</td>
            <td>${lease.newRent}</td>
            <td>${lease.deposit}</td>
            <td>${new Date(lease.statusDate).toLocaleDateString()}</td>
            <td>${new Date(lease.firstMonthDate).toLocaleDateString()}</td>
            <td>${new Date(lease.lastPaymentReceived).toLocaleDateString()}</td>
            <td>${new Date(lease.rentEscalationDate).toLocaleDateString()}</td>
        `;

        // Determine the class based on the deposit status
        let depositStatusClass = '';
        switch (lease.depositStatus) {
            case 'Paid':
                depositStatusClass = 'deposit-paid';
                break;
            case 'Overdue':
                depositStatusClass = 'deposit-overdue';
                break;
            case 'Partially Paid':
                depositStatusClass = 'deposit-partially-paid'; // If you have a default color or specific styling
                break;
            case 'Overpaid':
                depositStatusClass = 'deposit-overpaid';
                break;
            default:
                depositStatusClass = ''; // Default class
                break;
        }
        // Detail row (initially hidden)
        const detailRow = tableBody.insertRow();
        detailRow.classList.add('detailRow');
        detailRow.style.display = 'none'; // Hide detail row by default
        detailRow.innerHTML = `
            <td colspan="14">
                <div style="display: flex; justify-content: flex-start; align-items: flex-start;">
                    <div style="flex: 1;">
                        <strong>Address:</strong> ${lease.address}<br>
                        <strong>Escalation Status:</strong> ${lease.escalationStatus}<br>
                        <strong>Tenant Decision:</strong> ${lease.tenantResponse}<br>
                        <strong>New Rent Amount:</strong> <input type="number" id="newRentAmount-${index}" value="${lease.newRent}" /><br>
                        <button onclick='sendMessage(${index}, "${leaseDataStr}", "3MonthNotice")'>Send 3-Month Lease Request</button>
                        <button onclick='sendMessage(${index}, "${leaseDataStr}", null)'>Send 1-Month Notification</button>
                        <button onclick='openMessageModal(${index}, "${leaseDataStr}")'>Send Notice</button>
                        <button onclick='addInspectionManually(${index}, "${leaseDataStr}")'>Add Inspection Manually</button>
                    </div>
                    <div style="flex: 2; margin-left: 20px;">
                        <strong>Deposit Status:</strong> <span class="${depositStatusClass}"> ${lease.depositStatus}</span><br>
                        <strong>Deposit Due:</strong> ${lease.depositDue}<br>
                        <strong>Deposit Amount:</strong> ${lease.depositAmount}<br>
                        <strong>Interest:</strong> ${lease.interestAmount}<br>
                        <strong>Total Deposit:</strong> ${lease.totalDeposit}<br>
                    </div>
                </div>
            </td>
        `;

        // Click event to toggle detail row visibility
        row.addEventListener('click', () => {
            detailRow.style.display = detailRow.style.display === 'none' ? '' : 'none';
        });
    });
}

async function updateLeaseStatus(leaseId, leaseStatus, newRentAmount) {
    const updateUrl = "https://dashboard-function-app-1.azurewebsites.net/api/updateLeaseStatus?code=Yyoj_Iqvpucdn4Mk3NoH3TvOmlfH4f3L9pzLtlwMi-cgAzFuQZGd4g=="; // Your Azure Function URL for updating lease status
    try {
        const response = await fetch(updateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ leaseId, leaseStatus, newRentAmount }),
        });

        if (response.ok) {
            console.log("Lease status updated successfully.");
        } else {
            throw new Error(`Failed to update lease status: ${response.statusText}`);
        }
    } catch (e) {
        console.error('There was a problem updating the lease status.', e);
    }
}

function getMessageTypeIdForLease(leaseObj) {
    return leaseObj.tenantResponse === 'Extended' ? "1MonthExtended" : "1MonthNoticeGiven";
}

let templateNotice;
let selectedTemplateKey;

function updateMessageBody() {
    const customMessage = $('#customMessage').val().trim();
    const selectedTemplateKey = $('#messageTemplateDropdown').find("option:selected").val();
    const templateBody = messageTemplates[selectedTemplateKey]?.text || 'No template selected.'; // Safely access the text property

    let finalMessageBody = customMessage.length > 0 ? customMessage : templateBody;

    // Use the global variable templateNotice
    let updatedMessage = templateNotice.replace('{{Body}}', finalMessageBody);
    $('#messagePreview').val(updatedMessage);
}



// Make sure templateNotice is defined and passed correctly
function openMessageModal(index, leaseStr) {
    const leaseObj = JSON.parse(decodeURIComponent(leaseStr));
    const todayDate = new Date();
    const today = todayDate.toISOString().split('T')[0];

    // Define or redefine templateNotice here
    templateNotice = `To: ${leaseObj.tenantName}\nAddress: ${leaseObj.address}\n\nNotice of Breach of Contract\n\nDate: ${today}\n\nTenancy at ${leaseObj.address}\n\nWe refer to the Lease Agreement between Microproperty Development Fund (Pty) Ltd and yourself dated ${leaseObj.statusDate.split("T")[0]}.\n\n{{Body}}\n\nDelivery of Notice by WhatsApp. Any notice delivered by text during normal business hours shall be deemed to have been received by the addressee on the date of delivery.\n\nFor enquiries, contact Bitprop on 021 701 7106 during office hours.\n\nYours,\nBitprop`;

    $('#messagePreview').val(templateNotice);
    $('#messageModal').data('index', index);
    // Store leaseStr as a data attribute on the modal
    $('#messageModal').data('leaseStr', leaseStr);

    $('#messageModal').modal('show');

    updateMessageBody90:

    // Adjust these event handlers to pass templateNotice
    $('#messageTemplateDropdown').off('change').change(updateMessageBody);
    $('#customMessage').off('input').on('input', updateMessageBody);

}

// Event listener to reset the modal once it's closed
$('#messageModal').on('hidden.bs.modal', function () {
    // Reset the dropdown
    $('#messageTemplateDropdown').val($('#messageTemplateDropdown option:first').val());
    
    // Clear custom message input
    $('#customMessage').val('');

    // Optionally reset the message preview, you might want to set it to some default or instruction text
    $('#messagePreview').val('Select a template or type a custom message.');

    // Reset any other state or UI elements related to the modal
});

$(document).ready(function() {

    // Dropdown change event
    $('#messageTemplateDropdown').on('change', function() {
        console.log('dropdown change');
        const selectedValue = $(this).val();
        // Check if the selected option is for the custom message
        if(selectedValue === 'template3'){ // Assuming 'template3' is the key for the "Custom" option
            $('#customMessageContainer').show();
        } else {
            $('#customMessageContainer').hide();
        }

        // Optionally, trigger an update to the message preview here
    });
    // // Initially hide the custom message container
    // $('#customMessageContainer').hide();

    // Populate dropdown
    $('#messageTemplateDropdown').empty(); // Clear existing options first to avoid duplicates
    $('#messageTemplateDropdown').append('<option value="">Please select</option>'); // Placeholder option

    // Append templates to the dropdown
    Object.entries(messageTemplates).forEach(([key, template]) => {
        $('#messageTemplateDropdown').append($('<option>', {
            value: key,
            text: template.name // Assuming you want to show the name
        }));
    });

    // Reset functionality when the modal is closed
    $('#messageModal').on('hidden.bs.modal', function() {
        $('#messageTemplateDropdown').val(''); // Reset the dropdown
        $('#customMessage').val(''); // Clear the custom message
        // $('#customMessageContainer').hide(); // Hide the custom message container
        // Reset the message preview to default or clear it out
    });
});



function finaliseAndSend() {
    const index = $('#messageModal').data('index'); // Retrieve the stored index
    const leaseStr = $('#messageModal').data('leaseStr');
    const customMessage = $('#customMessage').val().trim();
    const selectedTemplateBody = $('#messageTemplateDropdown').find(':selected').data('body');
    console.log('selected template body:', selectedTemplateKey);
    const messageToSend = customMessage.length > 0 ? customMessage : selectedTemplateBody;
    // if (selec)
    console.log('Message to send:', messageToSend);
    $('#messageModal').modal('hide');
    sendMessage(index, leaseStr, 'Notice', messageToSend); // Assuming you adjust sendMessage to accept additional parameters
}


function addInspectionManually(index, leaseDataStr) {
    const leaseObj = JSON.parse(decodeURIComponent(leaseDataStr));
    // const prefilledInspectionForm = createJotFormUrl(leaseObj.tenantName, leaseObj.tenantEmail, leaseObj.tenantMobileNo, leaseObj.address, 'Phumlani', 'Tyali', leaseObj.leaseId)

    const jsonBody = {
        "leaseObj": leaseObj,
    };

    console.log('JSON body for manual inspection:', jsonBody);

    const apiUrl = "https://maintenance-node.azurewebsites.net/api/insertInspection?code=QaW0HOzCXQEqVSh9MuemlJGWj4zebY678n6bSgLRNAhsAzFupWvNSQ==";

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Process the response if JSON
    })
    .then(data => {
        console.log('Success:', data);  // Handle the success response
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error); // Handle errors
    });
}


window.onload = populateLeasesData;