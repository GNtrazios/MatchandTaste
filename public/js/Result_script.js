document.addEventListener("DOMContentLoaded", () => {
    const cocktailImage = document.getElementById('cocktail-image');
    const cocktailName = document.getElementById('cocktail-name');
    const cocktailDescription = document.getElementById('cocktail-description');
  
    // Get the cocktail name from the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCocktailName = urlParams.get('name');
  
    if (!selectedCocktailName) {
      alert('No cocktail selected!');
      return;
    }
  
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        // Find the selected cocktail from the data
        const selectedCocktail = data.find(cocktail => cocktail.name === selectedCocktailName);
  
        if (selectedCocktail) {
          // Set the image, name, and description
          cocktailImage.src = `images/${selectedCocktail.name.replace(/\s/g, '')}.jpg`;
          cocktailImage.alt = selectedCocktail.name;
          cocktailName.textContent = selectedCocktail.name;
          cocktailDescription.textContent = selectedCocktail.description;
  
          // Update the Viewed status using the serverless function
          fetch('/api/update-viewed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: selectedCocktailName })
          })
          .then(response => response.json())
          .then(result => console.log(result.message))
          .catch(error => console.error('Error updating viewed status:', error));
        } else {
          alert('Cocktail not found!');
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  });
  