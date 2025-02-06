const { ipcRenderer } = require("electron");

const wikiCache = {};

function checkForWikiData(tag, tagElem) {
  if (wikiCache[tag]) {
    const result = wikiCache[tag];
    if (result.imageUrl) {
      addWikiIcon(tagElem, result.imageUrl);
    }
    if (result.description && result.description.trim() !== "") {
      addWikiDescriptionIcon(tagElem, result.description, tag);
    }
    return;
  }

  ipcRenderer
    .invoke("fetch-wiki-data", tag)
    .then((result) => {
      wikiCache[tag] = result; // Cache the result
      if (result.imageUrl) {
        addWikiIcon(tagElem, result.imageUrl);
      }
      if (result.description && result.description.trim() !== "") {
        addWikiDescriptionIcon(tagElem, result.description, tag);
      }
    })
    .catch((error) => {
      console.error("Error fetching wiki data for tag:", tag, error);
      wikiCache[tag] = { imageUrl: null, description: null };
    });
}

function addWikiIcon(tagElem, imageUrl) {
  if (tagElem.querySelector(".wiki-icon")) return;

  const icon = document.createElement("img");
  icon.className = "wiki-icon";
  icon.title = "Show example image";
  icon.src = "assets/image.png";
  icon.style.cursor = "pointer";

  const removeBtn = tagElem.querySelector(".remove-tag");
  tagElem.insertBefore(icon, removeBtn);

  icon.addEventListener("click", () => {
    openWikiModal(imageUrl);
  });
}

function addWikiDescriptionIcon(tagElem, descriptionText, tag) {
  if (tagElem.querySelector(".wiki-description-icon")) return;

  const icon = document.createElement("img");
  icon.className = "wiki-description-icon";
  icon.src = "assets/info.png";
  icon.title = "Show tag description";
  icon.style.cursor = "pointer";

  const removeBtn = tagElem.querySelector(".remove-tag");
  tagElem.insertBefore(icon, removeBtn);

  icon.addEventListener("click", () => {
    openWikiDescriptionModal(descriptionText, tag);
  });
}

function openWikiModal(imageUrl) {
  ipcRenderer
    .invoke("fetch-wiki-image", imageUrl)
    .then((dataUrl) => {
      if (!dataUrl) {
        console.error("Failed to retrieve image data");
        return;
      }
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "wiki-modal-overlay";

      const modalContent = document.createElement("div");
      modalContent.className = "wiki-modal-content";

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.className = "wiki-modal-close";
      closeButton.addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
      });

      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = "Example image";

      modalContent.appendChild(closeButton);
      modalContent.appendChild(img);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);
    })
    .catch((err) => {
      console.error("Error loading image via IPC:", err);
    });
}

function openWikiDescriptionModal(descriptionText, tag) {
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "wiki-modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "wiki-modal-content";

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className = "wiki-modal-close";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modalOverlay);
  });

  const descriptionDiv = document.createElement("div");
  descriptionDiv.className = "wiki-description-content";
  descriptionDiv.textContent = descriptionText;

  const openWikiButton = document.createElement("button");
  openWikiButton.textContent = "Open Wiki Page";
  openWikiButton.className = "wiki-open-button";
  openWikiButton.addEventListener("click", () => {
    const { shell } = require("electron");
    const wikiUrl =
      "https://danbooru.donmai.us/wiki_pages/" + encodeURIComponent(tag);
    shell.openExternal(wikiUrl);
  });

  modalContent.appendChild(closeButton);
  modalContent.appendChild(descriptionDiv);
  modalContent.appendChild(openWikiButton);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

module.exports = {
  checkForWikiData,
  addWikiIcon,
  addWikiDescriptionIcon,
  openWikiModal,
  openWikiDescriptionModal,
};
