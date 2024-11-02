import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'GNtrazios/MatchandTaste';
const FILE_PATH = 'public/CounterOfAnswers.json';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { question, selectedAnswer } = req.body;

        if (!question || !selectedAnswer) {
            console.error('Both question and selected answer are required');
            return res.status(400).json({ message: 'Invalid request' });
        }

        try {
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

            // Find the matching question-answer pair
            const item = jsonContent.find(item => item.question === question && item.answer === selectedAnswer);
            if (item) {
                item.counter += 1;
            } else {
                console.error('Question not found');
                return res.status(404).json({ message: 'Question not found' });
            }

            // Prepare updated content
            const updatedContent = JSON.stringify(jsonContent, null, 2);
            const encodedContent = Buffer.from(updatedContent).toString('base64');

            // Update JSON file on GitHub
            const updateResponse = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Incremented counter for selected answer',
                    content: encodedContent,
                    sha: jsonData.sha
                })
            });

            if (!updateResponse.ok) throw new Error('Failed to update JSON file');

            res.status(200).json({ message: 'Counter updated successfully', question, selectedAnswer });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
