document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const NextPageButtonsContainer = document.getElementById('NextPage-Question-buttons-container');

    // Get the first URL parameter key and its corresponding value
    const urlParams = new URLSearchParams(window.location.search);
    const firstParam = [...urlParams.keys()][0]; 
    const previousAnswer = urlParams.get(firstParam);
    const result = parseInt(firstParam, 10);

    fetch('OubiCocktails.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })   
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
            
            answerButton.addEventListener('click', () => {
                const selectedAnswer = answerButton.getAttribute('data-answer');

                fetch('/api/updateCounter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question, selectedAnswer })
                })
                .then(response => response.json())
                .then(data => {
                    window.location.href = `NextPage.html?${encodeURIComponent(result + 1)}=${encodeURIComponent(selectedAnswer)}`;
                })
                .catch(error => console.error('Error sending data:', error));
            });

            fragment.appendChild(answerButton);
        });

        NextPageButtonsContainer.appendChild(fragment);
    }
});
