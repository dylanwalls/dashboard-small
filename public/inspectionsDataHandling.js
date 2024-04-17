async function fetchInspectionsData() {
    const apiUrl = 'https://dashboard-function-app-1.azurewebsites.net/api/fetchInspections?code=spwafPEUL-G8j2VepZmogwJlWfjGE4IcjMHZuU8cFIAwAzFu2AfUEw==';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error('There was a problem fetching the inspections data.', e);
    }
}

async function populateInspectionsData() {
    const inspectionsData = await fetchInspectionsData();
    if (!inspectionsData) {
        console.error('No inspections data was returned from the API.');
        return;
    }
    console.log('Inspections data:',inspectionsData);
    // Populate the full list of leases
    const allInspectionsTableBody = document.getElementById('inspections-table-body');
    populateTable(allInspectionsTableBody, inspectionsData);

    // // Calculate the start of next month and then add three months to find the cutoff date
    // const today = new Date();
    // const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    // const threeMonthsFromNextMonth = new Date(startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 3));

    // // Filter leases to find those ending before or on the cutoff date
    // const leasesEndingSoonData = leasesData.filter(lease => {
    //     const rentEscalationDate = new Date(lease.rentEscalationDate);
    //     return rentEscalationDate <= threeMonthsFromNextMonth;
    // });

    // // Populate the "Leases Ending Soon" table
    // const leasesEndingSoonTableBody = document.getElementById('leases-ending-soon-body');
    // populateTable(leasesEndingSoonTableBody, leasesEndingSoonData);
}

// async function displayAllPages(pdfUrl, containerId) {
//     const container = document.getElementById(containerId);
//     container.innerHTML = ''; // Clear previous content if any

//     // Add a download link
//     const downloadLink = document.createElement('a');
//     downloadLink.href = pdfUrl;
//     downloadLink.textContent = 'Download PDF';
//     downloadLink.style.display = 'block'; // Ensures the link is on its own line
//     downloadLink.style.marginBottom = '10px';
//     container.appendChild(downloadLink);

//     const loadingTask = pdfjsLib.getDocument(pdfUrl);
//     try {
//         const pdf = await loadingTask.promise;

//         const scale = window.devicePixelRatio || 1; // Adjust scale based on device pixel ratio for clarity
//         for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//             const page = await pdf.getPage(pageNum);
//             const viewport = page.getViewport({scale: scale});
//             const canvas = document.createElement('canvas');
//             canvas.style.display = 'block';
//             canvas.style.marginBottom = '10px';

//             const context = canvas.getContext('2d');
//             canvas.height = viewport.height;
//             canvas.width = viewport.width;

//             // Adjust canvas size for the screen resolution
//             canvas.style.height = `${viewport.height / scale}px`;
//             canvas.style.width = `${viewport.width / scale}px`;

//             const renderContext = {
//                 canvasContext: context,
//                 viewport: viewport
//             };
//             await page.render(renderContext).promise;

//             container.appendChild(canvas);
//         }
//     } catch (error) {
//         console.error('Error loading PDF: ', error);
//     }
// }

async function displayPDFsInColumns(inspectionPdfUrl, maintenancePdfUrls, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous content if any
    container.style.display = 'flex'; // Use flexbox layout
    container.style.justifyContent = 'space-between'; // Space out the flex items

    // Create two divs for the two columns
    const inspectionColumn = document.createElement('div');
    const maintenanceColumn = document.createElement('div');
    maintenanceColumn.style.display = 'flex';
    maintenanceColumn.style.flexDirection = 'column'; // Stack maintenance PDFs vertically

    container.appendChild(inspectionColumn);
    container.appendChild(maintenanceColumn);

    // Function to load and display a single PDF
    async function loadAndDisplayPdf(pdfUrl, parentElement) {
        if (!pdfUrl) {
            // If there is no PDF URL, display a message instead of trying to load a PDF
            const noDataMessage = document.createElement('p');
            noDataMessage.textContent = 'Inspection not completed yet.';
            noDataMessage.style.marginBottom = '10px';
            parentElement.appendChild(noDataMessage);
        } else {
            // If there is a PDF URL, proceed with creating the download link and loading the PDF
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.textContent = 'Download PDF';
            downloadLink.style.display = 'block';
            downloadLink.style.marginBottom = '10px';
            parentElement.appendChild(downloadLink);
    
            // Continue with PDF loading and displaying logic here...
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            try {
                const pdf = await loadingTask.promise;
                const scale = window.devicePixelRatio || 1;
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: scale });
                    const canvas = document.createElement('canvas');
                    canvas.style.display = 'block';
                    canvas.style.marginBottom = '10px';
                    parentElement.appendChild(canvas);
    
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.style.height = `${viewport.height / scale}px`;
                    canvas.style.width = `${viewport.width / scale}px`;
    
                    const renderContext = { canvasContext: context, viewport: viewport };
                    await page.render(renderContext).promise;
                }
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        }
    }    

    // Display the inspection form PDF in the left column
    await loadAndDisplayPdf(inspectionPdfUrl, inspectionColumn);

    // Display each maintenance quotes PDF in the right column, stacked vertically
    for (const maintenancePdfUrl of maintenancePdfUrls) {
        await loadAndDisplayPdf(maintenancePdfUrl, maintenanceColumn);
    }
}


function populateTable(tableBody, inspections) {
    tableBody.innerHTML = ''; // Clear existing rows
    inspections.forEach((inspection, index) => {
        // Main row
        const row = tableBody.insertRow();
        // Construct the address string
        // const address = inspection.unitNo + ' ' + inspection.propertyAddress;
        
        // // Add the address to the lease object
        // inspection.address = address;
        // const leaseDataStr = encodeURIComponent(JSON.stringify(lease)); // Encode the lease object
        // // Calculate time difference in months
        // const today = new Date();
        // const rentEscalationDate = new Date(lease.rentEscalationDate);
        // const monthsAway = (rentEscalationDate.getFullYear() - today.getFullYear()) * 12 + rentEscalationDate.getMonth() - today.getMonth();
        
        // // Apply color-coding based on conditions
        // if (monthsAway <= 3) {
        //     if (!lease.escalationStatus) {
        //         row.classList.add('red-row');
        //     } else if (lease.escalationStatus === 'Notice sent' && !lease.tenantResponse) {
        //         row.classList.add('yellow-row');
        //     } else if (lease.escalationStatus === 'Confirmed' && lease.tenantResponse) {
        //         row.classList.add('green-row');
        //     }
        // }

        // Create a button element
        const inspectionFormButton = document.createElement('button');
        inspectionFormButton.textContent = 'Inspection Form';
        inspectionFormButton.onclick = function() {
            window.open(inspection.prefilled_inspection_form, '_blank');
        };

        // Add a cell to the row for the button
        const inspectionFormCell = row.insertCell();
        inspectionFormCell.appendChild(inspectionFormButton);

        // Create a button element
        const maintenanceFormButton = document.createElement('button');
        maintenanceFormButton.textContent = 'Maintenance Form';
        maintenanceFormButton.onclick = function() {
            window.open(inspection.prefilled_maintenance_quotes_form, '_blank');
        };

        // Add a cell to the row for the button
        const maintenanceFormCell = row.insertCell();
        maintenanceFormCell.appendChild(maintenanceFormButton);

        row.innerHTML = `
            <td>${inspection.id}</td>
            <td>${inspection.lease_id}</td>
            <td>${inspection.completed}</td>
            <td>${inspection.escalationDate}</td>   
            <td>${inspection.unitNo}</td>
            <td>${inspection.street}</td>
            <td>${inspection.tenantName}</td>
            <td>${inspection.tenantMobileNo}</td>
            <td></td>
            <td></td>
        `;

        // Insert the form button cell into the correct position in the row
        const inspectionButtonCell = row.cells[8]; // Assuming form_url is meant to be in the 5th column
        inspectionButtonCell.appendChild(inspectionFormButton);

        const maintenanceButtonCell = row.cells[9]; // Assuming form_url is meant to be in the 5th column
        maintenanceButtonCell.appendChild(maintenanceFormButton);

        // // Determine the class based on the deposit status
        // let depositStatusClass = '';
        // switch (lease.depositStatus) {
        //     case 'Paid':
        //         depositStatusClass = 'deposit-paid';
        //         break;
        //     case 'Overdue':
        //         depositStatusClass = 'deposit-overdue';
        //         break;
        //     case 'Partially Paid':
        //         depositStatusClass = 'deposit-partially-paid'; // If you have a default color or specific styling
        //         break;
        //     case 'Overpaid':
        //         depositStatusClass = 'deposit-overpaid';
        //         break;
        //     default:
        //         depositStatusClass = ''; // Default class
        //         break;
        // }
        // Detail row (initially hidden)
        const detailRow = tableBody.insertRow();
        detailRow.classList.add('detailRow');
        detailRow.style.display = 'none'; // Hide detail row by default

        // This ID must be unique for each detail row
        const detailContainerId = `pdf-container-${index}`;
        detailRow.innerHTML = `<td colspan="6"><div id="${detailContainerId}" style="width:100%;"></div></td>`;

        row.addEventListener('click', () => {
            const isHidden = detailRow.style.display === 'none';
            detailRow.style.display = isHidden ? '' : 'none'; // Toggle display
            if (isHidden && !detailRow.hasBeenLoaded) {
                const maintenancePdfUrls = inspection.submitted_maintenance_quotes_url
                    ? inspection.submitted_maintenance_quotes_url.split(',').filter(url => url.trim() !== '')
                    : [];
                displayPDFsInColumns(
                    inspection.submitted_inspection_form_url, 
                    maintenancePdfUrls, // Ensure this is always an array
                    detailContainerId
                );
                // displayAllPages(inspection.submitted_inspection_form_url, detailContainerId);
                detailRow.hasBeenLoaded = true; // Prevent reloading PDF on subsequent clicks
            }
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



window.onload = populateInspectionsData;