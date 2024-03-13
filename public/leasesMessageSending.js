const azureFunctionUrl = "https://dashboard-function-app-1.azurewebsites.net/api/sendWhatsappTemplate?code=HMT7Whg8vQmL9C_lOTjFZ0ILLhoLZORZXAd_myIXRdv1AzFuq4O4FQ==";


async function sendMessage(index, leaseStr, messageTypeId, additionalParams = []) {
    const leaseObj = JSON.parse(decodeURIComponent(leaseStr));
    let newRentAmountValue = null;
    let today;
    // Determine message type ID if not provided
    if (!messageTypeId) {
        messageTypeId = leaseObj.tenantResponse === 'Extended' ? "1MonthExtended" : "1MonthNoticeGiven";
    }

    const parameters = [
        { "key": "{{1}}", "value": leaseObj.tenantName },
        { "key": "{{2}}", "value": leaseObj.address }
    ];

    if (messageTypeId === '3MonthNotice') {
        const newRentAmountElement = document.getElementById(`newRentAmount-${index}`);
        if (!newRentAmountElement || !newRentAmountElement.value) {
            alert("Please enter the new rent amount.");
            return;
        }
        newRentAmountValue = newRentAmountElement.value;
        parameters.push({ "key": "{{3}}", "value": leaseObj.rentEscalationDate.split("T")[0] }, { "key": "{{4}}", "value": newRentAmountValue });
    }

    if (messageTypeId === '1MonthExtended') {
        const newRentAmountElement = document.getElementById(`newRentAmount-${index}`);
        if (!newRentAmountElement || !newRentAmountElement.value) {
            alert("Please enter the new rent amount.");
            return;
        }
        newRentAmountValue = newRentAmountElement.value;
        parameters.push({ "key": "{{3}}", "value": newRentAmountValue }, { "key": "{{4}}", "value": leaseObj.totalDeposit}, { "key": "{{5}}", "value": leaseObj.depositAmount}, { "key": "{{6}}", "value": leaseObj.interestAmount});
    }

    if (messageTypeId === '1MonthNoticeGiven') {
        const newRentAmountElement = document.getElementById(`newRentAmount-${index}`);
        if (!newRentAmountElement || !newRentAmountElement.value) {
            alert("Please enter the new rent amount.");
            return;
        }
        newRentAmountValue = newRentAmountElement.value;
        parameters.push({ "key": "{{3}}", "value": leaseObj.rentEscalationDate.split("T")[0] }, { "key": "{{4}}", "value": leaseObj.totalDeposit}, { "key": "{{5}}", "value": leaseObj.depositAmount}, { "key": "{{6}}", "value": leaseObj.interestAmount});
    }

    if (messageTypeId === 'Notice') {
        console.log('Additional parameters',additionalParams);
        // const noticeBody = 'Test body.';
        const todayDate = new Date();
        const today = todayDate.toISOString().split('T')[0];
        parameters.push({ "key": "{{3}}", "value": today }, { "key": "{{4}}", "value": leaseObj.address}, { "key": "{{5}}", "value": leaseObj.statusDate.split("T")[0]}, { "key": "{{6}}", "value": additionalParams});

        // parameters.push({ "key": "{{3}}", "value": today }, { "key": "{{4}}", "value": leaseObj.address}, { "key": "{{5}}", "value": leaseObj.statusDate.split("T")[0]}, { "key": "{{6}}", "value": noticeBody});
    }

    // Handle specific message types that require additional parameters
    console.log('Message type id:', messageTypeId);
    
    // Construct the payload
    const payload = {
        "recipients": [{ "phone": leaseObj.tenantMobileNo, "hsm_id": getHsmId(messageTypeId), "parameters": parameters }]
    };

    console.log('Payload:', payload);

    try {
        const response = await fetch(azureFunctionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert("Message sent successfully.");
            updateLeaseStatus(leaseObj.leaseId, getStatusFromTypeId(messageTypeId), newRentAmountValue);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (e) {
        console.error('There was a problem sending the message.', e);
        alert("Failed to send message.");
    }
}


function getHsmId(messageTypeId) {
    switch (messageTypeId) {
        case '3MonthNotice': return "158515";
        case '1MonthExtended': return "161125";
        case '1MonthNoticeGiven': return "161126";
        case 'Notice': return "161297";
        // Add more cases as needed
        default: return ""; // Default HSM ID or throw an error
    }
}

function getStatusFromTypeId(messageTypeId) {
    switch (messageTypeId) {
        case '3MonthNotice': return "Notice sent";
        case '1MonthExtended': return "1-month notice sent - lease extending";
        case '1MonthNoticeGiven': return "1-month notice sent - lease ending";
        case 'Notice': return "7 Day Notice Sent";
        // Add more cases as needed
        default: return ""; // Default status or throw an error
    }
}

const messageTemplates = {
    template1: {
        name: "7 Day Notice",
        text: "Template 1 Text newnew"
    },
    template2: {
        name: "48 Hour Notice",
        text: "Template 2 Text"
    },
    template3: {
        name: "Custom",
        text: ""
    }
    // Add more templates as needed
};

const dropdown = document.getElementById("messageTemplateDropdown");
Object.entries(messageTemplates).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = value; // Or use key for a more descriptive text
    dropdown.appendChild(option);
});





// async function send3MonthNotice(index, leaseStr) {
//     const leaseObj = JSON.parse(decodeURIComponent(leaseStr));
//     const newRentAmount = document.getElementById(`newRentAmount-${index}`).value;
//     if (!newRentAmount) {
//         alert("Please enter the new rent amount.");
//         return;
//     }
//     const rentEscalationDateString = leaseObj.rentEscalationDate.split("T")[0];
//     // Construct the payload as before
//     const payload = {
//         "recipients": [
//             {
//                 "phone": leaseObj.tenantMobileNo,
//                 "hsm_id": "158515",
//                 "parameters": [
//                     {
//                         "key": "{{1}}",
//                         "value": leaseObj.tenantName
//                     },
//                     {
//                         "key": "{{2}}",
//                         "value": leaseObj.address
//                     },
//                     {
//                         "key": "{{3}}",
//                         "value": rentEscalationDateString
//                     },
//                     {
//                         "key": "{{4}}",
//                         "value": newRentAmount
//                     }
//                 ]
//             }
//         ]
//     }
//     console.log('Payload:', payload);

//     const azureFunctionUrl = "https://dashboard-function-app-1.azurewebsites.net/api/sendWhatsappTemplate?code=HMT7Whg8vQmL9C_lOTjFZ0ILLhoLZORZXAd_myIXRdv1AzFuq4O4FQ=="; // Replace with your Azure function URL

//     try {
//         const response = await fetch(azureFunctionUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload),
//         });

//         if (response.ok) {
//             // // WhatsApp message sent successfully, now call the server to send an email
//             // const emailPayload = {
//             //     leaseId: leaseObj.leaseId,
//             //     newRentAmount: newRentAmount,
//             //     tenantEmail: leaseObj.tenantEmail,
//             //     tenantName: leaseObj.tenantName,
//             //     unitNo: leaseObj.unitNo,
//             //     rentEscalationDate: leaseObj.rentEscalationDate
//             // };
//             // await sendRentEscalationEmail(emailPayload); // This function would be an AJAX call to your server endpoint
//             alert("Notice sent successfully.");
//             const leaseStatus = 'Notice sent';
//             console.log('newRentAmount', newRentAmount);
//             updateLeaseStatus( leaseObj.leaseId, leaseStatus, newRentAmount );
//         } else {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//     } catch (e) {
//         console.error('There was a problem sending the lease notice.', e);
//         alert("Failed to send notice.");
//     }
// }


// async function send1MonthNotification(index, leaseStr) {
//     const leaseObj = JSON.parse(decodeURIComponent(leaseStr));
//     const rentEscalationDateString = leaseObj.rentEscalationDate.split("T")[0];
//     if (leaseObj.tenantResponse === 'Extended') {

//         // Construct the payload as before
//         const payload = {
//             "recipients": [
//                 {
//                     "phone": leaseObj.tenantMobileNo,
//                     "hsm_id": "161125",
//                     "parameters": [
//                         {
//                             "key": "{{1}}",
//                             "value": leaseObj.tenantName
//                         },
//                         {
//                             "key": "{{2}}",
//                             "value": leaseObj.address
//                         },
//                         {
//                             "key": "{{3}}",
//                             "value": leaseObj.newRent
//                         },
//                         {
//                             "key": "{{4}}",
//                             "value": leaseObj.totalDeposit
//                         },
//                         {
//                             "key": "{{5}}",
//                             "value": leaseObj.depositAmount
//                         },
//                         {
//                             "key": "{{6}}",
//                             "value": leaseObj.interestAmount
//                         }
//                     ]
//                 }
//             ]
//         }
//         console.log('Payload:', payload);

//         const azureFunctionUrl = "https://dashboard-function-app-1.azurewebsites.net/api/sendWhatsappTemplate?code=HMT7Whg8vQmL9C_lOTjFZ0ILLhoLZORZXAd_myIXRdv1AzFuq4O4FQ=="; // Replace with your Azure function URL

//         try {
//             const response = await fetch(azureFunctionUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(payload),
//             });

//             if (response.ok) {
//                 // // WhatsApp message sent successfully, now call the server to send an email
//                 // const emailPayload = {
//                 //     leaseId: leaseObj.leaseId,
//                 //     newRentAmount: newRentAmount,
//                 //     tenantEmail: leaseObj.tenantEmail,
//                 //     tenantName: leaseObj.tenantName,
//                 //     unitNo: leaseObj.unitNo,
//                 //     rentEscalationDate: leaseObj.rentEscalationDate
//                 // };
//                 // await sendRentEscalationEmail(emailPayload); // This function would be an AJAX call to your server endpoint
//                 alert("Notice sent successfully.");
//                 const leaseStatus = '1-month notice sent - lease extending';
//                 updateLeaseStatus( leaseObj.leaseId, leaseStatus );
//             } else {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//         } catch (e) {
//             console.error('There was a problem sending the lease notice.', e);
//             alert("Failed to send notice.");
//         }
//     } else if (leaseObj.tenantResponse === 'NoticeGiven') {

//         const rentEscalationDateString = leaseObj.rentEscalationDate.split("T")[0];
//         // Construct the payload as before
//         const payload = {
//             "recipients": [
//                 {
//                     "phone": leaseObj.tenantMobileNo,
//                     "hsm_id": "161126",
//                     "parameters": [
//                         {
//                             "key": "{{1}}",
//                             "value": leaseObj.tenantName
//                         },
//                         {
//                             "key": "{{2}}",
//                             "value": leaseObj.address
//                         },
//                         {
//                             "key": "{{3}}",
//                             "value": rentEscalationDateString
//                         },
//                         {
//                             "key": "{{4}}",
//                             "value": leaseObj.totalDeposit
//                         },
//                         {
//                             "key": "{{5}}",
//                             "value": leaseObj.depositAmount
//                         },
//                         {
//                             "key": "{{6}}",
//                             "value": leaseObj.interestAmount
//                         }
//                     ]
//                 }
//             ]
//         }
//         console.log('Payload:', payload);

//         const azureFunctionUrl = "https://dashboard-function-app-1.azurewebsites.net/api/sendWhatsappTemplate?code=HMT7Whg8vQmL9C_lOTjFZ0ILLhoLZORZXAd_myIXRdv1AzFuq4O4FQ=="; // Replace with your Azure function URL

//         try {
//             const response = await fetch(azureFunctionUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(payload),
//             });

//             if (response.ok) {
//                 // // WhatsApp message sent successfully, now call the server to send an email
//                 // const emailPayload = {
//                 //     leaseId: leaseObj.leaseId,
//                 //     newRentAmount: newRentAmount,
//                 //     tenantEmail: leaseObj.tenantEmail,
//                 //     tenantName: leaseObj.tenantName,
//                 //     unitNo: leaseObj.unitNo,
//                 //     rentEscalationDate: leaseObj.rentEscalationDate
//                 // };
//                 // await sendRentEscalationEmail(emailPayload); // This function would be an AJAX call to your server endpoint
//                 alert("Notice sent successfully.");
//                 const leaseStatus = '1-month notice sent - lease ending';
//                 updateLeaseStatus( leaseObj.leaseId, leaseStatus );
//             } else {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//         } catch (e) {
//             console.error('There was a problem sending the lease notice.', e);
//             alert("Failed to send notice.");
//         }
//     }
    
// }

// // // Example AJAX call to your server endpoint to send the rent escalation email
// // async function sendRentEscalationEmail(emailPayload) {
// //     const serverEndpointUrl = "https://your-server-endpoint.com/sendRentEscalationEmail"; // Replace with your actual server endpoint
// //     try {
// //         const response = await fetch(serverEndpointUrl, {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify(emailPayload),
// //         });

// //         if (!response.ok) {
// //             throw new Error(`HTTP error! status: ${response.status}`);
// //         }
// //         console.log("Email sent successfully.");
// //     } catch (e) {
// //         console.error('There was a problem sending the rent escalation email.', e);
// //     }
// // }