const tagsContainer = document.getElementById("tagsContainer");

function createTagElement(tagText) {
  const tagElem = document.createElement("div");
  tagElem.className = "tag";
  tagElem.setAttribute("draggable", "true");
  tagElem.setAttribute("data-tag", tagText);

  const span = document.createElement("span");
  span.textContent = tagText;
  tagElem.appendChild(span);

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-tag";
  removeBtn.textContent = "×";
  removeBtn.addEventListener("click", () => {
    tagElem.parentElement.removeChild(tagElem);
    updateDuplicates(tagsContainer);
  });
  tagElem.appendChild(removeBtn);

  tagElem.addEventListener("dragstart", (e) => {
    tagElem.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tagText);
  });
  tagElem.addEventListener("dragend", () => {
    tagElem.classList.remove("dragging");
  });

  return tagElem;
}

function updateDuplicates(container) {
  const tagElements = container.querySelectorAll(".tag");
  const tagCount = {};
  tagElements.forEach((elem) => {
    const tag = elem.getAttribute("data-tag");
    tagCount[tag] = (tagCount[tag] || 0) + 1;
  });
  tagElements.forEach((elem) => {
    const tag = elem.getAttribute("data-tag");
    if (tagCount[tag] > 1) {
      elem.classList.add("duplicate");
    } else {
      elem.classList.remove("duplicate");
    }
  });
}

function addTag(tagText, container, checkForWikiData) {
  tagText = tagText.trim();
  if (tagText === "") return;
  const tagElem = createTagElement(tagText);
  container.appendChild(tagElem);
  updateDuplicates(container);

  // Immediately check for wiki data for this tag.
  if (typeof checkForWikiData === "function") {
    checkForWikiData(tagText, tagElem);
  }
}

function getPromptText(container) {
  const tagElements = container.querySelectorAll(".tag");
  const tags = Array.from(tagElements).map((elem) =>
    elem.getAttribute("data-tag")
  );
  return tags.map((tag) => tag.replace(/_/g, " ")).join(", ");
}

function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".tag:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function initDragAndDrop(container) {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = container.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientX);
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
}

// Function to clear all tags
function clearAllTags() {
  const tagsContainer = document.getElementById("tagsContainer");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
  }
}

function initTagsContainer(container) {
  // (Any container‑wide initialization can be done here.)
}

module.exports = {
  addTag,
  getPromptText,
  initDragAndDrop,
  initTagsContainer,
  clearAllTags,
};
