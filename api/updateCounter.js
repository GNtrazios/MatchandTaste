import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'GNtrazios/MatchandTaste-Analytics';
const FILE_PATH = 'CounterOfAnswers.json';

// Function to fetch and update JSON content on GitHub for a single update
async function updateCounter(question, selectedAnswer) {
    try {
        // Fetch the current content of the JSON file
        const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch the JSON file');

        const jsonData = await response.json();
        const fileContent = Buffer.from(jsonData.content, 'base64').toString('utf-8');
        const jsonContent = JSON.parse(fileContent);

        // Update the JSON content by incrementing the counter for the given question-answer pair
        const item = jsonContent.find(item => item.question === question && item.answer === selectedAnswer);
        if (item) {
            item.counter += 1;
        } else {
            console.error('Question-answer pair not found:', question, selectedAnswer);
            return;
        }

        // Prepare updated content
        const updatedContent = JSON.stringify(jsonContent, null, 2);
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        // Update JSON file on GitHub with a single commit
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Updated counter for question: ${question}, answer: ${selectedAnswer}`,
                content: encodedContent,
                sha: jsonData.sha
            })
        });

        if (!updateResponse.ok) throw new Error('Failed to update JSON file');

        console.log('Counter updated successfully');
    } catch (error) {
        console.error('Error updating counter:', error);
    }
}

// Handle POST requests to update the counter
export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { question, selectedAnswer } = req.body;

        // Call updateCounter immediately with the new question-answer pair
        await updateCounter(question, selectedAnswer);

        res.status(200).json({ message: 'Counter updated successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
