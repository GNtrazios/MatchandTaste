document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const secondPageButtonsContainer = document.getElementById('SecondPage-Question-buttons-container');
    const boxElement = document.querySelector('.box');

    // Get the selected adventure from the URL parameters
    const FirstQuestionAnswer = new URLSearchParams(window.location.search).get('FirstQuestionAnswer');

    fetch('OubiCocktails.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const FirstQuestion = Object.keys(data[0])[1];
            const filteredData = data.filter(item => item[FirstQuestion] === FirstQuestionAnswer);
            
            const NextQuestion = Object.keys(filteredData[0] || {})[2];

            if (NextQuestion) {
                const possibleAnswers = [...new Set(filteredData.map(item => item[NextQuestion]))];

                questionElement.textContent = NextQuestion;
                createAnswerButtons(possibleAnswers);
                adjustBoxHeight();
            } else {
                questionElement.textContent = `No next field available.`;
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    function createAnswerButtons(answers) {
        const fragment = document.createDocumentFragment();

        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer;
            answerButton.className = 'answer-btn';
            answerButton.setAttribute('data-answer', answer);

            answerButton.addEventListener('click', () => {
                window.location.href = `NextPage.html?2=${encodeURIComponent(answer)}`;
            });

            fragment.appendChild(answerButton);
        });

        secondPageButtonsContainer.appendChild(fragment);
    }

    function adjustBoxHeight() {
        const numButtons = secondPageButtonsContainer.children.length;
        const baseHeight = 200; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
