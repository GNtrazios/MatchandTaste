document.addEventListener("DOMContentLoaded", () => {
    const adventureButtonsContainer = document.getElementById('adventure-buttons-container');
    const boxElement = document.querySelector('.box');

    fetch('Officialdata.json')
        .then(response => response.json())
        .then(data => {
            // Get distinct adventure levels from the JSON data
            const distinctAdventures = [...new Set(data.map(cocktail => cocktail["How adventurous are you feeling tonight?"]))];

            // Create buttons for each distinct adventure level
            distinctAdventures.forEach(adventure => {
                const adventureButton = document.createElement('button');
                adventureButton.textContent = adventure;
                adventureButton.className = 'adventure-btn';
                adventureButton.setAttribute('data-adventure', adventure);
                adventureButtonsContainer.appendChild(adventureButton);

                // Adjust the height of the box based on the number of buttons
                adjustBoxHeight();

                // Add event listener to adventure button
                adventureButton.addEventListener('click', () => {
                    // Redirect to the new page with the selected adventure level
                    window.location.href = `Drink.html?adventure=${adventure}`;
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    function adjustBoxHeight() {
        // Calculate new height based on the number of buttons
        const numButtons = adventureButtonsContainer.children.length;
        const baseHeight = 150; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
