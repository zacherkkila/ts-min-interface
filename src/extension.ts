import * as vscode from "vscode";
import { createMinInterface } from "./parse";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "ts-min-interface" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "ts-min-interface.createMinInterface",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        let document = editor.document;
        let selection = editor.selection;
        // Get the selected text
        let text = document.getText(selection);

        // Get the file path and name
        let filePath = document.fileName;

        // Extract function name and argument name from the selected text
        const functionMatch = text.match(/function\s+(\w+)\s*\((\w+)/);
        const arrowFunctionMatch = text.match(
          /(?:const|let)\s+(\w+)\s*=\s*\((\w+)/
        );

        let functionName, argumentName;
        if (functionMatch) {
          [, functionName, argumentName] = functionMatch;
        } else if (arrowFunctionMatch) {
          [, functionName, argumentName] = arrowFunctionMatch;
        } else {
          throw new Error("Could not extract function and argument names");
        }

        try {
          await vscode.env.clipboard.writeText(
            createMinInterface(filePath, functionName, argumentName, text)
          );

          vscode.window.showInformationMessage(
            `Minimal Interface Copied to Clipboard`
          );
        } catch (err) {
          if (err instanceof Error) {
            vscode.window.showErrorMessage(err.message);
          } else {
            vscode.window.showErrorMessage("An unknown error occurred");
          }
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
