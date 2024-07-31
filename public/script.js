// Get references to the button
const flavorButtons = document.querySelectorAll('.FlavorButton');

// Add an event listener for the button click
flavorButtons.forEach(button => {
    button.addEventListener('click', (event) => {
    // Get the text content of the clicked button
    const flavor = event.target.textContent;

    // Send a request to get the list of cocktails
    fetch(`/get-cocktails?flavor=${encodeURIComponent(flavor)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if the query was successful
            if (data.message === 'Query successful') {
                if (data.data.length > 0) {
                    const drinkNames = data.data.map(drinkObj => drinkObj.drink);

                    // Construct the redirect URL with the drink name as a parameter
                    const redirectUrl = `/Drink.html?flavor=${encodeURIComponent(flavor)}&drinks=${encodeURIComponent(drinkNames)}`;
                    
                    // Redirect to the constructed URL
                    window.location.href = redirectUrl;                    
                } else {
                    connectionStatus.textContent = 'No cocktails found.';
                }
            } else {
                connectionStatus.textContent = data.message;
            }
        })
        .catch(error => {
            // Display an error message
            console.error('Connection check failed:', error);
            connectionStatus.textContent = 'Connection check failed: ' + error.message;
        });
    });
});
