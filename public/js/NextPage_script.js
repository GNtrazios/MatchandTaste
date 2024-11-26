document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const nextPageButtonsContainer = document.getElementById('NextPage-Question-buttons-container');
    const loadingOverlay = document.querySelector('.loading-overlay');

    const urlParams = new URLSearchParams(window.location.search);
    const currentQuestionIndex = parseInt([...urlParams.keys()][0], 10);
    const previousAnswer = urlParams.get(currentQuestionIndex);

    let cocktailData = [];

    // Fetch and process cocktail data
    fetch('OubiCocktails.json')
        .then(response => response.json())
        .then(data => {cocktailData = data;
                       handleCocktailData(cocktailData);
                })
        .catch(err => logError('Error loading cocktail data', err));

    // Handle cocktail data and set up the next question
    function handleCocktailData(data) {
        const filteredData = data.filter(item => {
            const values = Object.values(item);
            return values[currentQuestionIndex] === previousAnswer;
        });

        const nextQuestionKey = Object.keys(filteredData[0] || {})[currentQuestionIndex + 1];
        const possibleAnswers = [...new Set(filteredData.map(item => item[nextQuestionKey]))];
        questionElement.textContent = nextQuestionKey;
        populateAnswerButtons(possibleAnswers, nextQuestionKey);
    }

    // Populate answer buttons dynamically
    function populateAnswerButtons(answers, question) {
        nextPageButtonsContainer.innerHTML = ''; // Clear any existing buttons
        answers.filter(Boolean).forEach(answer => {
            const answerButton = createButton(answer, question);
            nextPageButtonsContainer.appendChild(answerButton);
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
            
            const NextfilteredData = cocktailData.filter(item => {
                const values = Object.values(item);
                return values[currentQuestionIndex + 1] === selectedAnswer;
            });

            const nextQuestionKey = Object.keys(NextfilteredData[0] || {})[currentQuestionIndex + 2];
            
            if (nextQuestionKey && nextQuestionKey !== 'description') {
                window.location.href = `NextPage.html?${encodeURIComponent(currentQuestionIndex + 1)}=${encodeURIComponent(selectedAnswer)}`;
            } else {
                window.location.href = `Result.html?name=${encodeURIComponent(NextfilteredData[0]?.name)}`;
            }

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
