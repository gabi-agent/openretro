// frontend/js/app.js

import { api } from './api.js';
import { startPolling, stopPolling } from './polling.js';
import { setupDragAndDrop } from './drag-drop.js';

let currentSessionId = null;
let currentAuthor = "User" + Math.floor(Math.random() * 1000); // Default author

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('sessionId');

    if (!currentSessionId) {
        // If no session ID, redirect to name.html
        window.location.href = 'name.html';
        return;
    }

    document.getElementById('session-id-display').textContent = `Session ID: ${currentSessionId}`;

    // Event listener for Copy ID button
    document.getElementById('copy-session-id').addEventListener('click', () => {
        navigator.clipboard.writeText(currentSessionId).then(() => {
            alert('Session ID copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    // Setup event listeners for adding cards
    document.querySelectorAll('.add-card-btn').forEach(button => {
        button.addEventListener('click', (e) => openCardModal(e.target.closest('.flex-col').querySelector('.card-list').dataset.columnType));
    });

    // Modals setup
    const cardModalTemplate = document.getElementById('card-modal-template');
    const commentModalTemplate = document.getElementById('comment-modal-template');

    const cardModal = cardModalTemplate.cloneNode(true);
    cardModal.id = 'card-modal';
    document.body.appendChild(cardModal);

    const commentModal = commentModalTemplate.cloneNode(true);
    commentModal.id = 'comment-modal';
    document.body.appendChild(commentModal);


    await fetchAndRenderBoard();
    startPolling(currentSessionId, renderBoard);
    setupDragAndDrop();
});

async function fetchAndRenderBoard() {
    try {
        const sessionData = await api.getSession(currentSessionId);
        if (sessionData) {
            renderBoard(sessionData.cards);
        }
    } catch (error) {
        console.error('Error fetching session data:', error);
        alert('Failed to load session data. Please try again.');
        stopPolling();
        // Optionally redirect back to name.html
        // window.location.href = 'name.html';
    }
}

function renderBoard(cards) {
    const goodColumn = document.querySelector('.card-list[data-column-type="good"]');
    const betterColumn = document.querySelector('.card-list[data-column-type="better"]');
    const actionsColumn = document.querySelector('.card-list[data-column-type="actions"]');

    // Clear existing cards, but keep merged cards in original place for now
    goodColumn.innerHTML = '';
    betterColumn.innerHTML = '';
    actionsColumn.innerHTML = '';

    // Filter out merged cards for initial rendering, they will appear under the target card if not handled by backend
    const nonMergedCards = cards.filter(card => !card.merged_into);

    nonMergedCards.sort((a, b) => a.position - b.position);

    nonMergedCards.forEach(card => {
        const cardElement = createCardElement(card);
        if (card.column_type === 'good') {
            goodColumn.appendChild(cardElement);
        } else if (card.column_type === 'better') {
            betterColumn.appendChild(cardElement);
        } else if (card.column_type === 'actions') {
            actionsColumn.appendChild(cardElement);
        }
    });
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-item', `card-${card.column_type}`, 'p-4', 'rounded-md', 'shadow-sm', 'bg-white', 'relative', 'cursor-grab');
    cardDiv.setAttribute('draggable', 'true');
    cardDiv.dataset.cardId = card.card_id;
    cardDiv.dataset.columnType = card.column_type;

    // Card Content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('card-content', 'text-sm', 'text-gray-700', 'mb-2', 'whitespace-pre-wrap');
    contentDiv.textContent = card.text; // Use textContent to prevent XSS
    cardDiv.appendChild(contentDiv);

    // Card Author
    const authorDiv = document.createElement('div');
    authorDiv.classList.add('card-author', 'text-xs', 'text-gray-500', 'text-right');
    authorDiv.textContent = `— ${card.author} at ${new Date(card.created_at).toLocaleString()}`;
    cardDiv.appendChild(authorDiv);

    // Comments Section (if any)
    if (card.comments && card.comments.length > 0) {
        const commentsSection = document.createElement('div');
        commentsSection.classList.add('comments-section', 'border-t', 'border-gray-200', 'pt-3', 'mt-3', 'space-y-2');
        card.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment-item', 'text-xs', 'bg-gray-50', 'p-2', 'rounded-sm', 'border-l-2', 'border-blue-400');
            commentDiv.innerHTML = `
                <span class="font-semibold text-gray-800">${comment.author}</span>: 
                <span class="text-gray-700">${comment.text}</span>
                <div class="text-right text-gray-400 mt-1">${new Date(comment.created_at).toLocaleString()}</div>
            `;
            commentsSection.appendChild(commentDiv);
        });
        cardDiv.appendChild(commentsSection);
    }

    // Card Actions (Edit, Delete, Merge, Comment)
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('card-actions-row', 'flex', 'justify-end', 'gap-2', 'mt-3');

    const editBtn = createActionButton('Edit', 'edit-btn', () => openCardModal(card.column_type, card));
    const deleteBtn = createActionButton('Delete', 'delete-btn', () => deleteCard(card.card_id));
    const commentBtn = createActionButton('Comment', 'comment-btn', () => openCommentModal(card.card_id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    actionsDiv.appendChild(commentBtn);

    cardDiv.appendChild(actionsDiv);

    return cardDiv;
}

function createActionButton(text, className, onClickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className, 'py-1', 'px-2', 'rounded-md', 'text-xs', 'font-medium', 'shadow-sm');
    button.addEventListener('click', onClickHandler);
    return button;
}

async function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        try {
            await api.deleteCard(cardId);
            await fetchAndRenderBoard(); // Re-render board after deletion
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('Failed to delete card.');
        }
    }
}


// --- Modal Logic ---
// Character counter configuration
const MAX_CHARACTERS = 2000; // Backend limit (ACTION-E1 increased to 2000)

function updateCharacterCounter(textarea) {
    const currentLength = textarea.value.length;
    const remaining = MAX_CHARACTERS - currentLength;
    const percentage = (currentLength / MAX_CHARACTERS) * 100;

    // Find or create counter element
    let counterElement = textarea.parentElement.querySelector('.char-counter');
    if (!counterElement) {
        counterElement = document.createElement('div');
        counterElement.classList.add('char-counter', 'text-sm', 'mt-2', 'text-right');
        textarea.parentElement.appendChild(counterElement);
    }

    // Update counter text and color based on percentage
    if (percentage >= 100) {
        counterElement.textContent = `${currentLength}/${MAX_CHARACTERS} ⚠️ Limit exceeded!`;
        counterElement.className = 'char-counter text-sm mt-2 text-right text-red-600 font-bold';
    } else if (percentage >= 95) {
        counterElement.textContent = `${currentLength}/${MAX_CHARACTERS} (${remaining} remaining) ⚠️ Near limit`;
        counterElement.className = 'char-counter text-sm mt-2 text-right text-red-500 font-semibold';
    } else if (percentage >= 90) {
        counterElement.textContent = `${currentLength}/${MAX_CHARACTERS} (${remaining} remaining)`;
        counterElement.className = 'char-counter text-sm mt-2 text-right text-yellow-600 font-semibold';
    } else {
        counterElement.textContent = `${currentLength}/${MAX_CHARACTERS} (${remaining} remaining)`;
        counterElement.className = 'char-counter text-sm mt-2 text-right text-gray-600';
    }
}

function openCardModal(columnType, card = null) {
    const modal = document.getElementById('card-modal');
    const title = modal.querySelector('#modal-title');
    const cardText = modal.querySelector('#modal-card-text');
    const cardAuthor = modal.querySelector('#modal-card-author');
    const saveBtn = modal.querySelector('#modal-save-btn');
    const cancelBtn = modal.querySelector('#modal-cancel-btn');

    let isEditMode = false;
    if (card) {
        isEditMode = true;
        title.textContent = 'Edit Card';
        cardText.value = card.text;
        cardAuthor.value = card.author;
        saveBtn.textContent = 'Save Changes';
        // Update counter on edit
        updateCharacterCounter(cardText);
    } else {
        title.textContent = 'Add New Card';
        cardText.value = '';
        cardAuthor.value = currentAuthor;
        saveBtn.textContent = 'Save Card';
        // Reset counter on new card
        updateCharacterCounter(cardText);
    }

    modal.classList.remove('hidden');

    // Setup character counter event listener for real-time updates
    cardText.addEventListener('input', () => updateCharacterCounter(cardText));

    const saveHandler = async () => {
        const text = cardText.value.trim();
        const author = cardAuthor.value.trim();
        if (!text || !author) {
            alert('Card content and author cannot be empty.');
            return;
        }

        // Validate character limit
        if (text.length > MAX_CHARACTERS) {
            alert(`Card text exceeds ${MAX_CHARACTERS} character limit. Please reduce to ${MAX_CHARACTERS} characters or less.`);
            return;
        }

        try {
            if (isEditMode) {
                await api.updateCard(card.card_id, { text, author });
            } else {
                await api.createCard(currentSessionId, { text, author, column_type: columnType });
                currentAuthor = author; // Remember last used author
            }
            closeModal(modal);
            await fetchAndRenderBoard();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Failed to save card: ' + error.message);
        }
    };

    saveBtn.onclick = saveHandler;
    cancelBtn.onclick = () => closeModal(modal);
}

function openCommentModal(cardId) {
    const modal = document.getElementById('comment-modal');
    const commentText = modal.querySelector('#modal-comment-text');
    const commentAuthor = modal.querySelector('#modal-comment-author');
    const saveBtn = modal.querySelector('#modal-comment-save-btn');
    const cancelBtn = modal.querySelector('#modal-comment-cancel-btn');

    commentText.value = '';
    commentAuthor.value = currentAuthor;
    modal.classList.remove('hidden');

    const saveHandler = async () => {
        const text = commentText.value.trim();
        const author = commentAuthor.value.trim();
        if (!text || !author) {
            alert('Comment content and author cannot be empty.');
            return;
        }

        try {
            await api.addComment(cardId, { text, author });
            currentAuthor = author; // Remember last used author
            closeModal(modal);
            await fetchAndRenderBoard();
        } catch (error) {
            console.error('Error saving comment:', error);
            alert('Failed to save comment: ' + error.message);
        }
    };

    saveBtn.onclick = saveHandler;
    cancelBtn.onclick = () => closeModal(modal);
}

function closeModal(modal) {
    modal.classList.add('hidden');
    // Clean up event listeners to prevent memory leaks or unexpected behavior
    const saveBtn = modal.querySelector('#modal-save-btn') || modal.querySelector('#modal-comment-save-btn');
    const cancelBtn = modal.querySelector('#modal-cancel-btn') || modal.querySelector('#modal-comment-cancel-btn');
    if (saveBtn) saveBtn.onclick = null;
    if (cancelBtn) cancelBtn.onclick = null;

    // Clean up character counter element if present (for card modal)
    const cardText = modal.querySelector('#modal-card-text');
    if (cardText) {
        const counterElement = cardText.parentElement.querySelector('.char-counter');
        if (counterElement) {
            counterElement.remove();
        }
    }
}
