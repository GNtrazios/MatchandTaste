document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const InitialPageButtonsContainer = document.getElementById('InitialPage-buttons-container');
    const randomCocktailButton = document.getElementById('randomCocktailButton');
    const loadingOverlay = document.querySelector('.loading-overlay');
    let cocktails = [];

    // Fetch cocktail data
    fetch('OubiCocktails.json')
        .then(response => response.json())
        .then(data => {
            cocktails = data;
            const FirstQuestion = Object.keys(data[0])[1];
            const possibleAnswers = [...new Set(data.map(cocktail => cocktail[FirstQuestion]))];

            // Display the first question and create answer buttons
            questionElement.textContent = FirstQuestion;
            createAnswerButtons(possibleAnswers);
        })
        .catch(error => console.error('Error loading cocktails data:', error));

    // Create answer buttons
    function createAnswerButtons(answers) {
        const fragment = document.createDocumentFragment();

        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);

            // Use debounce to prevent multiple clicks
            answerButton.addEventListener('click', debounce(() => handleAnswerClick(answer), 300));

            fragment.appendChild(answerButton);
        });

        InitialPageButtonsContainer.appendChild(fragment);
    }

    // Handle answer click
    async function handleAnswerClick(selectedAnswer) {
        const question = questionElement.textContent;

        // Show the loading overlay
        loadingOverlay.style.visibility = 'visible';

        try {
            // Send the click data to the server asynchronously
            await fetch('/api/updateCounter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question, answer: selectedAnswer })
            });

            // Redirect to the second page with selected answer as query parameter
            window.location.href = `SecondPage.html?FirstQuestionAnswer=${selectedAnswer}`;
        } catch (error) {
            console.error('Error updating click count:', error);
        } finally {
            loadingOverlay.style.visibility = 'hidden';
        }
    }

    // Event listener for random cocktail button
    randomCocktailButton.addEventListener("click", () => {
        if (cocktails.length > 0) {
            const randomCocktail = cocktails[Math.floor(Math.random() * cocktails.length)];

            // Show the loading overlay
            loadingOverlay.style.visibility = 'visible';

            // Redirect to the result page with random cocktail name as query parameter
            window.location.href = `Result.html?name=${encodeURIComponent(randomCocktail.name)}`;
        } else {
            console.error('Cocktails data not loaded yet');
        }
    });
    
    // Check for specific 'user' URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');

    // Show the "Show Results" button only for specificuser
    if (userId === 'specialUser') {  // Replace 'specialUser' with the specific user identifier
        document.getElementById('specialButton').style.display = 'inline-block';
    }

    // Debounce function to prevent rapid multiple clicks
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});
