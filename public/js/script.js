document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const InitialPageButtonsContainer = document.getElementById('InitialPage-buttons-container');
    const boxElement = document.querySelector('.box');
    const randomCocktailButton = document.getElementById('randomCocktailButton');
    let cocktails = []; // To store the JSON data after fetching

    // Fetch the cocktail data
    fetch('OubiCocktails.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            cocktails = data; // Store data for later use by the random button
            const FirstQuestion = Object.keys(data[0])[1];
            const possibleAnswers = [...new Set(data.map(cocktail => cocktail[FirstQuestion]))];
            
            // Display the first question and create answer buttons
            questionElement.textContent = FirstQuestion;
            createAnswerButtons(possibleAnswers);
            // updateBoxHeight(); // Optional: uncomment if dynamic height is needed
        })
        .catch(error => console.error('Error fetching data:', error));

    // Function to create answer buttons
    function createAnswerButtons(answers) {
        const fragment = document.createDocumentFragment();

        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);

            // Redirect to the second page with selected answer in URL
            answerButton.addEventListener('click', () => {
                const selectedAnswer = answerButton.getAttribute('data-answer');
                const question = questionElement.textContent;

                // Send a POST request to update the counter on GitHub
                fetch('/api/updateCounter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question }) // Send the question to increment its counter
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message); // Log success message
                    // Redirect to the second page with selected answer in URL
                    window.location.href = `SecondPage.html?FirstQuestionAnswer=${selectedAnswer}`;
                })
                .catch(error => console.error('Error sending data:', error));
            });

            fragment.appendChild(answerButton);
        });

        InitialPageButtonsContainer.appendChild(fragment);
    }

    // Event listener for the random cocktail button
    randomCocktailButton.addEventListener("click", () => {
        if (cocktails.length > 0) {
            // Select a random cocktail from the data
            const randomCocktail = cocktails[Math.floor(Math.random() * cocktails.length)];
            window.location.href = `Result.html?name=${encodeURIComponent(randomCocktail.name)}`;
        } else {
            console.error('Cocktail data not loaded');
        }
    });

    /* Optional: Function to dynamically update box height based on number of buttons
    function updateBoxHeight() {
        const numButtons = InitialPageButtonsContainer.children.length;
        const baseHeight = 150; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
    */
});
