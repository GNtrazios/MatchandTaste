// api/update-viewed.js
const { Octokit } = require("@octokit/rest");

export default async function handler(req, res) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PAT, // Use environment variable for token
  });

  const owner = 'gntrazios'; // Replace with your GitHub username
  const repo = 'MatchandTaste'; // Replace with your repository name
  const path = 'public/data.json'; // Path to the file in the repository
  const message = 'Updating viewed status'; // Commit message
  const { name } = req.body; // Extracting cocktail name from request body

  try {
    // Fetch the current file content
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const sha = fileData.sha;
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const jsonData = JSON.parse(content);

    // Find the selected cocktail and update the viewed status
    const selectedCocktail = jsonData.find(cocktail => cocktail.name === name);
    if (selectedCocktail) {
      selectedCocktail.viewed = true; // Update viewed status or other properties as needed
    } else {
      return res.status(404).json({ error: 'Cocktail not found' });
    }

    // Convert updated data to base64
    const updatedContent = Buffer.from(JSON.stringify(jsonData)).toString('base64');

    // Update the file content on GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: updatedContent,
      sha, // Required to update existing file
    });

    res.status(200).json({ message: 'File updated successfully.' });
  } catch (error) {
    console.error('Error updating file:', error.message); // Log specific error message
    res.status(500).json({ error: 'Failed to update file.' });
  }
}
