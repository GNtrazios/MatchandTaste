document.addEventListener("DOMContentLoaded", () => {
  const cocktailImage = document.getElementById('cocktail-image');
  const cocktailName = document.getElementById('cocktail-name');
  const cocktailDescription = document.getElementById('cocktail-description');

  // Get the cocktail name from the query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCocktailName = urlParams.get('name');

  fetchCocktailData(selectedCocktailName)
      .then(selectedCocktail => {
          if (selectedCocktail) {
            updateCocktailUI(selectedCocktail);
          } else {
            alert(`Cocktail "${selectedCocktailName}" not found!`);
          }
      })
      .catch(error => console.error('Error fetching data:', error));

  function fetchCocktailData(cocktailName) {
      return fetch('OubiCocktails.json')
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => data.find(cocktail => cocktail.name === cocktailName));
  }

  function updateCocktailUI(cocktail) {
      cocktailImage.src = `images/${cocktail.name.replace(/\s/g, '')}.jpg`;
      cocktailImage.alt = cocktail.name;
      cocktailName.textContent = cocktail.name;
      cocktailDescription.textContent = cocktail.description;
  }
});
