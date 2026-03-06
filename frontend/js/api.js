// frontend/js/api.js

const API_BASE_URL = window.location.origin + '/api';

// Simple auth management for Token Dashboard
const AUTH_TOKEN_KEY = 'openretro_token';
const AUTH_USER_KEY = 'openretro_user';

export const auth = {
    isAuthenticated: () => {
        return sessionStorage.getItem(AUTH_TOKEN_KEY) !== null;
    },
    
    saveToken: (token, user) => {
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    },
    
    getToken: () => {
        return sessionStorage.getItem(AUTH_TOKEN_KEY);
    },
    
    getUser: () => {
        const userStr = sessionStorage.getItem(AUTH_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },
    
    clearToken: () => {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
    }
};

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

    // NEW: Link Management
    linkCards: (actionCardId, betterCardId) => callApi('POST', `cards/${actionCardId}/link/${betterCardId}`),
    unlinkCards: (actionCardId, betterCardId) => callApi('DELETE', `cards/${actionCardId}/unlink/${betterCardId}`),
    getLinkedCards: (cardId) => callApi('GET', `cards/${cardId}/links`),

    // NEW: Status Management
    updateCardStatus: (cardId, status) => callApi('PATCH', `cards/${cardId}/status`, { status }),

    // NEW: Token Dashboard Management
    recordTokenUsage: (projectId, agent, model, tokens, cost) => 
        callApi('POST', 'tokens', { project_id: projectId, agent, model, total_tokens: tokens, cost }),
    
    getTokensByProject: async (projectId, startDate, endDate) => {
        const params = new URLSearchParams({ project_id: projectId });
        if (startDate) params.append('start_date', startDate.toISOString());
        if (endDate) params.append('end_date', endDate.toISOString());
        return callApi('GET', `tokens/by-project?${params.toString()}`);
    },
    
    getProjectsWithTokenUsage: async () => 
        callApi('GET', 'tokens/projects'),
    
    getRecentTokenUsage: async (limit = 20) => 
        callApi('GET', `tokens?limit=${limit}`),
};
