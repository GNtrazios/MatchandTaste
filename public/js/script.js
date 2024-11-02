document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const InitialPageButtonsContainer = document.getElementById('InitialPage-buttons-container');
    const randomCocktailButton = document.getElementById('randomCocktailButton');
    let cocktails = [];

    // Improved fetch with retry logic, logs errors to console
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

        fetchWithRetry('/api/updateCounter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, selectedAnswer })
        })
        .then(data => {
            console.log('Counter updated:', data.message);
            window.location.href = `SecondPage.html?FirstQuestionAnswer=${selectedAnswer}`;
        })
        .catch(error => console.error('Error updating counter:', error));
    }

    // Event listener for random cocktail button
    randomCocktailButton.addEventListener("click", () => {
        if (cocktails.length > 0) {
            const randomCocktail = cocktails[Math.floor(Math.random() * cocktails.length)];
            window.location.href = `Result.html?name=${encodeURIComponent(randomCocktail.name)}`;
        } else {
            console.error('Cocktails data not loaded yet');
        }
    });

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});
