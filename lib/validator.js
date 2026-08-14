/**
 * Validates SOFiSTiK document for module name errors
 * @param {TextEditor} editor - text editor instance
 * @param {Object} keywords - Keywords bound to the release this file is for
 * @returns {Array} Array of linter messages
 */
function validateDocument(editor, keywords) {
  const messages = [];
  const text = editor.getText();
  const lines = text.split("\n");

  if (!keywords || typeof keywords.getModuleNames !== "function") {
    return messages;
  }

  const validModules = keywords.getModuleNames();
  if (!validModules || validModules.length === 0) {
    return messages;
  }

  // Regex to match module declarations (e.g., +PROG, -PROG, $PROG, PROG)
  const moduleRegex = /^\s*[+\-$]?PROG\s+(\w+)/i;

  lines.forEach((line, lineIndex) => {
    const match = line.match(moduleRegex);
    if (match) {
      const moduleName = match[1].toUpperCase();

      // Check if module name is valid
      if (!validModules.includes(moduleName)) {
        const columnStart = line.indexOf(match[1]);
        messages.push({
          severity: "error",
          excerpt: `Unknown SOFiSTiK module: ${moduleName}`,
          location: {
            file: editor.getPath(),
            position: [
              [lineIndex, columnStart],
              [lineIndex, columnStart + match[1].length],
            ],
          },
        });
      }
    }
  });

  return messages;
}

module.exports = {
  validateDocument,
};
