document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const secondPageButtonsContainer = document.getElementById('SecondPage-Question-buttons-container');
    const boxElement = document.querySelector('.box');

    // Get the selected adventure from the URL parameters
    const selectedAdventure = new URLSearchParams(window.location.search).get('adventure');

    fetch('Officialdata.json')
        .then(handleResponse)
        .then(data => {
            const filteredData = filterDataByAdventure(data, selectedAdventure);
            const thirdFieldName = getThirdFieldName(filteredData);
            const possibleAnswers = getUniqueAnswers(filteredData, thirdFieldName);
            updateQuestion(thirdFieldName);
            createAnswerButtons(possibleAnswers);
            adjustBoxHeight();
        })
        .catch(error => console.error('Error fetching data:', error));

    function handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    function filterDataByAdventure(data, adventure) {
        return data.filter(item => item["How adventurous are you feeling tonight?"] === adventure);
    }

    function getThirdFieldName(data) {
        return Object.keys(data[0] || {})[2];
    }

    function getUniqueAnswers(data, fieldName) {
        return [...new Set(data.map(item => item[fieldName]))];
    }

    function updateQuestion(fieldName) {
        if (fieldName) {
            questionElement.textContent = fieldName;
        } else {
            questionElement.textContent = `No third field available for "${selectedAdventure}".`;
        }
    }

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
        const baseHeight = 250; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
