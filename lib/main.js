const { CompositeDisposable, Disposable } = require("lumine");
const fs = require("fs");
const { validateDocument } = require("./validator");

/**
 * Linter SOFiSTiK Package
 * Provides linting for SOFiSTiK structural analysis files.
 * Validates module names and parses error position files.
 */
module.exports = {
  environmentProvider: null,
  subscriptions: null,
  linter: null,

  /**
   * Activates the package and registers linting commands.
   */
  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      lumine.commands.add("lumine-text-editor[data-grammar~='sofistik']:not([mini])", {
        "linter-sofistik:lint": {
          description: "Read the calculation log beside this file and report its errors.",
          didDispatch: () => this.lintErrorPositions(),
        },
      }),
    );
  },

  /**
   * Deactivates the package and disposes resources.
   */
  deactivate() {
    this.subscriptions.dispose();
    if (this.editorSub) {
      this.editorSub.dispose();
    }
    this.environmentProvider = null;
    this.linter = null;
  },

  /**
   * Consumes the linter indie service for manual error reporting.
   * @param {Function} registerIndie - The indie registration function
   */
  consumeLinterRegistry(registerIndie) {
    const linter = registerIndie({
      name: "SOFiSTiK post",
    });
    this.linter = linter;
    const registration = new Disposable(() => {
      linter.dispose();
      if (this.linter === linter) this.linter = null;
    });
    this.subscriptions.add(registration);
    return registration;
  },

  /**
   * Consumes the SOFiSTiK environment service, which provides the keyword
   * context selected for each file.
   * @param {Object} service - The environment service object
   */
  consumeSofistikEnvironment(service) {
    const provider = service.provider;
    this.environmentProvider = provider;
    return new Disposable(() => {
      if (this.environmentProvider === provider) this.environmentProvider = null;
    });
  },

  /**
   * Provides the linter interface for automatic module name validation.
   * @returns {Object} Linter provider configuration
   */
  provideLinter() {
    return {
      name: "SOFiSTiK code",
      scope: "file",
      lintsOnChange: true,
      grammarScopes: ["source.sofistik"],
      lint: (textEditor) => {
        return this.lintModuleNames(textEditor);
      },
    };
  },

  /**
   * Parses and displays errors from the .error_positions file.
   */
  lintErrorPositions() {
    if (!this.linter) {
      return;
    }

    this.linter.clearMessages();
    const editor = lumine.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }

    const editorPath = editor.getPath();
    const linterPath = editorPath.replace(/\.[^.]+$/, ".error_positions");
    let messages = [];

    try {
      const data = fs.readFileSync(linterPath, { encoding: "utf8" }).split(/\n/g);

      for (let text of data) {
        try {
          if (!text.trim()) {
            continue;
          }
          const obj = JSON.parse(text);

          // Build error message
          messages.push({
            linterName: `#${obj.errornumber}`,
            severity: obj.isError ? "error" : "info",
            excerpt: obj.position.text,
            location: {
              file: editorPath,
              position: [
                [obj.position.line - 1, 0],
                [obj.position.line - 1, 1e9],
              ],
            },
          });
        } catch {
          // Silently ignore parse errors in .error_positions file
        }
      }
    } catch {
      // Silently handle missing .error_positions file (expected before running SOFiSTiK)
      return;
    }

    if (!messages.length) {
      return;
    }

    // Set messages and jump to first error
    this.linter.setAllMessages(messages);
    const firstError = messages.find((msg) => msg.severity === "error") || messages[0];
    editor.setCursorBufferPosition([firstError.location.position[0][0], 0]);

    // Clear messages on editor change
    if (this.editorSub) {
      this.editorSub.dispose();
    }
    this.editorSub = editor.onDidChange(() => {
      this.linter.clearMessages();
      this.editorSub.dispose();
    });
  },

  /**
   * Validates module names in the editor using the environment's keyword context.
   * @param {TextEditor} editor - The text editor to lint
   * @returns {Array} Array of validation messages
   */
  lintModuleNames(editor) {
    if (!editor || !this.environmentProvider) {
      return [];
    }

    const editorPath = editor.getPath();
    if (!editorPath) {
      return [];
    }

    const keywords = this.environmentProvider.getKeywordContext({ editor });
    if (!keywords) {
      return [];
    }

    return validateDocument(editor, keywords);
  },
};
