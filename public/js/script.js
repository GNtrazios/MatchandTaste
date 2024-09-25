document.addEventListener("DOMContentLoaded", () => {
    const adventureButtonsContainer = document.getElementById('InitialPage-buttons-container');
    const boxElement = document.querySelector('.box');

    fetch('Officialdata.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const distinctAdventures = [...new Set(data.map(cocktail => cocktail["How adventurous are you feeling tonight?"]))];
            createAdventureButtons(distinctAdventures);
            updateBoxHeight();
        })
        .catch(error => console.error('Error fetching data:', error));

    function createAdventureButtons(adventures) {
        const fragment = document.createDocumentFragment();

        adventures.forEach(adventure => {
            const adventureButton = document.createElement('button');
            adventureButton.textContent = adventure;
            adventureButton.className = 'adventure-btn';
            adventureButton.setAttribute('data-adventure', adventure);

            adventureButton.addEventListener('click', () => {
                window.location.href = `SecondPage.html?adventure=${adventure}`;
            });

            fragment.appendChild(adventureButton);
        });

        adventureButtonsContainer.appendChild(fragment);
    }

    function updateBoxHeight() {
        const numButtons = adventureButtonsContainer.children.length;
        const baseHeight = 150; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
