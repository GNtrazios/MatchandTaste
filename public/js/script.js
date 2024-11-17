document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const buttonsContainer = document.getElementById('InitialPage-buttons-container');
    const randomCocktailButton = document.getElementById('randomCocktailButton');
    const loadingOverlay = document.querySelector('.loading-overlay');
    let cocktails = [];

    // Fetch cocktail data
    fetch('OubiCocktails.json')
        .then(response => response.json())
        .then(data => {
            cocktails = data;
            const question = Object.keys(data[0])[1];
            const answers = [...new Set(data.map(c => c[question]))];

            // Set question and answers
            questionElement.textContent = question;
            createAnswerButtons(answers);
        })
        .catch(err => logError('Error loading cocktail data', err));

    function createAnswerButtons(answers) {
        buttonsContainer.innerHTML = answers.map(answer =>
            `<button class="answer-btn" data-answer="${answer}">${answer}</button>`
        ).join('');

        buttonsContainer.querySelectorAll('.answer-btn').forEach(btn =>
            btn.addEventListener('click', debounce(handleAnswerClick, 300))
        );
    }

    async function handleAnswerClick(e) {
        const selectedAnswer = e.target.getAttribute('data-answer');
        loadingOverlay.style.visibility = 'visible';

        try {
            await fetch('/api/updateCounter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionElement.textContent, answer: selectedAnswer })
            });

            window.location.href = `SecondPage.html?FirstQuestionAnswer=${selectedAnswer}`;
        } catch (err) {
            logError('Error updating click counter', err);
        } finally {
            loadingOverlay.style.visibility = 'hidden';
        }
    }

    randomCocktailButton.addEventListener("click", () => {
        if (cocktails.length) {
            const randomCocktail = cocktails[Math.floor(Math.random() * cocktails.length)];
            loadingOverlay.style.visibility = 'visible';
            window.location.href = `Result.html?name=${encodeURIComponent(randomCocktail.name)}`;
        }
    });

    const userId = new URLSearchParams(window.location.search).get('user');
    if (userId === 'specialUser') {
        document.getElementById('specialButton').style.display = 'inline-block';
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Logging helper for Vercel
    function logError(message, error) {
        console.log(`[Error] ${message}`, { error: error?.message || error });
    }
});
