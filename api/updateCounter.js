import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Ensure your GitHub token is set in Vercel Environment Variables
const REPO = 'GNtrazios/MatchandTaste'; // Your GitHub repository
const FILE_PATH = 'public/CounterOfAnswers.json'; // Path to your JSON file

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { question, selectedAnswer } = req.body;

        if (!question || !selectedAnswer) { // Check for both values
            return res.status(400).json({ message: 'Both question and selected answer are required' });
        }

        // Fetch the current JSON data from GitHub
        const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            console.error('Error fetching JSON:', response.statusText);
            return res.status(500).json({ message: 'Failed to fetch the JSON file' });
        }

        const jsonData = await response.json();
        const fileContent = Buffer.from(jsonData.content, 'base64').toString('utf-8');
        const jsonContent = JSON.parse(fileContent);

        // Find the matching question and selected answer pair
        const item = jsonContent.find(item => item.question === question && item.answer === selectedAnswer);
        if (item) {
            item.counter += 1; // Increment the counter
        } else {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Prepare the updated content for GitHub
        const updatedContent = JSON.stringify(jsonContent, null, 2);
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        // Update the JSON file on GitHub
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Incremented counter for selected answer',
                content: encodedContent,
                sha: jsonData.sha // Provide the SHA of the existing file for updates
            })
        });

        if (!updateResponse.ok) {
            console.error('Error updating JSON:', updateResponse.statusText);
            return res.status(500).json({ message: 'Failed to update the JSON file' });
        }

        res.status(200).json({ message: 'Counter updated successfully', question, selectedAnswer });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
