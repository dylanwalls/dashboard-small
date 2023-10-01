// dataFetcher.js

const apiUrl = 'https://dashboard-function-app-1.azurewebsites.net/api/rentRoll?code=N--G6_gY23Znla-XYPXaZ18UqoLlQiA1ujeJcdyrUKupAzFushCcUg==';

async function fetchData(params = {}) {
    console.log('fetch data started');
    // Turn the params object into a URL search string
    const searchParams = new URLSearchParams(params);

    // Construct URL with parameters
    const url = `${apiUrl}?${searchParams.toString()}`;
    console.log(url);

    try {
        // Start the fetch request using the constructed URL
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include any other headers you need, like authorization headers
            },
        });

        // Check if the response is successful (status code 200-299)
        if (!response.ok) {
            // Throw an error if the response status is not ok
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response body as JSON
        const data = await response.json();
        console.log("Fetched Data:", data);
        return data;
    } catch (error) {
        // Handle errors, like network issues or invalid JSON
        console.error('Fetch error:', error);
        throw error;
    }
}
console.log('Data fetched');
// Export fetchData for use in other scripts
export { fetchData };

  