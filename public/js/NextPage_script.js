document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const NextPageButtonsContainer = document.getElementById('NextPage-Question-buttons-container');

    // Get the first URL parameter key and its corresponding value
    const urlParams = new URLSearchParams(window.location.search);
    const firstParam = [...urlParams.keys()][0]; 
    const previousAnswer = urlParams.get(firstParam);
    const result = parseInt(firstParam, 10);

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
            const filteredData = data.filter(item => {
                const values = Object.values(item);
                return values[result] === previousAnswer;
            });

            const NextQuestion = Object.keys(filteredData[0] || {})[result + 1];

            if (NextQuestion && NextQuestion !== 'description') {
                const possibleAnswers = [...new Set(filteredData.map(item => item[NextQuestion]))];
                questionElement.textContent = NextQuestion;
                createAnswerButtons(possibleAnswers, NextQuestion);
            } else {
                window.location.href = `Result.html?name=${encodeURIComponent(filteredData[0].name)}`;
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    // Function to create answer buttons
    function createAnswerButtons(possibleAnswers, question) {
        NextPageButtonsContainer.innerHTML = '';
        const validAnswers = possibleAnswers.filter(Boolean);

        const fragment = document.createDocumentFragment();
        validAnswers.forEach(answer => {
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
                    window.location.href = `NextPage.html?${encodeURIComponent(result + 1)}=${encodeURIComponent(selectedAnswer)}`;
                /*})
                .catch(error => console.error('Error sending data:', error));*/
            }, 300));

            fragment.appendChild(answerButton);
        });

        NextPageButtonsContainer.appendChild(fragment);
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
