document.addEventListener("DOMContentLoaded", () => {
  const boardContainer = document.getElementById("boardContainer");
  let draggedItem = null;
  let draggedItemBoard = null;
  let touchStartY = 0;
  let touchStartX = 0;

  // Load data from localStorage or use initial data
  let boards = JSON.parse(localStorage.getItem("boards")) || [
    {
      id: 1,
      title: "To do",
      cards: [
        {
          title: "Cats",
          description:
            "Don't forget to clean the litter box and feed them at 6:00 AM before leaving.",
        },
        {
          title: "Cook",
          description: "Prepare lunch for several workdays and freeze it.",
        },
      ],
    },
    {
      id: 2,
      title: "In progress",
      cards: [
        {
          title: "Programming",
          description:
            "Create a task planner to better organize my daily goals.",
        },
      ],
    },
    {
      id: 3,
      title: "Completed",
      cards: [
        {
          title: "Laundry",
          description: "Wash and dry the clothes in the laundry basket.",
        },
        {
          title: "Fasting",
          description:
            "Complete intermittent fasting for at least 16 hours. Break it with unsweetened plain yogurt and nuts.",
        },
      ],
    },
  ];

  // Render initial boards
  renderBoards();

  function renderBoards() {
    boardContainer.innerHTML = "";
    boards.forEach((board) => {
      const boardElement = createBoard(board);
      boardContainer.appendChild(boardElement);
    });
    addEventListeners();
  }

  function createBoard(board) {
    const boardElement = document.createElement("div");
    boardElement.className = "board";
    boardElement.dataset.boardId = board.id;
    boardElement.innerHTML = `
      <h2 class="board__title">${board.title}</h2>
      <div class="board__card-list">
        ${
          board.cards.length === 0
            ? '<p class="board__empty-message">Empty category.</p>'
            : ""
        }
      </div>
      <button class="board__add-card-btn">+ Add</button>
    `;

    const cardList = boardElement.querySelector(".board__card-list");
    board.cards.forEach((cardData) => {
      const card = createCard(cardData);
      cardList.appendChild(card);
    });

    return boardElement;
  }

  function createCard(cardData) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.innerHTML = `
      <div class="card__header">
        <div class="card__title">${cardData.title}</div>
        <div class="card__actions">
          <button class="card__edit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="card__close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="card__description">${cardData.description}</div>
    `;

    return card;
  }

  function addEventListeners() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      // Set up drag events for desktop
      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragend", handleDragEnd);

      // Set up touch events for mobile
      card.addEventListener("touchstart", handleTouchStart, { passive: false });
      card.addEventListener("touchmove", handleTouchMove, { passive: false });
      card.addEventListener("touchend", handleTouchEnd);

      // Set up close button
      const closeBtn = card.querySelector(".card__close-btn");
      closeBtn.addEventListener("click", handleCardClose);

      // Set up edit button
      const editBtn = card.querySelector(".card__edit-btn");
      editBtn.addEventListener("click", handleCardEdit);
    });

    // Add new card
    const addCardBtns = document.querySelectorAll(".board__add-card-btn");
    addCardBtns.forEach((btn) => {
      btn.addEventListener("click", handleAddCard);
    });

    // Drag and drop functionality for desktop
    boardContainer.addEventListener("dragover", handleDragOver);
    boardContainer.addEventListener("dragend", updateBoardsData);
  }

  function handleDragStart(e) {
    draggedItem = e.target.closest(".card");
    draggedItemBoard = draggedItem.closest(".board");
    setTimeout(() => {
      draggedItem.style.opacity = "0.5";
    }, 0);
  }

  function handleDragEnd() {
    setTimeout(() => {
      draggedItem.style.opacity = "1";
      draggedItem = null;
      draggedItemBoard = null;
      updateBoardsData();
    }, 0);
  }

  function handleTouchStart(e) {
    draggedItem = e.target.closest(".card");
    draggedItemBoard = draggedItem.closest(".board");
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    setTimeout(() => {
      draggedItem.style.opacity = "0.5";
    }, 0);
  }

  function handleTouchMove(e) {
    if (!draggedItem) return;
    e.preventDefault();
    const touch = e.touches[0];
    const touchY = touch.clientY;
    const touchX = touch.clientX;

    draggedItem.style.position = "fixed";
    draggedItem.style.top = `${touchY - draggedItem.offsetHeight / 2}px`;
    draggedItem.style.left = `${touchX - draggedItem.offsetWidth / 2}px`;
    draggedItem.style.zIndex = "1000";

    const targetElement = document.elementFromPoint(touchX, touchY);
    const cardList = targetElement.closest(".board__card-list");

    if (cardList) {
      const afterElement = getDragAfterElement(cardList, touchY);
      if (afterElement == null) {
        cardList.appendChild(draggedItem);
      } else {
        cardList.insertBefore(draggedItem, afterElement);
      }
    }
  }

  function handleTouchEnd(e) {
    if (!draggedItem) return;
    e.preventDefault();
    draggedItem.style.opacity = "1";
    draggedItem.style.position = "static";
    draggedItem.style.zIndex = "auto";
    draggedItem = null;
    draggedItemBoard = null;
    updateBoardsData();
  }

  function handleCardClose(e) {
    const card = e.target.closest(".card");
    card.remove();
    updateBoardsData();
  }

  function handleCardEdit(e) {
    const card = e.target.closest(".card");
    openEditModal(card);
  }

  function handleAddCard(e) {
    const boardId = parseInt(e.target.closest(".board").dataset.boardId);
    openAddCardModal(boardId);
  }

  function handleDragOver(e) {
    e.preventDefault();
    const cardList = e.target.closest(".board__card-list");
    if (cardList && draggedItem) {
      const afterElement = getDragAfterElement(cardList, e.clientY);
      if (afterElement == null) {
        cardList.appendChild(draggedItem);
      } else {
        cardList.insertBefore(draggedItem, afterElement);
      }
    }
  }

  function handleSaveAction(modal, saveCallback) {
    const titleInput = modal.querySelector(".modal__title-input");
    const descriptionInput = modal.querySelector(".modal__description-input");
    const newTitle = titleInput.value.trim();
    const newDescription = descriptionInput.value.trim();

    let errorMessage = "";

    if (!newTitle && !newDescription) {
      errorMessage = "You must enter both title and description.";
    } else if (!newTitle) {
      errorMessage = "You must enter a title.";
    } else if (!newDescription) {
      errorMessage = "You must enter a description.";
    }

    if (errorMessage) {
      showError(descriptionInput, errorMessage);
    } else {
      clearError(descriptionInput);
      saveCallback(newTitle, newDescription);
      closeModal(modal);
    }
  }

  function openEditModal(card) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal__content">
        <h2>Edit</h2>
        <div class="modal__input-group">
          <input type="text" class="modal__title-input" value="${
            card.querySelector(".card__title").textContent
          }" required>
        </div>
        <div class="modal__input-group">
          <textarea class="modal__description-input" required>${
            card.querySelector(".card__description").textContent
          }</textarea>
          <div class="modal__error-container modal__error-container--description">
            <div class="modal__error-message"></div>
          </div>
        </div>
        <div class="modal__actions">
          <button class="modal__save-btn">Save</button>
          <button class="modal__cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const saveBtn = modal.querySelector(".modal__save-btn");
    const cancelBtn = modal.querySelector(".modal__cancel-btn");
    const titleInput = modal.querySelector(".modal__title-input");
    const descriptionInput = modal.querySelector(".modal__description-input");

    const saveCallback = (newTitle, newDescription) => {
      card.querySelector(".card__title").textContent = newTitle;
      card.querySelector(".card__description").textContent = newDescription;
      updateBoardsData();
    };

    saveBtn.addEventListener("click", () =>
      handleSaveAction(modal, saveCallback)
    );

    cancelBtn.addEventListener("click", () => {
      closeModal(modal);
    });

    // Add keydown event listener to the entire modal
    modal.addEventListener("keydown", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSaveAction(modal, saveCallback);
      } else if (e.key === "Escape") {
        closeModal(modal);
      }
    });

    // Set focus to the title input when the modal opens
    setTimeout(() => titleInput.focus(), 0);

    // Configure error message positions
    configureErrorMessagePositions(modal);
  }

  function openAddCardModal(boardId) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal__content">
        <h2>Add</h2>
        <div class="modal__input-group">
          <input type="text" class="modal__title-input" placeholder="Enter a title" required>
        </div>
        <div class="modal__input-group">
          <textarea class="modal__description-input" placeholder="Enter a description" required></textarea>
          <div class="modal__error-container modal__error-container--description">
            <div class="modal__error-message"></div>
          </div>
        </div>
        <div class="modal__actions">
          <button class="modal__save-btn">Save</button>
          <button class="modal__cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const saveBtn = modal.querySelector(".modal__save-btn");
    const cancelBtn = modal.querySelector(".modal__cancel-btn");
    const titleInput = modal.querySelector(".modal__title-input");
    const descriptionInput = modal.querySelector(".modal__description-input");

    const saveCallback = (newTitle, newDescription) => {
      const board = boards.find((b) => b.id === boardId);
      const newCard = { title: newTitle, description: newDescription };
      board.cards.push(newCard);
      const cardElement = createCard(newCard);
      const boardElement = document.querySelector(
        `.board[data-board-id="${boardId}"]`
      );
      const cardList = boardElement.querySelector(".board__card-list");
      const emptyMessage = cardList.querySelector(".board__empty-message");
      if (emptyMessage) {
        emptyMessage.remove();
      }
      cardList.appendChild(cardElement);
      addEventListeners();
      updateBoardsData();
    };

    saveBtn.addEventListener("click", () =>
      handleSaveAction(modal, saveCallback)
    );

    cancelBtn.addEventListener("click", () => {
      closeModal(modal);
    });

    // Add keydown event listener to the entire modal
    modal.addEventListener("keydown", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSaveAction(modal, saveCallback);
      } else if (e.key === "Escape") {
        closeModal(modal);
      }
    });

    // Set focus to the title input when the modal opens
    setTimeout(() => titleInput.focus(), 0);

    // Configure error message positions
    configureErrorMessagePositions(modal);
  }

  function showError(input, message) {
    const errorContainer = input.nextElementSibling;
    if (
      errorContainer &&
      errorContainer.classList.contains("modal__error-container")
    ) {
      const errorElement = errorContainer.querySelector(
        ".modal__error-message"
      );
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
      }
    }
    input.classList.add("modal__input-error");
  }

  function clearError(input) {
    const errorContainer = input.nextElementSibling;
    if (
      errorContainer &&
      errorContainer.classList.contains("modal__error-container")
    ) {
      const errorElement = errorContainer.querySelector(
        ".modal__error-message"
      );
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
      }
    }
    input.classList.remove("modal__input-error");
  }

  function configureErrorMessagePositions(modal) {
    const descriptionErrorContainer = modal.querySelector(
      ".modal__error-container--description"
    );

    if (descriptionErrorContainer) {
      const descriptionErrorMessage = descriptionErrorContainer.querySelector(
        ".modal__error-message"
      );
      if (descriptionErrorMessage) {
        descriptionErrorMessage.style.width = "100%";
      }
    }
  }

  function closeModal(modal) {
    modal.remove();
  }

  function getDragAfterElement(cardList, y) {
    const draggableElements = [
      ...cardList.querySelectorAll(".card:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function updateBoardsData() {
    const boardElements = document.querySelectorAll(".board");
    boards = Array.from(boardElements).map((boardElement) => {
      const boardId = parseInt(boardElement.dataset.boardId);
      const title = boardElement.querySelector(".board__title").textContent;
      const cardList = boardElement.querySelector(".board__card-list");
      const cardElements = cardList.querySelectorAll(".card");
      const cards = Array.from(cardElements).map((card) => ({
        title: card.querySelector(".card__title").textContent,
        description: card.querySelector(".card__description").textContent,
      }));

      return { id: boardId, title, cards };
    });

    boardElements.forEach((boardElement) => {
      const cardList = boardElement.querySelector(".board__card-list");
      const cards = cardList.querySelectorAll(".card");
      const emptyMessage = cardList.querySelector(".board__empty-message");

      if (cards.length === 0 && !emptyMessage) {
        cardList.innerHTML =
          '<p class="board__empty-message">Empty category.</p>';
      } else if (cards.length > 0 && emptyMessage) {
        emptyMessage.remove();
      }
    });

    // Save to localStorage
    localStorage.setItem("boards", JSON.stringify(boards));
  }
});
