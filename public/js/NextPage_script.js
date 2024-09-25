document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const NextQuestionButtonsContainer = document.getElementById('NextQuestion-buttons-container');
    const boxElement = document.querySelector('.box');

    // Get the first URL parameter key and its corresponding value
    const urlParams = new URLSearchParams(window.location.search);
    const firstParam = [...urlParams.keys()][0]; // Get the first parameter key
    const previousAnswer = urlParams.get(firstParam);
    const result = parseInt(firstParam, 10);     // Convert the key to an integer

    // Function to create buttons for answers
    function createAnswerButtons(possibleAnswers) {
        NextQuestionButtonsContainer.innerHTML = ''; // Clear existing buttons
        const validAnswers = possibleAnswers.filter(Boolean); // Filter out falsy values

        const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance
        validAnswers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);
            fragment.appendChild(answerButton);
        });
        NextQuestionButtonsContainer.appendChild(fragment);
    }

    // Function to adjust the height of the box
    function adjustBoxHeight() {
        const numButtons = NextQuestionButtonsContainer.children.length;
        const baseHeight = 250; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }

    // Function to fetch and process data
    function fetchAndProcessData() {
        fetch('OfficialData.json')
            .then(handleResponse)
            .then(data => processData(data))
            .catch(error => {
                console.error('Error fetching data:', error);
                questionElement.textContent = 'Failed to load data. Please try again later.';
            });
    }

    // Function to handle response
    function handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // Function to process the fetched data
    function processData(data) {
        const filteredData = data.filter(item => {
            const values = Object.values(item);
            return values[result] === previousAnswer;
        });

        const nextFieldNameFiltered = Object.keys(filteredData[0] || {})[result + 1];
        const possibleAnswers = [...new Set(filteredData.map(item => item[nextFieldNameFiltered]))];

        if (nextFieldNameFiltered) {
            if (previousAnswer) {
                questionElement.textContent = nextFieldNameFiltered || 'No valid question available.';
                createAnswerButtons(possibleAnswers);
            } else {
                questionElement.textContent = `No field available for "${previousAnswer}".`;
            }
        } else {           
            window.location.href = `Result.html?name=Cosmopolitan`;
        }

        adjustBoxHeight();
    }

    // Event delegation for button clicks
    NextQuestionButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('answer-btn')) {
            const answer = event.target.getAttribute('data-answer');
            window.location.href = `NextPage.html?${encodeURIComponent(result + 1)}=${encodeURIComponent(answer)}`;
        }
    });

    // Initial fetch and process data
    fetchAndProcessData();
});
