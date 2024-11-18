document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const buttonsContainer = document.getElementById('InitialPage-buttons-container');
    const randomCocktailButton = document.getElementById('randomCocktailButton');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const specialButton = document.getElementById('specialButton');
    const userId = new URLSearchParams(window.location.search).get('user');
    let cocktails = [];

    // Initialize the page
    init();

    function init() {
        // Display special button for specific users
        if (userId === 'specialUser') {
            specialButton.style.display = 'inline-block';
        }

        // Fetch cocktail data and populate question and answers
        fetch('OubiCocktails.json')
            .then(response => response.json())
            .then(data => handleCocktailData(data))
            .catch(err => logError('Error loading cocktail data', err));
    }

    function handleCocktailData(data) {
        cocktails = data;
        const question = Object.keys(data[0])[1];
        const answers = [...new Set(data.map(c => c[question]))];

        questionElement.textContent = question;
        createAnswerButtons(answers);
    }

    // Create answer buttons dynamically
    function createAnswerButtons(answers) {
        buttonsContainer.innerHTML = ''; // Clear any existing buttons

        answers.forEach(answer => {
            const button = createButton(answer);
            buttonsContainer.appendChild(button);
        });
    }

    // Create a single answer button
    function createButton(answer) {
        const button = document.createElement('button');
        button.textContent = answer;
        button.className = 'answer-btn';
        button.dataset.answer = answer;

        button.addEventListener('click', debounce(handleAnswerClick, 300));
        return button;
    }

    // Handle answer button click
    async function handleAnswerClick(event) {
        const selectedAnswer = event.target.dataset.answer;
        toggleLoading(true);

        try {
            await fetch('/api/updateCounter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionElement.textContent, answer: selectedAnswer })
            });

            window.location.href = `SecondPage.html?FirstQuestionAnswer=${encodeURIComponent(selectedAnswer)}`;
        } catch (err) {
            logError('Error updating click counter', err);
        } finally {
            toggleLoading(false);
        }
    }

    // Handle random cocktail button click
    randomCocktailButton.addEventListener("click", () => {
        if (cocktails.length) {
            const randomCocktail = cocktails[Math.floor(Math.random() * cocktails.length)];
            redirectToResultPage(randomCocktail.name);
        }
    });

    // Redirect to the result page
    function redirectToResultPage(cocktailName) {
        toggleLoading(true);
        window.location.href = `Result.html?name=${encodeURIComponent(cocktailName)}`;
    }

    // Toggle loading overlay visibility
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

    // Logging helper
    function logError(message, error) {
        console.error(`[Error] ${message}`, { error: error?.message || error });
    }
});
