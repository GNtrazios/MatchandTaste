document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const nextQuestion2ButtonsContainer = document.getElementById('NextQuestion2-buttons-container');
    const boxElement = document.querySelector('.box');

    // Get the second field value from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let firstParam = [...urlParams.keys()][0]; // Get the first parameter key
    const previousAnswer = urlParams.get(firstParam);
    let result = parseInt(firstParam, 10);     // Convert the key to an integer

    // Function to create buttons for answers
    function createAnswerButtons(possibleAnswers) {
        // Clear existing buttons
        nextQuestion2ButtonsContainer.innerHTML = '';

        // Filter out any empty or null answers before creating buttons
        const validAnswers = possibleAnswers.filter(answer => answer); // Filters out falsy values (e.g., null, undefined, empty strings)

        validAnswers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);
            nextQuestion2ButtonsContainer.appendChild(answerButton);
        });
    }

    // Function to adjust the height of the box
    function adjustBoxHeight() {
        const numButtons = nextQuestion2ButtonsContainer.children.length;
        const baseHeight = 250; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }

    // Fetch data and process it
    fetch('OfficialData.json')
        .then(response => response.json())
        .then(data => {
            // Filter the data based on the second field
            const filteredData = data.filter(item => {
                const values = Object.values(item);  // Extract values of the object
                return values[result] === previousAnswer;
            });

            // Get the name of the next field            
            const nextFieldNameFiltered = Object.keys(filteredData[0] || {})[result + 1];
            
            const possibleAnswers = [...new Set(filteredData.map(item => item[nextFieldNameFiltered]))];

            // Update the question element
            if (previousAnswer) {
                questionElement.textContent = nextFieldNameFiltered;
                createAnswerButtons(possibleAnswers);
            } else {
                questionElement.textContent = `No third field available for "${previousAnswer}".`;
            }

            // Adjust the box height based on the number of buttons created
            adjustBoxHeight();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            questionElement.textContent = 'Failed to load data. Please try again later.';
        });

    // Event delegation for button clicks
    nextQuestion2ButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('answer-btn')) {
            const answer = event.target.getAttribute('data-answer');
            // Redirect to the next question page with the selected answer
            window.location.href = `NextPage2.html?${encodeURIComponent(result + 1)}=${encodeURIComponent(answer)}`;
        }
    });
});
