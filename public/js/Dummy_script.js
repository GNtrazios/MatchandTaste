// Dummy_script.js

// Fetch the JSON file and display the second field name
fetch('data.json')
    .then(response => {
        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Parse the JSON data
        return response.json();
    })
    .then(data => {
        // Check if there are items in the data
        if (data.length > 0) {
            const secondField = Object.keys(data[0])[1]; // Get the second field name

            // Display the second field name in the HTML
            const fieldNamesDiv = document.getElementById('field-names');
            fieldNamesDiv.innerHTML = `${secondField}`;
        } else {
            const fieldNamesDiv = document.getElementById('field-names');
            fieldNamesDiv.innerHTML = 'No data available.';
        }
    })
    .catch(error => {
        // Handle errors here
        console.error('Error fetching JSON:', error);
        const fieldNamesDiv = document.getElementById('field-names');
        fieldNamesDiv.innerHTML = 'Error loading field names.';
    });
