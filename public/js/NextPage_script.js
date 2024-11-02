document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const NextPageButtonsContainer = document.getElementById('NextPage-Question-buttons-container');
    const boxElement = document.querySelector('.box');

    // Get the first URL parameter key and its corresponding value
    const urlParams = new URLSearchParams(window.location.search);
    const firstParam = [...urlParams.keys()][0]; // Get the first parameter key
    const previousAnswer = urlParams.get(firstParam);
    const result = parseInt(firstParam, 10);     // Convert the key to an integer
    
    fetch('OubiCocktails.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })   
        .then(data => { 
            const filteredData = data.filter(item => {
                const values = Object.values(item);
                return values[result] === previousAnswer;
            });

            const NextQuestion = Object.keys(filteredData[0] || {})[result + 1];

            if (NextQuestion && NextQuestion !== 'description') {
                const possibleAnswers = [...new Set(filteredData.map(item => item[NextQuestion]))];

                if (previousAnswer) {
                    questionElement.textContent = NextQuestion;
                    createAnswerButtons(possibleAnswers, NextQuestion);
                    //adjustBoxHeight();
                } else {
                    questionElement.textContent = `No next field available.`;
                }
            } else {
                window.location.href = `Result.html?name=${encodeURIComponent(filteredData[0].name)}`;
            }
        })
        .catch(error => console.error('Error fetching data:', error));
    
    function createAnswerButtons(possibleAnswers, question) {
        NextPageButtonsContainer.innerHTML = ''; // Clear existing buttons
        const validAnswers = possibleAnswers.filter(Boolean); // Filter out falsy values

        const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance
        validAnswers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);
            
            answerButton.addEventListener('click', () => {
                const selectedAnswer = answerButton.getAttribute('data-answer');

                // Send a POST request to update the counter on GitHub
                fetch('/api/updateCounter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question, selectedAnswer }) // Send the question and answer to increment its counter
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message); // Log success message
                    // Redirect to the next page with selected answer in URL
                    window.location.href = `NextPage.html?${encodeURIComponent(result + 1)}=${encodeURIComponent(selectedAnswer)}`;
                })
                .catch(error => console.error('Error sending data:', error));
            });

            fragment.appendChild(answerButton);
        });

        NextPageButtonsContainer.appendChild(fragment);
    }

    /* Optional: Adjust box height based on number of buttons
    function adjustBoxHeight() {
        const numButtons = NextPageButtonsContainer.children.length;
        const baseHeight = 250; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
    */
});
