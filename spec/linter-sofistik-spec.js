const path = require("path");

describe("linter-sofistik", () => {
  let mainModule, workspaceElement;

  beforeEach(async () => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    // The package defers activation until the SOFiSTiK grammar is used.
    atom.packages.triggerDeferredActivationHooks();
    atom.packages.triggerActivationHook("language-sofistik:grammar-used");
    mainModule = (await atom.packages.activatePackage("linter-sofistik")).mainModule;
  });

  describe("linter provider", () => {
    it("exposes the shape expected by the linter service", () => {
      const provider = mainModule.provideLinter();
      expect(provider.name).toBe("SOFiSTiK code");
      expect(provider.scope).toBe("file");
      expect(provider.lintsOnChange).toBe(true);
      expect(provider.grammarScopes).toEqual(["source.sofistik"]);
      expect(typeof provider.lint).toBe("function");
    });
  });

  describe("module name validation", () => {
    let editor;

    beforeEach(async () => {
      editor = await atom.workspace.open(path.join(__dirname, "fixtures", "sample.dat"));
    });

    function stubKeywords(moduleNames) {
      mainModule.consumeSofistikKeywords({
        name: "sofistik-keywords",
        version: "1.0.0",
        provider: {
          withContext: () => ({ getModuleNames: () => moduleNames }),
        },
      });
    }

    it("returns no messages when every module name is known", () => {
      stubKeywords(["AQUA", "ASE"]);
      expect(mainModule.provideLinter().lint(editor)).toEqual([]);
    });

    it("reports unknown module names with their position", () => {
      stubKeywords(["ASE"]);
      editor.setText("+PROG AQUA\n-PROG ASE\nPROG WRONG\n");

      const messages = mainModule.provideLinter().lint(editor);
      expect(messages.length).toBe(2);
      expect(messages[0].severity).toBe("error");
      expect(messages[0].excerpt).toBe("Unknown SOFiSTiK module: AQUA");
      expect(messages[0].location.file).toBe(editor.getPath());
      expect(messages[0].location.position).toEqual([
        [0, 6],
        [0, 10],
      ]);
      expect(messages[1].excerpt).toBe("Unknown SOFiSTiK module: WRONG");
      expect(messages[1].location.position).toEqual([
        [2, 5],
        [2, 10],
      ]);
    });

    it("returns no messages without a keywords provider", () => {
      mainModule.keywordsProvider = null;
      expect(mainModule.provideLinter().lint(editor)).toEqual([]);
    });
  });

  describe("linter-sofistik:lint", () => {
    let editor, delegate;

    beforeEach(async () => {
      editor = await atom.workspace.open(path.join(__dirname, "fixtures", "sample.dat"));

      delegate = {
        name: "SOFiSTiK post",
        messages: null,
        cleared: 0,
        setAllMessages(messages) {
          this.messages = messages;
        },
        clearMessages() {
          this.cleared++;
        },
        dispose() {},
      };
      mainModule.consumeIndie((options) => {
        expect(options.name).toBe("SOFiSTiK post");
        return delegate;
      });
    });

    it("parses the .error_positions file and jumps to the first error", () => {
      mainModule.lintErrorPositions();

      expect(delegate.messages.length).toBe(2);
      expect(delegate.messages[0].severity).toBe("info");
      expect(delegate.messages[0].excerpt).toBe("Some note");
      expect(delegate.messages[1].severity).toBe("error");
      expect(delegate.messages[1].excerpt).toBe("Error in AQUA input");
      expect(delegate.messages[1].location.file).toBe(editor.getPath());
      expect(delegate.messages[1].location.position[0]).toEqual([1, 0]);

      // The cursor jumps to the first error-severity message.
      expect(editor.getCursorBufferPosition().row).toBe(1);
    });

    it("clears the messages when the editor changes", () => {
      mainModule.lintErrorPositions();
      const clearedBefore = delegate.cleared;

      editor.insertText("x");
      expect(delegate.cleared).toBe(clearedBefore + 1);
    });

    it("keeps quiet when no .error_positions file exists", async () => {
      await atom.workspace.open(path.join(__dirname, "fixtures", "missing.dat"));
      delegate.messages = null;
      mainModule.lintErrorPositions();
      expect(delegate.messages).toBeNull();
    });
  });
});
