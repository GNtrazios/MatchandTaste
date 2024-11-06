document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const secondPageButtonsContainer = document.getElementById('SecondPage-Question-buttons-container');

    // Get the selected answer from the URL parameters
    const FirstQuestionAnswer = new URLSearchParams(window.location.search).get('FirstQuestionAnswer');

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
            const FirstQuestion = Object.keys(data[0])[1];
            const filteredData = data.filter(item => item[FirstQuestion] === FirstQuestionAnswer);
            
            const NextQuestion = Object.keys(filteredData[0] || {})[2];

            if (NextQuestion) {
                const possibleAnswers = [...new Set(filteredData.map(item => item[NextQuestion]))];
                questionElement.textContent = NextQuestion;
                createAnswerButtons(possibleAnswers, NextQuestion);
            } else {
                questionElement.textContent = '';  // Clear text if no next question
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    // Function to create answer buttons
    function createAnswerButtons(answers, question) {
        const fragment = document.createDocumentFragment();

        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);

            // Use debounce to prevent multiple clicks
            answerButton.addEventListener('click', debounce(() => {
                const selectedAnswer = answerButton.getAttribute('data-answer');
                /*
                fetchWithRetry('/api/updateCounter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question, selectedAnswer })
                })
                .then(data => {*/
                    window.location.href = `NextPage.html?2=${encodeURIComponent(selectedAnswer)}`;
                /*})
                .catch(error => console.error('Error sending data:', error));*/
            }, 300));

            fragment.appendChild(answerButton);
        });

        secondPageButtonsContainer.appendChild(fragment);
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});
