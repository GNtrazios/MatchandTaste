document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const InitialPageButtonsContainer = document.getElementById('InitialPage-buttons-container');
    const boxElement = document.querySelector('.box');

    fetch('OubiCocktails.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const FirstQuestion = Object.keys(data[0])[1];

            const possibleAnswers = [...new Set(data.map(cocktail => cocktail[FirstQuestion]))];           
            questionElement.textContent = FirstQuestion;

            createAnswerButtons(possibleAnswers);
            //updateBoxHeight();
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
                window.location.href = `SecondPage.html?FirstQuestionAnswer=${answer}`;
            });

            fragment.appendChild(answerButton);
        });

        InitialPageButtonsContainer.appendChild(fragment);
    }

    /*function updateBoxHeight() {
        const numButtons = InitialPageButtonsContainer.children.length;
        const baseHeight = 150; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }*/
});
