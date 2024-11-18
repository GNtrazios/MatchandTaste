document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const secondPageButtonsContainer = document.getElementById('SecondPage-Question-buttons-container');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const FirstQuestionAnswer = new URLSearchParams(window.location.search).get('FirstQuestionAnswer');

    // Fetch and process cocktail data
    fetch('OubiCocktails.json')
        .then(response => response.json())
        .then(data => handleCocktailData(data))
        .catch(err => logError('Error loading cocktail data', err));

    // Handle cocktail data and set up the next question
    function handleCocktailData(data) {
        const FirstQuestion = Object.keys(data[0])[1];
        const filteredData = data.filter(item => item[FirstQuestion] === FirstQuestionAnswer);
        const NextQuestion = Object.keys(filteredData[0] || {})[2];

        const possibleAnswers = [...new Set(filteredData.map(item => item[NextQuestion]))];
        questionElement.textContent = NextQuestion;
        populateAnswerButtons(possibleAnswers, NextQuestion);
    }

    // Populate answer buttons dynamically
    function populateAnswerButtons(answers, question) {
        secondPageButtonsContainer.innerHTML = ''; // Clear any existing buttons
        answers.forEach(answer => {
            const answerButton = createButton(answer, question);
            secondPageButtonsContainer.appendChild(answerButton);
        });
    }

    // Create an answer button with event listener
    function createButton(answer, question) {
        const button = document.createElement('button');
        button.textContent = answer;
        button.className = 'answer-btn';
        button.dataset.answer = answer;

        button.addEventListener('click', debounce(() => handleAnswerClick(question, answer), 300));
        return button;
    }

    // Handle button click and redirect to the next page
    async function handleAnswerClick(question, selectedAnswer) {
        toggleLoading(true);

        try {
            await fetch('/api/updateCounter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, answer: selectedAnswer })
            });

            window.location.href = `NextPage.html?2=${encodeURIComponent(selectedAnswer)}`;
        } catch (err) {
            logError('Error updating click counter', err);
        } finally {
            toggleLoading(false);
        }
    }

    // Show or hide the loading overlay
    function toggleLoading(show) {
        loadingOverlay.style.visibility = show ? 'visible' : 'hidden';
    }

    // Debounce function to limit rapid function execution
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    // Error logging function
    function logError(message, error) {
        console.error(`[Error] ${message}`, { error: error?.message || error });
    }
});
