function loadSavedPrompts(savedPromptsList, tagsContainer, addTag) {
  savedPromptsList.innerHTML = "";
  let savedPrompts = JSON.parse(localStorage.getItem("savedPrompts")) || [];
  savedPrompts.forEach((promptObj, index) => {
    const li = document.createElement("li");
    li.textContent = promptObj.name;

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => {
      tagsContainer.innerHTML = "";
      promptObj.tags.forEach((tag) => {
        addTag(tag);
      });
    });
    li.appendChild(loadBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this prompt?")) {
        savedPrompts.splice(index, 1);
        localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
        loadSavedPrompts(savedPromptsList, tagsContainer, addTag);
      }
    });
    li.appendChild(deleteBtn);

    savedPromptsList.appendChild(li);
  });
}

function initPromptHandlers({
  savePromptBtn,
  promptNameInput,
  tagsContainer,
  savedPromptsList,
  importPromptsBtn,
  importFileInput,
  exportPromptsBtn,
  addTag,
}) {
  // Save prompt button
  savePromptBtn.addEventListener("click", () => {
    const name = promptNameInput.value.trim();
    if (name === "") {
      alert("Please enter a name for the prompt.");
      return;
    }
    const tagElements = tagsContainer.querySelectorAll(".tag");
    const tags = Array.from(tagElements).map((elem) =>
      elem.getAttribute("data-tag")
    );
    const promptObj = { name, tags };
    let savedPrompts = JSON.parse(localStorage.getItem("savedPrompts")) || [];
    const existingIndex = savedPrompts.findIndex((p) => p.name === name);
    if (existingIndex > -1) {
      if (
        !confirm(
          "A prompt with this name already exists. Do you want to replace it?"
        )
      )
        return;
      savedPrompts[existingIndex] = promptObj;
    } else {
      savedPrompts.push(promptObj);
    }
    localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
    promptNameInput.value = "";
    loadSavedPrompts(savedPromptsList, tagsContainer, addTag);
  });

  // Export prompts button
  exportPromptsBtn.addEventListener("click", () => {
    let savedPrompts = localStorage.getItem("savedPrompts");
    if (!savedPrompts) {
      alert("No saved prompts to export.");
      return;
    }
    const blob = new Blob([savedPrompts], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_prompts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Import prompts button
  importPromptsBtn.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPrompts = JSON.parse(e.target.result);
        if (!Array.isArray(importedPrompts)) {
          alert("The imported file is not in the expected format.");
          return;
        }
        localStorage.setItem("savedPrompts", JSON.stringify(importedPrompts));
        loadSavedPrompts(savedPromptsList, tagsContainer, addTag);
        alert("Prompts imported successfully!");
      } catch (err) {
        alert("Error importing JSON file.");
      }
    };
    reader.readAsText(file);
  });

  // Initially load any saved prompts
  loadSavedPrompts(savedPromptsList, tagsContainer, addTag);
}

module.exports = { initPromptHandlers };
