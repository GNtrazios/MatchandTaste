document.addEventListener("DOMContentLoaded", () => {
    const flavorButtonsContainer = document.getElementById('flavor-buttons-container');
    const boxElement = document.querySelector('.box');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Get distinct flavors from the JSON data
            const distinctFlavors = [...new Set(data.map(cocktail => cocktail.flavor))];

            // Create buttons for each distinct flavor
            distinctFlavors.forEach(flavor => {
                const flavorButton = document.createElement('button');
                flavorButton.textContent = flavor;
                flavorButton.className = 'flavor-btn';
                flavorButton.setAttribute('data-flavor', flavor);
                flavorButtonsContainer.appendChild(flavorButton);

                // Adjust the height of the box based on the number of buttons
                adjustBoxHeight();

                // Add event listener to flavor button
                flavorButton.addEventListener('click', () => {
                    // Redirect to the new page with the selected flavor
                    window.location.href = `Drink.html?flavor=${flavor}`;
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    function adjustBoxHeight() {
        // Calculate new height based on the number of buttons
        const numButtons = flavorButtonsContainer.children.length;
        const baseHeight = 100; // Base height in pixels
        const buttonHeight = 40; // Height of each button (including margin)
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
