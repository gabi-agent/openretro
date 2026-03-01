// frontend/js/drag-drop.js

import { api } from './api.js';

let draggedCard = null;

function setupDragAndDrop() {
    document.querySelectorAll('.card-list').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault(); // Allow drop
            const droppedOnElement = e.target.closest('.card-item, .card-list');
            const draggable = document.querySelector('.dragging');
            
            if (draggable && droppedOnElement) {
                // Remove previous feedback
                document.querySelectorAll('.drag-feedback').forEach(el => el.remove());
                document.querySelectorAll('.target-highlight').forEach(el => el.classList.remove('target-highlight'));

                const feedbackDiv = document.createElement('div');
                feedbackDiv.classList.add('drag-feedback', 'absolute', 'top-0', 'left-1/2', '-translate-x-1/2', 'bg-blue-500', 'text-white', 'px-2', 'py-1', 'rounded-md', 'text-xs', 'z-10');

                if (droppedOnElement.classList.contains('card-item') && droppedOnElement.dataset.cardId !== draggable.dataset.cardId) {
                    feedbackDiv.textContent = 'Merge here';
                    droppedOnElement.classList.add('target-highlight', 'border-2', 'border-blue-500'); // Highlight target card
                } else if (droppedOnElement.classList.contains('card-list')) {
                    feedbackDiv.textContent = 'Move here';
                    droppedOnElement.classList.add('target-highlight', 'border-2', 'border-gray-400'); // Highlight column
                }
                
                if (droppedOnElement.classList.contains('card-item')) {
                    droppedOnElement.style.position = 'relative'; // Ensure feedbackDiv positions correctly
                    droppedOnElement.appendChild(feedbackDiv);
                } else if (droppedOnElement.classList.contains('card-list')) {
                    // For column, position it at the top-center of the list area
                    const listArea = droppedOnElement.querySelector('.card-list');
                    if (listArea) {
                        listArea.style.position = 'relative';
                        listArea.appendChild(feedbackDiv);
                    }
                }

                const afterElement = getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    column.appendChild(draggable);
                } else {
                    column.insertBefore(draggable, afterElement);
                }
            }
        });

        column.addEventListener('dragleave', () => {
            // Clean up feedback when dragging leaves the column
            document.querySelectorAll('.drag-feedback').forEach(el => el.remove());
            document.querySelectorAll('.target-highlight').forEach(el => el.classList.remove('target-highlight'));
        });

        column.addEventListener('drop', async e => {
            e.preventDefault();
            // Clean up feedback on drop
            document.querySelectorAll('.drag-feedback').forEach(el => el.remove());
            document.querySelectorAll('.target-highlight').forEach(el => el.classList.remove('target-highlight'));

            const droppedOnElement = e.target.closest('.card-item, .card-list');

            if (draggedCard) {
                const sourceCardId = draggedCard.dataset.cardId;

                if (droppedOnElement && droppedOnElement.classList.contains('card-item') && droppedOnElement.dataset.cardId !== sourceCardId) {
                    // Dropped on another card: MERGE
                    const targetCardId = droppedOnElement.dataset.cardId;
                    try {
                        await api.mergeCards(sourceCardId, targetCardId);
                        // Frontend will re-render board via polling after merge
                        console.log(`Card ${sourceCardId} merged into ${targetCardId}`);
                    } catch (error) {
                        console.error('Error merging cards:', error);
                        alert('Failed to merge cards: ' + error.message);
                    } finally {
                        draggedCard?.classList.remove('dragging');
                        draggedCard = null;
                    }
                } else {
                    // Dropped in column background or on self: CHANGE POSITION/COLUMN
                    const newColumnType = column.dataset.columnType;
                    const newPosition = Array.from(column.children).indexOf(draggedCard);

                    // Update position and column_type via API
                    try {
                        await api.updateCard(sourceCardId, { column_type: newColumnType, position: newPosition });
                        console.log(`Card ${sourceCardId} moved to ${newColumnType} at position ${newPosition}`);
                    } catch (error) {
                        console.error('Error updating card position/column:', error);
                        alert('Failed to update card: ' + error.message);
                        // For simplicity, we just log here. A more robust app would revert.
                    } finally {
                        draggedCard?.classList.remove('dragging');
                        draggedCard = null;
                    }
                }
            }
        });
    });

    document.addEventListener('dragstart', e => {
        if (e.target.classList.contains('card-item')) {
            draggedCard = e.target;
            draggedCard.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.target.dataset.cardId);
        }
    });

    document.addEventListener('dragend', e => {
        if (e.target.classList.contains('card-item')) {
            e.target.classList.remove('dragging');
            draggedCard = null;
        }
    });
}

function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.card-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

export { setupDragAndDrop };
