async function fetchAssociationsData() {
    const apiUrl = `https://maintenance-node.azurewebsites.net/api/fetchProfileRentalUnitAssociations?code=EXExmpAZZcjExM9RKcw4SWXhk6gXSM8Te2QOURIuuYYAAzFuIfsN-g==`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error('There was a problem fetching the associations data.', e);
        return []; // Return an empty array in case of error
    }
}

async function fetchRentalUnitsData() {
    const apiUrl = 'https://maintenance-node.azurewebsites.net/api/fetchRentalUnits?code=gB2oE5zLkc7dGeHrKyC_oNN-EUT46W6l3rW_f6DpBeyBAzFu1qkvsQ==';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error('There was a problem fetching the rental units data.', e);
    }
}

async function fetchTenantInformation() {
    const apiUrl = 'https://maintenance-node.azurewebsites.net/api/fetchProfiles?code=kbfLHPwjqdbl95ltdDFnTSvADh40CqE6LkCyTK10TbvKAzFutbyDyQ==';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error('There was a problem fetching the tenant information data.', e);
        return [];
    }
}

async function confirmTerminateLease(associationID) {
    // Prompt for confirmation
    const confirmTerminate = confirm('Are you sure you want to terminate this lease?');
    if (!confirmTerminate) {
        return; // User canceled
    }

    // Prompt for a reason
    const reason = prompt('Please provide a reason for terminating the lease:');
    if (!reason || reason.trim() === '') {
        alert('Termination reason cannot be empty!');
        return; // User didn't provide a reason
    }

    // Prepare the data to update the association
    const updateData = {
        AssociationID: parseInt(associationID, 10),
        Status: 'Inactive',
        TerminationReason: reason
    };

    console.log('updateData:', updateData);

    // Send API request to update the association status
    try {
        const response = await fetch('https://maintenance-node.azurewebsites.net/api/terminateLeaseAssociation?code=Ni3AhUMnMxGaYNnzceFQRumq27KxajGNs5xetUJoBUDBAzFulzA3Cw%3D%3D', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            alert('Lease terminated successfully.');
            // Optionally, reload or update the page to reflect changes
            location.reload();
        } else {
            alert(`Failed to terminate lease: ${result.message}`);
        }
    } catch (e) {
        console.error('Error terminating lease:', e);
        alert('There was an error terminating the lease. Please try again later.');
    }
}


async function populateRentalUnitsData() {
    const rentalUnitsData = await fetchRentalUnitsData();
    const associationsData = await fetchAssociationsData();
    const tenantInformation = await fetchTenantInformation();
    console.log('Fetched rental units data:', rentalUnitsData);

    const tenantMap = tenantInformation.reduce((acc, tenant) => {
        acc[tenant.ID] = tenant;
        return acc;
    }, {});    

    if (rentalUnitsData && rentalUnitsData.length > 0) {

        // Link each unit with its active association
        const rentalUnitsWithAssoc = rentalUnitsData.map(unit => {
            const activeAssoc = associationsData.find(
                assoc => assoc.RentalUnitID === unit.unit_id && assoc.Status === 'Active'
            );

            // Retrieve tenant details from tenantMap if association exists
            const tenantDetails = activeAssoc ? tenantMap[activeAssoc.ProfileID] : null;
            console.log

            return {
                ...unit,
                activeAssoc: activeAssoc ? {
                    ...activeAssoc,
                    TenantFullName: tenantDetails ? tenantDetails.FullName : '',
                    TenantContact: tenantDetails ? tenantDetails.PrimaryContactNumber : '',
                    TenantIdNumber: tenantDetails ? tenantDetails.IdNumber : '',
                    TenantEmail: tenantDetails ? tenantDetails.EmailAddress : ''
                } : null
            };
        });

        // Now, filteredProfiles contains only the most recent profiles without duplicates based on IdNumber.
        // Populate the full list of recent profiles
        const allRentalUnitsTableBody = document.getElementById('rentalunits-table-body');
        populateTable(allRentalUnitsTableBody, rentalUnitsWithAssoc);

    } else {
        console.error('No profiles data was returned from the API or the data is empty.');
        // Handle the empty data case appropriately here.
    }

    // // Populate the "Leases Ending Soon" table
    // const leasesEndingSoonTableBody = document.getElementById('leases-ending-soon-body');
    // populateTable(leasesEndingSoonTableBody, leasesEndingSoonData);
}

function populateTable(tableBody, rentalunits) {
    tableBody.innerHTML = ''; // Clear existing rows
    rentalunits.forEach((rentalunit, index) => {
        // Main row
        const row = tableBody.insertRow();

        const assocDetails = rentalunit.activeAssoc
            ? `
            <div>
                <strong>Tenant:</strong> ${rentalunit.activeAssoc.TenantFullName || 'Unknown'}<br>
                <strong>Contact:</strong> ${rentalunit.activeAssoc.TenantContact || 'N/A'}<br>
                <strong>ID Number:</strong> ${rentalunit.activeAssoc.TenantIdNumber || 'N/A'}<br>
                <strong>Email Address:</strong> ${rentalunit.activeAssoc.TenantEmail || 'N/A'}<br>
                <strong>Lease Start Date:</strong> ${rentalunit.activeAssoc.StartDate}<br>
                <strong>Status:</strong> ${rentalunit.activeAssoc.Status}<br>
                <button onclick="confirmTerminateLease('${rentalunit.activeAssoc.AssociationID}')">Terminate Lease</button>
            </div>
            `
            : '<em>No active association</em>';

        const unitStatus = rentalunit.vacant ? 'Vacant' : 'Occupied';
        
        row.innerHTML = `
            <td>${rentalunit.unit_ref}</td>
            <td>${rentalunit.rent}</td>
            <td>${rentalunit.deposit_due}</td>
            <td>${rentalunit.deposit_paid}</td>
            <td>${rentalunit.agent}</td>
            <td>${unitStatus}</td>
            <td>${rentalunit.arrears}</td>
        `;

        // Detail row (initially hidden)
        const detailRow = tableBody.insertRow();
        detailRow.classList.add('detailRow');
        detailRow.style.display = 'none'; // Hide detail row by default
        detailRow.innerHTML = `
            <td colspan="14">
                <div style="display: flex; justify-content: flex-start; align-items: flex-start;">
                    <div style="flex: 1;">
                        <strong>Unit Id:</strong> ${rentalunit.unit_id}<br>
                        <strong>Property Id:</strong> ${rentalunit.property_id}<br>
                        <strong>Deposit Due:</strong> ${rentalunit.deposit_due}<br>
                        <strong>Deposit Paid:</strong> ${rentalunit.deposit_paid}<br>
                        <strong>Deposit Status:</strong> ${rentalunit.status}<br>
                        <strong>Comments:</strong> ${rentalunit.comments}<br>
                    </div>
                    <div style="flex: 1;">
                        <h6>Active Lease</h6>
                        <div>${assocDetails}</div>
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

// async function updateLeaseStatus(leaseId, leaseStatus, newRentAmount) {
//     const updateUrl = "https://dashboard-function-app-1.azurewebsites.net/api/updateLeaseStatus?code=Yyoj_Iqvpucdn4Mk3NoH3TvOmlfH4f3L9pzLtlwMi-cgAzFuQZGd4g=="; // Your Azure Function URL for updating lease status
//     try {
//         const response = await fetch(updateUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ leaseId, leaseStatus, newRentAmount }),
//         });

//         if (response.ok) {
//             console.log("Lease status updated successfully.");
//         } else {
//             throw new Error(`Failed to update lease status: ${response.statusText}`);
//         }
//     } catch (e) {
//         console.error('There was a problem updating the lease status.', e);
//     }
// }

// function getMessageTypeIdForLease(leaseObj) {
//     return leaseObj.tenantResponse === 'Extended' ? "1MonthExtended" : "1MonthNoticeGiven";
// }

// let templateNotice;
// let selectedTemplateKey;

// function updateMessageBody() {
//     const customMessage = $('#customMessage').val().trim();
//     const selectedTemplateKey = $('#messageTemplateDropdown').find("option:selected").val();
//     const templateBody = messageTemplates[selectedTemplateKey]?.text || 'No template selected.'; // Safely access the text property

//     let finalMessageBody = customMessage.length > 0 ? customMessage : templateBody;

//     // Use the global variable templateNotice
//     let updatedMessage = templateNotice.replace('{{Body}}', finalMessageBody);
//     $('#messagePreview').val(updatedMessage);
// }



// // Make sure templateNotice is defined and passed correctly
// function openMessageModal(index, leaseStr) {
//     const leaseObj = JSON.parse(decodeURIComponent(leaseStr));
//     const todayDate = new Date();
//     const today = todayDate.toISOString().split('T')[0];

//     // Define or redefine templateNotice here
//     templateNotice = `To: ${leaseObj.tenantName}\nAddress: ${leaseObj.address}\n\nNotice of Breach of Contract\n\nDate: ${today}\n\nTenancy at ${leaseObj.address}\n\nWe refer to the Lease Agreement between Microproperty Development Fund (Pty) Ltd and yourself dated ${leaseObj.statusDate.split("T")[0]}.\n\n{{Body}}\n\nDelivery of Notice by WhatsApp. Any notice delivered by text during normal business hours shall be deemed to have been received by the addressee on the date of delivery.\n\nFor enquiries, contact Bitprop on 021 701 7106 during office hours.\n\nYours,\nBitprop`;

//     $('#messagePreview').val(templateNotice);
//     $('#messageModal').data('index', index);
//     // Store leaseStr as a data attribute on the modal
//     $('#messageModal').data('leaseStr', leaseStr);

//     $('#messageModal').modal('show');

//     updateMessageBody90:

//     // Adjust these event handlers to pass templateNotice
//     $('#messageTemplateDropdown').off('change').change(updateMessageBody);
//     $('#customMessage').off('input').on('input', updateMessageBody);

// }

// // Event listener to reset the modal once it's closed
// $('#messageModal').on('hidden.bs.modal', function () {
//     // Reset the dropdown
//     $('#messageTemplateDropdown').val($('#messageTemplateDropdown option:first').val());
    
//     // Clear custom message input
//     $('#customMessage').val('');

//     // Optionally reset the message preview, you might want to set it to some default or instruction text
//     $('#messagePreview').val('Select a template or type a custom message.');

//     // Reset any other state or UI elements related to the modal
// });

// $(document).ready(function() {

//     // Dropdown change event
//     $('#messageTemplateDropdown').on('change', function() {
//         console.log('dropdown change');
//         const selectedValue = $(this).val();
//         // Check if the selected option is for the custom message
//         if(selectedValue === 'template3'){ // Assuming 'template3' is the key for the "Custom" option
//             $('#customMessageContainer').show();
//         } else {
//             $('#customMessageContainer').hide();
//         }

//         // Optionally, trigger an update to the message preview here
//     });
//     // // Initially hide the custom message container
//     // $('#customMessageContainer').hide();

//     // Populate dropdown
//     $('#messageTemplateDropdown').empty(); // Clear existing options first to avoid duplicates
//     $('#messageTemplateDropdown').append('<option value="">Please select</option>'); // Placeholder option

//     // Append templates to the dropdown
//     Object.entries(messageTemplates).forEach(([key, template]) => {
//         $('#messageTemplateDropdown').append($('<option>', {
//             value: key,
//             text: template.name // Assuming you want to show the name
//         }));
//     });

//     // Reset functionality when the modal is closed
//     $('#messageModal').on('hidden.bs.modal', function() {
//         $('#messageTemplateDropdown').val(''); // Reset the dropdown
//         $('#customMessage').val(''); // Clear the custom message
//         // $('#customMessageContainer').hide(); // Hide the custom message container
//         // Reset the message preview to default or clear it out
//     });
// });



// function finaliseAndSend() {
//     const index = $('#messageModal').data('index'); // Retrieve the stored index
//     const leaseStr = $('#messageModal').data('leaseStr');
//     const customMessage = $('#customMessage').val().trim();
//     const selectedTemplateBody = $('#messageTemplateDropdown').find(':selected').data('body');
//     console.log('selected template body:', selectedTemplateKey);
//     const messageToSend = customMessage.length > 0 ? customMessage : selectedTemplateBody;
//     // if (selec)
//     console.log('Message to send:', messageToSend);
//     $('#messageModal').modal('hide');
//     sendMessage(index, leaseStr, 'Notice', messageToSend); // Assuming you adjust sendMessage to accept additional parameters
// }



window.onload = populateRentalUnitsData;