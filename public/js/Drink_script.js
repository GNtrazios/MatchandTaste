document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const flavor = urlParams.get('flavor');
    const drinkButtonsContainer = document.getElementById('drink-buttons-container');
    const boxElement = document.querySelector('.box'); // Reference to the box element

    if (flavor) {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                // Filter the cocktails by the selected flavor
                const filteredCocktails = data.filter(cocktail => cocktail.flavor === flavor);

                // Get distinct drinks from the filtered cocktails
                const distinctDrinks = [...new Set(filteredCocktails.map(cocktail => cocktail.drink))];

                // Create buttons for each distinct drink
                distinctDrinks.forEach(drink => {
                    const drinkButton = document.createElement('button');
                    drinkButton.textContent = drink;
                    drinkButton.className = 'drink-btn';
                    drinkButton.setAttribute('data-drink', drink);
                    drinkButtonsContainer.appendChild(drinkButton);

                    // Adjust the height of the box based on the number of buttons
                    adjustBoxHeight();

                    // Add event listener to drink button
                    drinkButton.addEventListener('click', () => {
                        // Filter cocktails by drink type
                        const drinkCocktails = filteredCocktails.filter(cocktail => cocktail.drink === drink);

                        // Assuming there's only one cocktail per drink type, 
                        // redirect to the Result.html page with the cocktail's name as a query parameter
                        if (drinkCocktails.length > 0) {
                            const selectedCocktail = drinkCocktails[0];
                            window.location.href = `Result.html?name=${encodeURIComponent(selectedCocktail.name)}`;
                        }
                    });
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    } else {
        // Handle case where no flavor is selected (optional)
        const cocktailList = document.getElementById('cocktail-list');
        cocktailList.innerHTML = '<li>No flavor selected. Please go back and choose a flavor.</li>';
    }

    // Function to adjust the height of the box
    function adjustBoxHeight() {
        const baseHeight = 200; // Base height in pixels (adjust as necessary)
        const buttonHeight = 40; // Approximate height per button (including padding and margin)
        const numButtons = drinkButtonsContainer.children.length;
        const newHeight = baseHeight + (numButtons * buttonHeight);
        boxElement.style.height = `${newHeight}px`;
    }
});
