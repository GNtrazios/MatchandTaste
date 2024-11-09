document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#resultsTable tbody');
    
    // Function to fetch data from the backend API
    async function fetchData() {
        try {
            const response = await fetch('/api/getCounterData');  // Make sure this points to your API
            if (response.ok) {
                const data = await response.json();
                populateTable(data);
            } else {
                console.error('Error fetching data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to populate the table with data
    function populateTable(data) {
        tableBody.innerHTML = ''; // Clear any previous rows

        // Loop through the data and create rows for each record
        data.forEach(row => {
            const tr = document.createElement('tr');

            const tdQuestion = document.createElement('td');
            tdQuestion.textContent = row.question;
            tr.appendChild(tdQuestion);

            const tdAnswer = document.createElement('td');
            tdAnswer.textContent = row.answer;
            tr.appendChild(tdAnswer);

            const tdCount = document.createElement('td');
            tdCount.textContent = row.count;
            tr.appendChild(tdCount);

            // Append the row to the table body
            tableBody.appendChild(tr);
        });
    }

    // Fetch and display the data when the page loads
    fetchData();
});
