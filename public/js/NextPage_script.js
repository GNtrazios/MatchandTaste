document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.querySelector('.question');
    const nextQuestionButtonsContainer = document.getElementById('NextQuestion-buttons-container');
    const boxElement = document.querySelector('.box');

    // Get the second field value from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const selectedAdventure = urlParams.get('adventure');

    fetch('Officialdata.json')
        .then(response => response.json())
        .then(data => {
            // Filter the data based on the second field
            const filteredData = data.filter(item => item["How adventurous are you feeling tonight?"] === selectedAdventure);

            // Get the name of the third field
            const thirdFieldName = Object.keys(filteredData[0] || {})[2];
            const possibleAnswers = [...new Set(filteredData.map(item => item[thirdFieldName]))];

            // Update the question element
            if (thirdFieldName) {
                questionElement.textContent = `${thirdFieldName}`;
            } else {
                questionElement.textContent = `No third field available for "${selectedAdventure}".`;
            }

            // Create buttons for each possible answer
            possibleAnswers.forEach(answer => {
                const answerButton = document.createElement('button');
                answerButton.textContent = answer;
                answerButton.className = 'answer-btn';
                answerButton.setAttribute('data-answer', answer);
                nextQuestionButtonsContainer.appendChild(answerButton);

                // Add event listener for the button
                answerButton.addEventListener('click', () => {
                    // Redirect to the next question page with the selected answer
                    window.location.href = `NextPage2.html?2=${encodeURIComponent(answer)}`;
                });
            });

            // Adjust the box height based on the number of buttons created
            adjustBoxHeight();
        })
        .catch(error => console.error('Error fetching data:', error));

    function adjustBoxHeight() {
        // Calculate new height based on the number of buttons
        const numButtons = nextQuestionButtonsContainer.children.length;
        const baseHeight = 250; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
