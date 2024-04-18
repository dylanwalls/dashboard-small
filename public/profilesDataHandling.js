async function fetchProfilesData() {
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
        console.error('There was a problem fetching the profiles data.', e);
    }
}

async function populateProfilesData() {
    const profilesData = await fetchProfilesData();
    console.log('Fetched profiles data:', profilesData);

    if (profilesData && profilesData.length > 0) {
        // First, sort profilesData by the date in descending order to ensure the latest profile is first.
        // Assuming the date field is 'dateSubmitted' for demonstration.
        profilesData.sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted));

        // Then, use reduce to filter out duplicates based on IdNumber, keeping the first occurrence (the most recent one due to sorting).
        const filteredProfiles = profilesData.reduce((acc, current) => {
            const x = acc.find(item => item.IdNumber === current.IdNumber);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        // Now, filteredProfiles contains only the most recent profiles without duplicates based on IdNumber.
        // Populate the full list of recent profiles
        const allProfilesTableBody = document.getElementById('profiles-table-body');
        populateTable(allProfilesTableBody, filteredProfiles);

    } else {
        console.error('No profiles data was returned from the API or the data is empty.');
        // Handle the empty data case appropriately here.
    }

    // // Populate the "Leases Ending Soon" table
    // const leasesEndingSoonTableBody = document.getElementById('leases-ending-soon-body');
    // populateTable(leasesEndingSoonTableBody, leasesEndingSoonData);
}

async function populateTable(tableBody, profiles) {
    tableBody.innerHTML = ''; // Clear existing rows

    const rentalUnitsData = await fetchRentalUnitsData();
    const unoccupiedUnits = rentalUnitsData.filter(unit => unit.occupied);
    const allAssociations = await fetchAssociationsForProfile();

    // Sort profiles by date from most recent to oldest
    profiles.sort((a, b) => new Date(b.date) - new Date(a.date));

    profiles.forEach((profile) => {
        // Profile row
        const row = tableBody.insertRow();

        // Find active associations for the current profile
        const activeAssoc = allAssociations.find(assoc => assoc.ProfileID === profile.ID && assoc.Status === 'Active');

        let unitCellContent;
        let rentContent = '';
        if (activeAssoc) {
            // If there's an active association, find the associated unit and display its reference
            const associatedUnit = rentalUnitsData.find(unit => unit.unit_id === activeAssoc.RentalUnitID);
            unitCellContent = associatedUnit ? associatedUnit.unit_ref : 'Unknown Unit';
            rentContent = associatedUnit ? associatedUnit.rent : '';
        } else {
            // If no active association, display the dropdown to select a unit
            unitCellContent = `
                <select id="unit-dropdown-${profile.ID}">
                    <option value="">Select a unit</option>
                    ${unoccupiedUnits.map(unit => `<option value="${unit.unit_id}">${unit.unit_ref}</option>`).join('')}
                </select>
                <button id="assign-btn-${profile.ID}" style="display: none;">Assign</button>
            `;
        }
        row.innerHTML = `
            <td>${profile.ID}</td>
            <td>${profile.date}</td>
            <td>${profile.FullName}</td>
            <td>${profile.IdNumber}</td>
            <td>${profile.PrimaryContactNumber}</td>
            <td>${profile.EmailAddress}</td>
            <td>${profile.TenantAddress}</td>
            <td>${unitCellContent}</td>
            <td>${rentContent}</td>
        `;

        // Event handlers for dropdown and button, if they exist
        if (!activeAssoc) {
            const dropdown = document.getElementById(`unit-dropdown-${profile.ID}`);
            const assignButton = document.getElementById(`assign-btn-${profile.ID}`);

            dropdown.addEventListener('change', function() {
                assignButton.style.display = this.value ? 'inline-block' : 'none';
            });

            assignButton.addEventListener('click', async () => {
                const selectedUnitId = parseInt(dropdown.value, 10);
                if (selectedUnitId) {
                    showLeaseStartDateModal(profile, selectedUnitId);
                }
            });
        }

        // Association rows below the profile row
        const associations = allAssociations.filter(assoc => assoc.ProfileID === profile.ID);
        associations.forEach(assoc => {
            const associationRow = tableBody.insertRow();
            associationRow.style.display = 'none'; // Initially hidden
            const unitInfo = rentalUnitsData.find(unit => unit.unit_id === assoc.RentalUnitID);
            const unitRef = unitInfo ? unitInfo.unit_ref : 'Unknown Unit';

            let assocRowInnerHTML = `
                <td colspan="7">
                    <div class="association-detail-flex">
                        <div class="block block-left">
                            <span><strong>Unit:</strong> ${unitRef}</span>
                            <span><strong>Date Assigned:</strong> ${assoc.AssignedDate}</span>
                            <span><strong>Lease:</strong> <a href="${assoc.Lease || '#'}" target="_blank">Link</a></span>
                            <span><strong>Signed:</strong> ${assoc.Signed ? 'Yes' : 'No'}</span>
                            ${assoc.Signed ? (assoc.LeaseSigned ? `<span><a href="${assoc.LeaseSigned}" target="_blank">View Signed Lease</a></span>` : '') : `<button onclick="sendLeaseForSigning('${profile.FullName}', '${profile.PrimaryContactNumber}', '${assoc.Lease}', '${assoc.AssociationID}')">Send Lease for Signing</button>`}
                            </div>
                        <div class="block block-middle">
                            ${assoc.Signed ? `
                            <div class="unique-ref-input">
                                <input type="text" placeholder="Enter unique_ref" id="uniqueRef-${assoc.AssociationID}" />
                                <button onclick="addUniqueRef(${assoc.AssociationID})">Update Unique Reference</button>
                            </div>
                            <span><strong>Unique Reference:</strong> ${assoc.UniqueRef}</span>
                            <div>
                                <button onclick="sendPaymentDetails('${profile.FullName}', '${profile.PrimaryContactNumber.replace(/^0/, "27")}', '${unitRef}', '${assoc.LeaseSigned}', '${assoc.UniqueRef}', '${assoc.AssociationID}')">Send Payment Details</button>
                            </div>` : ''}
                        </div>
                        <div class="block block-right">
                            <!-- Reserved for future content -->
                        </div>
                    </div>
                    <div class="message-field" id="message-${assoc.AssociationID}" style="padding: 10px;"></div>
                </td>
            `;
            associationRow.innerHTML = assocRowInnerHTML;

            row.addEventListener('click', () => {
                associationRow.style.display = associationRow.style.display === 'none' ? '' : 'none';
            });
        });
    });
}



async function sendLeaseForSigning(FullName, PrimaryContactNumber, Lease, AssociationID) {
    // Check if the phone number starts with '0' and is 10 digits long
    if (PrimaryContactNumber.startsWith('0') && PrimaryContactNumber.length === 10) {
        PrimaryContactNumber = '27' + PrimaryContactNumber.substring(1);
    }

    // Construct the message data
    const messageData = {
        recipients: [
            {
                phone: PrimaryContactNumber,
                hsm_id: "163210",
                parameters: [
                    { key: "{{1}}", value: FullName },
                    { key: "{{2}}", value: Lease }
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
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    })
    .then(data => {
        console.log('Message sent successfully:', data);
        document.getElementById(`message-${AssociationID}`).innerText = 'Message sent successfully';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById(`message-${AssociationID}`).innerText = 'Error sending message: ' + error.message;
    });
}

async function sendPaymentDetails(FullName, PrimaryContactNumber, address, LeaseSigned, uniqueRef, AssociationID) {

    // Construct the message data
    const messageData = {
        recipients: [
            {
                phone: PrimaryContactNumber,
                hsm_id: "163265",
                parameters: [
                    { key: "{{1}}", value: FullName },
                    { key: "{{2}}", value: address },
                    { key: "{{3}}", value: LeaseSigned },
                    { key: "{{4}}", value: uniqueRef },
                    { key: "{{5}}", value: uniqueRef }
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
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    })
    .then(data => {
        console.log('Payment details sent successfully:', data);
        document.getElementById(`message-${AssociationID}`).innerText = 'Payment details sent successfully';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById(`responseMessage-${AssociationID}`).innerText = 'Error sending message: ' + error.message;
    });
}





async function fetchAssociationsForProfile() {
    const apiUrl = `https://maintenance-node.azurewebsites.net/api/fetchProfileRentalUnitAssociations?code=EXExmpAZZcjExM9RKcw4SWXhk6gXSM8Te2QOURIuuYYAAzFuIfsN-g==`; // Adjust API endpoint as needed
    try {
        const response = await fetch(apiUrl, {
            method: 'POST', // Using POST to send data in the body
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json(); // Assuming the response is JSON
    } catch (error) {
        console.error('There was a problem fetching the associations data:', error);
        return []; // Return an empty array in case of error
    }
}




async function fetchRentalUnitsData() {
    const apiUrl = 'https://maintenance-node.azurewebsites.net/api/fetchRentalUnits?code=gB2oE5zLkc7dGeHrKyC_oNN-EUT46W6l3rW_f6DpBeyBAzFu1qkvsQ==';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Add any other headers required by your API, such as authorization headers.
            },
        });
        if (!response.ok) {
            // If the server response was not ok, throw an error with the status
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON from the response
        return data; // Return the parsed data
    } catch (e) {
        console.error('There was a problem fetching the rental units data:', e);
    }
}

// When the user clicks the button, open the modal 
function showLeaseStartDateModal(profile, unitId) {
    const modal = document.getElementById("leaseStartDateModal");
    const span = document.getElementsByClassName("close")[0];
    const confirmButton = document.getElementById("confirmLeaseStartDate");

    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Handle confirmation
    confirmButton.onclick = function() {
        const leaseStartDate = document.getElementById("leaseStartDateInput").value;
        if (!leaseStartDate) {
            alert("Lease Start Date is required.");
            return;
        }
        assignProfileToUnit(profile, unitId, leaseStartDate);
        modal.style.display = "none";
    }
}




async function assignProfileToUnit(profile, unitId, leaseStartDate) {
    console.log('profile', profile);
    const allUnitsData = await fetchRentalUnitsData();
    const thisUnitData = allUnitsData.filter(unit => unit.unit_id === unitId)[0];
    console.log('this unit data', thisUnitData);
    const flat = thisUnitData.unit_ref;
    const address = thisUnitData.street + ', ' + thisUnitData.suburb;
    const rentAmount = thisUnitData.rent;
    const depositAmount = thisUnitData.deposit_due;
    const apiUrl = 'https://maintenance-node.azurewebsites.net/api/insertProfileRUAssociation?code=SDnQBtfJO4sMEDFlKmXnBTHNBSSRuQlIUKxCLlIdsLNgAzFunr3Alw==';
    const leaseUrl = createLeaseUrl(profile.FullName, profile.IdNumber, profile.PrimaryContactNumber, profile.EmailAddress, flat, address, leaseStartDate, rentAmount, depositAmount)
    console.log('leaseurl', leaseUrl);
    const data = {
        profileId: profile.ID,
        rentalUnitId: unitId,
        Lease: leaseUrl,
        leaseStartDate: leaseStartDate // Assuming the backend can handle this new field
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to assign profile to unit.');
        }

        alert('Profile successfully assigned to the unit with start date.');
        location.reload(); // Refresh the page or dynamically update the UI to reflect the new assignment
    } catch (error) {
        console.error('Error assigning profile to unit:', error);
        alert('Failed to assign profile to the unit. Please try again.');
    }
}

function addUniqueRef(associationId) {
    const uniqueRefValue = document.getElementById(`uniqueRef-${associationId}`).value;
    if (!uniqueRefValue) {
        alert("Please enter a value for unique_ref.");
        return;
    }
    
    // Perform your action here, such as making an API call to update the backend
    console.log(`Adding unique_ref: ${uniqueRefValue} for associationId: ${associationId}`);
    
    // Example of an API call (you'll need to replace this with your actual API call)
    fetch('https://maintenance-node.azurewebsites.net/api/updateAssociationUniqueRef?code=80XstzYca8OcRYPGpIm1BPjbo8cBVlBiMZ5t1Y59B71KAzFuKlfAFg==', {
        method: 'POST', // Or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            associationId: associationId,
            uniqueRef: uniqueRefValue,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Unique ref added successfully.');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error adding unique ref. Please try again.');
    });
}


function createLeaseUrl(tenantFullName, tenantIdNumber, tenantContactNumber, tenantEmailAddress, flat, address, startDate, rentAmount, depositAmount) {
    return `https://jotform.com/240872093399568?&tenantFullName=${encodeURIComponent(tenantFullName)}&tenantIdNumber=${encodeURIComponent(tenantIdNumber)}&tenantContactNumber=${encodeURIComponent(tenantContactNumber)}&tenantEmailAddress=${encodeURIComponent(tenantEmailAddress)}&Flat=${encodeURIComponent(flat)}&address=${encodeURIComponent(address)}&startDate=${encodeURIComponent(startDate)}&rentAmount=${encodeURIComponent(rentAmount)}&depositAmount=${encodeURIComponent(depositAmount)}`;
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



window.onload = populateProfilesData;