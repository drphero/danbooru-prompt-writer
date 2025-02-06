document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const tagInput = document.getElementById("tagInput");
  const tagsContainer = document.getElementById("tagsContainer");
  const suggestionsBox = document.getElementById("suggestions");
  const copyPromptBtn = document.getElementById("copyPrompt");
  const savePromptBtn = document.getElementById("savePrompt");
  const promptNameInput = document.getElementById("promptName");
  const savedPromptsList = document.getElementById("savedPromptsList");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const exportPromptsBtn = document.getElementById("exportPrompts");
  const importPromptsBtn = document.getElementById("importPrompts");
  const importFileInput = document.getElementById("importFile");

  // Initialize Dark Mode
  const darkMode = require("./modules/darkMode");
  darkMode.initDarkMode(darkModeToggle);

  // Import wiki-related functions
  const wiki = require("./modules/wiki");

  // Import tag management functions
  const tags = require("./modules/tags");

  // Initialize tag container (if needed) and drag & drop
  tags.initTagsContainer(tagsContainer);
  tags.initDragAndDrop(tagsContainer);

  // Load available tags for suggestions and initialize suggestion handling
  const suggestions = require("./modules/suggestions");
  suggestions.loadAvailableTags().then(() => {
    suggestions.initSuggestions(tagInput, suggestionsBox, (tagText) =>
      tags.addTag(tagText, tagsContainer, wiki.checkForWikiData)
    );
  });

  // When pressing Enter or comma in the tag input, add tag(s)
  tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      let inputValue = tagInput.value;
      let parts = inputValue.split(",");
      parts.forEach((part) => {
        tags.addTag(part, tagsContainer, wiki.checkForWikiData);
      });
      tagInput.value = "";
      suggestionsBox.style.display = "none";
    }
  });

  // "Copy Prompt" button handler
  copyPromptBtn.addEventListener("click", () => {
    const promptText = tags.getPromptText(tagsContainer);
    navigator.clipboard
      .writeText(promptText)
      .catch((err) => alert("Error copying to clipboard."));
  });

  // Initialize prompt-related handlers
  const prompts = require("./modules/prompts");
  prompts.initPromptHandlers({
    savePromptBtn,
    promptNameInput,
    tagsContainer,
    savedPromptsList,
    importPromptsBtn,
    importFileInput,
    exportPromptsBtn,
    addTag: (tag) => tags.addTag(tag, tagsContainer, wiki.checkForWikiData),
  });
});
