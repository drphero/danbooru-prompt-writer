const { ipcRenderer } = require("electron");
const { debounce } = require("./utils");

let availableTags = [];
const queryCache = {};

async function loadAvailableTags() {
  try {
    const data = await ipcRenderer.invoke("get-tags");
    if (data.error) {
      console.error(data.error);
    } else {
      availableTags = data.map((item) => ({
        ...item,
        normalized: item.tag.toLowerCase().replace(/_/g, " "),
      }));
    }
  } catch (err) {
    console.error(err);
  }
}

function initSuggestions(tagInput, suggestionsBox, addTag) {
  tagInput.addEventListener(
    "input",
    debounce(() => {
      const query = tagInput.value.trim().toLowerCase();
      suggestionsBox.innerHTML = "";
      if (query === "") {
        suggestionsBox.style.display = "none";
        return;
      }
      let suggestions;
      if (queryCache[query]) {
        suggestions = queryCache[query];
      } else {
        suggestions = availableTags.filter((item) =>
          item.normalized.includes(query)
        );
        queryCache[query] = suggestions;
      }
      suggestions = suggestions.slice(0, 10);
      suggestions.forEach((suggestion) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = `${suggestion.tag} (${suggestion.id})`;
        item.addEventListener("click", () => {
          addTag(suggestion.tag);
          tagInput.value = "";
          suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(item);
      });
      suggestionsBox.style.display = suggestions.length > 0 ? "block" : "none";
    }, 100)
  );
}

module.exports = { loadAvailableTags, initSuggestions };
