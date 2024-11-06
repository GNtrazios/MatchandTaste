document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const InitialPageButtonsContainer = document.getElementById('InitialPage-buttons-container');
    const randomCocktailButton = document.getElementById('randomCocktailButton');
    const loadingOverlay = document.querySelector('.loading-overlay');
    let cocktails = [];

    // Fetch function with retry logic
    function fetchWithRetry(url, options = {}, retries = 3) {
        return fetch(url, options).then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        }).catch(error => {
            if (retries > 0) return fetchWithRetry(url, options, retries - 1);
            else {
                console.error('Error fetching data:', error);
                throw error;
            }
        });
    }

    // Fetch cocktail data
    fetchWithRetry('OubiCocktails.json')
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
    function handleAnswerClick(selectedAnswer) {
        const question = questionElement.textContent;

        // Show the loading overlay
        loadingOverlay.style.visibility = 'visible';
        /*
        fetchWithRetry('/api/updateCounter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, selectedAnswer })
        })
        then(() => {*/
            // Redirect to the second page with selected answer as query parameter
            window.location.href = `SecondPage.html?FirstQuestionAnswer=${selectedAnswer}`;
            loadingOverlay.style.visibility = 'hidden'; // Hide overlay on error
        /*})
        .catch(error => {
            console.error('Error updating counter:', error);
            loadingOverlay.style.visibility = 'hidden'; // Hide overlay on error
        });*/
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

    // Debounce function to prevent rapid multiple clicks
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});
