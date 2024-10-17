import * as vscode from "vscode";
import { createMinInterface } from "../parse";
import assert from "assert";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Props", () => {
    const item = createMinInterface(
      __dirname + "/testFiles/props.ts",
      "getName",
      "props",
      "Car"
    );
    assert.strictEqual(
      "interface CarMin {\n" +
        "  manufacturer: {\n" +
        "    name: string\n" +
        "  }\n" +
        "}",
      item
    );
  });
});
