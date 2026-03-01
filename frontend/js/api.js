// frontend/js/api.js

const API_BASE_URL = window.location.origin + '/api';

async function callApi(method, path, data = null) {
    const url = `${API_BASE_URL}/${path}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");

        if (response.status === 204) { // No Content
            return null;
        }
        
        if (contentType && contentType.includes("application/json")) {
            const jsonResponse = await response.json();
            if (!response.ok) {
                const errorDetail = jsonResponse.detail || 'Unknown API error';
                throw new Error(`API Error (${response.status}): ${errorDetail}`);
            }
            return jsonResponse;
        } else {
            const textResponse = await response.text();
            if (!response.ok) {
                 throw new Error(`API Error (${response.status}): ${textResponse}`);
            }
            // For non-JSON responses (e.g., HTML from FastAPI default errors)
            console.warn('Received non-JSON response:', textResponse);
            return textResponse;
        }
    } catch (error) {
        console.error(`Error calling API ${method} ${path}:`, error);
        throw error;
    }
}

export const api = {
    // Session Management
    createSession: (name) => callApi('POST', 'sessions', { name }),
    getSession: (sessionId) => callApi('GET', `sessions/${sessionId}`),

    // Card Management
    createCard: (sessionId, cardData) => callApi('POST', `sessions/${sessionId}/cards`, cardData),
    updateCard: (cardId, cardData) => callApi('PUT', `cards/${cardId}`, cardData),
    deleteCard: (cardId) => callApi('DELETE', `cards/${cardId}`),
    mergeCards: (cardId, intoCardId) => callApi('POST', `cards/${cardId}/merge`, { into_card_id: intoCardId }),

    // Comment Management
    addComment: (cardId, commentData) => callApi('POST', `cards/${cardId}/comments`, commentData),
};
