// frontend/js/polling.js

import { api } from './api.js';

const POLLING_INTERVAL = 5000; // 5 seconds
let currentSessionId = null;
let pollingIntervalId = null;

function startPolling(sessionId, updateCallback) {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
    }
    currentSessionId = sessionId;

    pollingIntervalId = setInterval(async () => {
        try {
            const sessionData = await api.getSession(currentSessionId);
            if (sessionData) {
                updateCallback(sessionData.cards);
            }
        } catch (error) {
            console.error('Error during polling:', error);
            // Optionally, stop polling or show an error to the user
        }
    }, POLLING_INTERVAL);
    console.log(`Started polling for session ${sessionId} every ${POLLING_INTERVAL / 1000} seconds.`);
}

function stopPolling() {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
        currentSessionId = null;
        console.log('Polling stopped.');
    }
}

export { startPolling, stopPolling };
