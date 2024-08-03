document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const flavor = urlParams.get('flavor');
    const drinkButtonsContainer = document.getElementById('drink-buttons-container');
    const boxElement = document.querySelector('.box');

    if (flavor) {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                // Filter the cocktails by the selected flavor
                const filteredCocktails = data.filter(cocktail => cocktail.flavor === flavor);

                // Get distinct drinks from the filtered cocktails
                const distinctDrinks = [...new Set(filteredCocktails.map(cocktail => cocktail.drink))];

                if (distinctDrinks.length === 1) {
                    // Only one drink available, simulate the button click
                    const drink = distinctDrinks[0];
                    const drinkCocktails = filteredCocktails.filter(cocktail => cocktail.drink === drink);

                    if (drinkCocktails.length > 0) {
                        // Find the cocktail with the minimum "Viewed" value
                        let selectedCocktail = drinkCocktails[0];
                        drinkCocktails.forEach(cocktail => {
                            if (cocktail.Viewed < selectedCocktail.Viewed) {
                                selectedCocktail = cocktail;
                            }
                        });

                        window.location.href = `Result.html?name=${encodeURIComponent(selectedCocktail.name)}`;
                    }
                } else {
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

                            // Find the cocktail with the minimum "Viewed" value
                            let selectedCocktail = drinkCocktails[0];
                            drinkCocktails.forEach(cocktail => {
                                if (cocktail.Viewed < selectedCocktail.Viewed) {
                                    selectedCocktail = cocktail;
                                }
                            });

                            window.location.href = `Result.html?name=${encodeURIComponent(selectedCocktail.name)}`;
                        });
                    });
                }
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
