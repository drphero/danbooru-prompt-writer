// ipcHandlers.js
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

function registerIpcHandlers() {
  ipcMain.handle("get-tags", async () => {
    try {
      const filePath = path.join(__dirname, "tags.txt");
      const data = fs.readFileSync(filePath, "utf8");
      const lines = data.split("\n").filter((line) => line.trim() !== "");
      return lines.map((line) => {
        const [tag, number] = line.split(",");
        return { tag: tag.trim(), id: number.trim() };
      });
    } catch (err) {
      console.error("Error reading tags.txt:", err);
      return { error: "Unable to read tags.txt" };
    }
  });

  ipcMain.handle("fetch-wiki-page", async (event, tag) => {
    const url =
      "https://danbooru.donmai.us/wiki_pages/" + encodeURIComponent(tag);
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (err) {
      console.error("Error fetching wiki page for tag:", tag, err);
      throw err;
    }
  });

  ipcMain.handle("fetch-wiki-example", async (event, tag) => {
    const url =
      "https://danbooru.donmai.us/wiki_pages/" + encodeURIComponent(tag);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const htmlText = await response.text();
      const dom = new JSDOM(htmlText);
      const document = dom.window.document;
      const wikiBody = document.getElementById("wiki-page-body");
      if (!wikiBody) {
        console.error('The div with id "wiki-page-body" was not found.');
        return null;
      }
      let exampleH4 = null;
      const h4Elements = wikiBody.getElementsByTagName("h4");
      for (const h4 of h4Elements) {
        if (h4.textContent.trim() === "Example") {
          exampleH4 = h4;
          break;
        }
      }
      if (!exampleH4) {
        console.error('No <h4> with text "Example" was found.');
        return null;
      }
      const walker = document.createTreeWalker(
        wikiBody,
        dom.window.NodeFilter.SHOW_ELEMENT,
        null,
        false
      );
      walker.currentNode = exampleH4;
      let imgElement = null;
      while (walker.nextNode()) {
        const currentNode = walker.currentNode;
        if (
          currentNode.tagName &&
          currentNode.tagName.toLowerCase() === "img"
        ) {
          imgElement = currentNode;
          break;
        }
      }
      if (imgElement) {
        return imgElement.src;
      } else {
        console.error('No image found following the <h4> with text "Example".');
        return null;
      }
    } catch (error) {
      console.error("Error in fetch-wiki-example for tag:", tag, error);
      return null;
    }
  });

  ipcMain.handle("fetch-wiki-image", async (event, imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      const buffer = await response.buffer();
      const base64 = buffer.toString("base64");
      return `data:${contentType};base64,${base64}`;
    } catch (err) {
      console.error("Error fetching wiki image:", err);
      return null;
    }
  });

  ipcMain.handle("fetch-wiki-data", async (event, tag) => {
    const url =
      "https://danbooru.donmai.us/wiki_pages/" + encodeURIComponent(tag);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const htmlText = await response.text();
      const dom = new JSDOM(htmlText);
      const document = dom.window.document;
      const wikiBody = document.getElementById("wiki-page-body");
      if (!wikiBody) {
        console.error('The div with id "wiki-page-body" was not found.');
        return { imageUrl: null, description: null };
      }
      let paragraphs = [];
      for (let child of wikiBody.children) {
        if (child.tagName.toLowerCase() === "h4") break;
        if (child.tagName.toLowerCase() === "p") {
          paragraphs.push(child.textContent.trim());
        }
      }
      const descriptionText = paragraphs.join("\n");
      let exampleImageUrl = null;
      let exampleH4 = null;
      const h4s = wikiBody.getElementsByTagName("h4");
      for (let h4 of h4s) {
        if (h4.textContent.trim() === "Example") {
          exampleH4 = h4;
          break;
        }
      }
      if (exampleH4) {
        const walker = document.createTreeWalker(
          wikiBody,
          dom.window.NodeFilter.SHOW_ELEMENT,
          null,
          false
        );
        walker.currentNode = exampleH4;
        while (walker.nextNode()) {
          let node = walker.currentNode;
          if (node.tagName && node.tagName.toLowerCase() === "img") {
            exampleImageUrl = node.src;
            break;
          }
        }
      }
      return { imageUrl: exampleImageUrl, description: descriptionText };
    } catch (error) {
      console.error("Error fetching wiki data for tag:", tag, error);
      return { imageUrl: null, description: null };
    }
  });
}

module.exports = { registerIpcHandlers };
