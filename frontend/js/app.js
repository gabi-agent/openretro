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

    // NEW: Link Modal setup
    const linkModalTemplate = document.getElementById('link-modal-template');
    const linkModal = linkModalTemplate.cloneNode(true);
    linkModal.id = 'link-modal';
    document.body.appendChild(linkModal);

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

    // Card Author & Status Badge Container
    const authorBadgeContainer = document.createElement('div');
    authorBadgeContainer.classList.add('flex', 'justify-between', 'items-center', 'mt-2', 'mb-2');

    // Card Author (left side)
    const authorDiv = document.createElement('div');
    authorDiv.classList.add('card-author', 'text-xs', 'text-gray-500');
    authorDiv.textContent = `- ${card.author} at ${new Date(card.created_at).toLocaleString()}`;
    authorBadgeContainer.appendChild(authorDiv);

    // Status Badge (right side)
    console.log('[DEBUG] Card status:', card.status, 'Card ID:', card.card_id);
    if (card.status) {
        const statusBadge = document.createElement('span');
        statusBadge.classList.add('status-badge', 'inline-block', 'text-xs', 'px-2', 'py-1', 'rounded-full', 'font-bold');

        if (card.status === 'open') {
            statusBadge.textContent = '⚪ Open';
            statusBadge.classList.add('bg-gray-200', 'text-gray-700');
        } else if (card.status === 'in_progress') {
            statusBadge.textContent = '🔄 In Progress';
            statusBadge.classList.add('bg-yellow-100', 'text-yellow-700');
        } else if (card.status === 'resolved') {
            statusBadge.textContent = '✅ Resolved';
            statusBadge.classList.add('bg-green-100', 'text-green-700');
        }

        console.log('[DEBUG] Appending badge to container, badge:', statusBadge.textContent);
        authorBadgeContainer.appendChild(statusBadge);
    } else {
        console.log('[DEBUG] No status for card, skipping badge');
    }

    cardDiv.appendChild(authorBadgeContainer);

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

    // NEW: Resolves section for Action cards
    if (card.column_type === 'actions' && card.resolves && card.resolves.length > 0) {
        const resolvesSection = document.createElement('div');
        resolvesSection.classList.add('resolves-section', 'border-t', 'border-blue-200', 'pt-2', 'mt-2', 'space-y-1');

        const resolvesHeader = document.createElement('div');
        resolvesHeader.classList.add('text-xs', 'font-semibold', 'text-blue-600', 'mb-1');
        resolvesHeader.textContent = '📌 Resolves:';
        resolvesSection.appendChild(resolvesHeader);

        card.resolves.forEach(resolved => {
            const resolveItem = document.createElement('div');
            resolveItem.classList.add('resolve-item', 'text-xs', 'bg-blue-50', 'p-2', 'rounded-sm', 'mb-1', 'ml-4');
            resolveItem.innerHTML = `<span class="font-medium text-gray-800">${resolved.text}</span>`;
            resolvesSection.appendChild(resolveItem);
        });

        cardDiv.appendChild(resolvesSection);
    }

    // NEW: Resolved by section for Better cards
    if (card.column_type === 'better' && card.resolved_by && card.resolved_by.length > 0) {
        const resolvedBySection = document.createElement('div');
        resolvedBySection.classList.add('resolved-by-section', 'border-t', 'border-blue-200', 'pt-2', 'mt-2', 'space-y-1');

        const resolvedByHeader = document.createElement('div');
        resolvedByHeader.classList.add('text-xs', 'font-semibold', 'text-blue-600', 'mb-1');
        resolvedByHeader.textContent = '🔗 Resolved by:';
        resolvedBySection.appendChild(resolvedByHeader);

        card.resolved_by.forEach(action => {
            const actionItem = document.createElement('div');
            actionItem.classList.add('action-item', 'text-xs', 'bg-blue-50', 'p-2', 'rounded-sm', 'mb-1', 'ml-4');
            actionItem.innerHTML = `<span class="font-medium text-gray-800">${action.text}</span>`;
            resolvedBySection.appendChild(actionItem);
        });

        cardDiv.appendChild(resolvedBySection);
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

    // NEW: Mark Resolved button for Better cards
    if (card.column_type === 'better') {
        const markResolvedBtn = createActionButton('✅ Mark Resolved', 'mark-resolved-btn', () => markCardResolved(card.card_id));
        // Only show if not already resolved
        if (card.status !== 'resolved') {
            actionsDiv.appendChild(markResolvedBtn);
        }
    }

    // NEW: Link button for Action cards
    if (card.column_type === 'actions') {
        const linkBtn = createActionButton('🔗 Link', 'link-btn', () => openLinkModal(card.card_id));
        actionsDiv.appendChild(linkBtn);
    }

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

async function markCardResolved(cardId) {
    if (confirm('Are you sure you want to mark this card as RESOLVED?')) {
        try {
            await api.updateCardStatus(cardId, 'resolved');
            await fetchAndRenderBoard(); // Re-render board after status update
        } catch (error) {
            console.error('Error marking card resolved:', error);
            alert('Failed to mark card resolved.');
        }
    }
}


// --- Modal Logic ---
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
    } else {
        title.textContent = 'Add New Card';
        cardText.value = '';
        cardAuthor.value = currentAuthor;
        saveBtn.textContent = 'Save Card';
    }

    modal.classList.remove('hidden');

    const saveHandler = async () => {
        const text = cardText.value.trim();
        const author = cardAuthor.value.trim();
        if (!text || !author) {
            alert('Card content and author cannot be empty.');
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
}

// --- Link Modal Logic ---
async function openLinkModal(actionCardId) {
    const modal = document.getElementById('link-modal');
    const betterCardsContainer = modal.querySelector('#link-modal-better-cards');
    const saveBtn = modal.querySelector('#link-modal-save-btn');
    const cancelBtn = modal.querySelector('#link-modal-cancel-btn');

    betterCardsContainer.innerHTML = ''; // Clear previous cards
    modal.classList.remove('hidden');

    try {
        const sessionData = await api.getSession(currentSessionId);
        const betterCards = sessionData.cards.filter(card => card.column_type === 'better' && card.card_id !== actionCardId);

        if (betterCards.length === 0) {
            betterCardsContainer.innerHTML = '<p class="text-gray-600">No "Better" cards available to link.</p>';
            saveBtn.disabled = true;
        } else {
            saveBtn.disabled = false;
            betterCards.forEach(card => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('flex', 'items-center');
                checkboxDiv.innerHTML = `
                    <input type="checkbox" id="link-better-${card.card_id}" value="${card.card_id}" class="form-checkbox h-4 w-4 text-blue-600">
                    <label for="link-better-${card.card_id}" class="ml-2 text-gray-700">${card.text} <span class="text-xs text-gray-500">(${card.author})</span></label>
                `;
                betterCardsContainer.appendChild(checkboxDiv);
            });
        }
    } catch (error) {
        console.error('Error fetching cards for linking:', error);
        alert('Failed to load cards for linking.');
        closeModal(modal);
        return;
    }

    const saveHandler = async () => {
        const selectedBetterCardIds = Array.from(betterCardsContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

        if (selectedBetterCardIds.length === 0) {
            alert('Please select at least one "Better" card to link.');
            return;
        }

        try {
            for (const betterCardId of selectedBetterCardIds) {
                await api.linkCards(actionCardId, betterCardId);
            }
            closeModal(modal);
            await fetchAndRenderBoard(); // Re-render to show updated links
        } catch (error) {
            console.error('Error linking cards:', error);
            alert('Failed to link cards: ' + error.message);
        }
    };

    saveBtn.onclick = saveHandler;
    cancelBtn.onclick = () => closeModal(modal);
}
