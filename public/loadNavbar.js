document.addEventListener("DOMContentLoaded", function() {
    // Fetch and load the navbar HTML
    fetch('navbar.html')
        .then(response => response.text())
        .then(html => {
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            navbarPlaceholder.innerHTML = html;
            
            // After navbar is loaded, attach event handlers
            attachEventHandlers();
        })
        .catch(error => console.error('Error loading the navbar:', error));
});

function attachEventHandlers() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');

    // Use event delegation to handle clicks on dynamically loaded navbar
    navbarPlaceholder.addEventListener('click', function(event) {
        const target = event.target;

        if (target.id === 'rentRollDownload') {
            console.log('Downloading rent roll');
            rentRollDownloadSchedule();
        } else if (target.id === 'depositDownload') {
            console.log('Downloading deposit schedule');
            depositDownloadSchedule();
        } else if (target.id === 'depositUpdate') {
            console.log('Updating deposit interest and status');
            handleDepositUpdate();
        }
    });
}

async function handleDepositUpdate() {
    showNotification('Function is running...');
    try {
        await callAzureFunction();
        showNotification('Function completed successfully');
        setTimeout(() => hideNotification(), 3000);
        depositStatusCalc();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error occurred during function execution');
        setTimeout(() => hideNotification(), 3000);
    }
}
