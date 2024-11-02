document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const secondPageButtonsContainer = document.getElementById('SecondPage-Question-buttons-container');

    // Get the selected answer from the URL parameters
    const FirstQuestionAnswer = new URLSearchParams(window.location.search).get('FirstQuestionAnswer');

    fetch('OubiCocktails.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
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
                    window.location.href = `NextPage.html?2=${encodeURIComponent(selectedAnswer)}`;
                })
                .catch(error => console.error('Error sending data:', error));
            });

            fragment.appendChild(answerButton);
        });

        secondPageButtonsContainer.appendChild(fragment);
    }
});
