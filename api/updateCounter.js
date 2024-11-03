import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'GNtrazios/MatchandTaste';
const FILE_PATH = 'public/CounterOfAnswers.json';

let updates = []; // In-memory buffer for updates
const MAX_UPDATES_BEFORE_FLUSH = 10; // Max updates before sending to GitHub
const FLUSH_INTERVAL = 5 * 60 * 1000; // Flush every 5 minutes

// Function to fetch and update JSON content on GitHub with accumulated updates
async function updateCounter(mergedUpdates) {
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

        // Apply all merged updates to the JSON content
        for (const { question, selectedAnswer, count } of mergedUpdates) {
            const item = jsonContent.find(item => item.question === question && item.answer === selectedAnswer);
            if (item) {
                item.counter += count;
            } else {
                console.error('Question-answer pair not found:', question, selectedAnswer);
            }
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
                message: 'Batch update: incremented counters for multiple questions',
                content: encodedContent,
                sha: jsonData.sha
            })
        });

        if (!updateResponse.ok) throw new Error('Failed to update JSON file');

        console.log('Counter updated successfully with a single commit');
    } catch (error) {
        console.error('Error updating counter:', error);
    }
}

// Flush updates to GitHub at specified intervals or when the limit is reached
async function flushUpdates() {
    if (updates.length > 0) {
        // Merge updates by counting occurrences of each unique question-answer pair
        const mergedUpdates = updates.reduce((acc, { question, selectedAnswer }) => {
            const existing = acc.find(item => item.question === question && item.selectedAnswer === selectedAnswer);
            if (existing) {
                existing.count += 1;
            } else {
                acc.push({ question, selectedAnswer, count: 1 });
            }
            return acc;
        }, []);

        updates = []; // Clear in-memory buffer for new updates
        await updateCounter(mergedUpdates); // Send the merged updates to GitHub
    }
}

// Set interval to flush updates every specified time
setInterval(() => {
    flushUpdates(); // Flush updates regardless of count
}, FLUSH_INTERVAL);

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
        updates.push({ question, selectedAnswer }); // Add the update to the buffer

        // Check if we reached the maximum updates limit
        if (updates.length >= MAX_UPDATES_BEFORE_FLUSH) {
            await flushUpdates(); // Flush updates immediately if limit reached
        }

        res.status(200).json({ message: 'Update queued successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
