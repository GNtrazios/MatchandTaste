import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Ensure this is set in Vercel
const REPO = 'GNtrazios/MatchandTaste'; // Your GitHub repository
const FILE_PATH = 'public/CounterOfAnswers.json'; // Path to your JSON file

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // Fetch the current JSON data from GitHub
        const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json' // Get the JSON metadata
            }
        });

        if (!response.ok) {
            console.error('Error fetching JSON:', response.statusText);
            return res.status(500).json({ message: 'Failed to fetch the JSON file' });
        }

        const jsonData = await response.json();

        // Get the content and SHA from the response
        const fileContent = Buffer.from(jsonData.content, 'base64').toString('utf-8');
        const jsonContent = JSON.parse(fileContent);

        // Find the matching question and increment the counter
        const item = jsonContent.find(item => item.question === question);
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
                message: 'Incremented counter',
                content: encodedContent,
                sha: jsonData.sha // Provide the SHA of the existing file for updates
            })
        });

        if (!updateResponse.ok) {
            console.error('Error updating JSON:', updateResponse.statusText);
            return res.status(500).json({ message: 'Failed to update the JSON file' });
        }

        res.status(200).json({ message: 'Counter updated successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
