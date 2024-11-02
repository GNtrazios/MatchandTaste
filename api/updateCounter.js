import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'GNtrazios/MatchandTaste';
const FILE_PATH = 'public/CounterOfAnswers.json';

let updates = []; // In-memory buffer for updates
const MAX_UPDATES_BEFORE_FLUSH = 10; // Max updates before sending to GitHub
const FLUSH_INTERVAL = 5 * 60 * 1000; // Flush every 5 minutes
const LOCAL_STORAGE_KEY = 'pendingUpdates'; // Key for local storage

// Load saved updates from local storage (to be invoked on server start)
function loadSavedUpdates() {
    const savedUpdates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    updates.push(...savedUpdates); // Add saved updates to in-memory buffer
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear saved updates after loading
}

// Save updates to local storage for persistence
function saveUpdatesToLocal() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updates)); // Store current updates in local storage
}

// Function to send updates to GitHub
async function updateCounter(updatesToFlush) {
    for (const { question, selectedAnswer } of updatesToFlush) {
        if (!question || !selectedAnswer) {
            console.error('Both question and selected answer are required');
            continue; // Skip invalid updates
        }

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

            // Find the matching question-answer pair and increment the counter
            const item = jsonContent.find(item => item.question === question && item.answer === selectedAnswer);
            if (item) {
                item.counter += 1;
            } else {
                console.error('Question not found');
                continue; // Skip if question not found
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

            console.log('Counter updated successfully:', question, selectedAnswer);
        } catch (error) {
            console.error('Error updating counter:', error);
            // Retry logic could be added here if desired
        }
    }
}

// Flush updates to GitHub at specified intervals or when the limit is reached
async function flushUpdates() {
    if (updates.length > 0) {
        const flushUpdates = [...updates]; // Copy current updates
        updates = []; // Clear in-memory buffer for new updates
        await updateCounter(flushUpdates); // Send to GitHub
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

        // Save to local storage to ensure data persistence
        saveUpdatesToLocal();

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
