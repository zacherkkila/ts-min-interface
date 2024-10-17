import * as vscode from "vscode";
import { createMinInterface } from "../parse";
import assert from "assert";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  console.log(__dirname + "/test/testFiles/inlineDefinition.ts");

  test("Inline Definition", () => {
    const item = createMinInterface(
      __dirname + "/testFiles/inlineDefinition.ts",
      "Car"
    );
    assert.strictEqual(
      "interface CarMin {\n" +
        "  model: string,\n" +
        "  year?: number,\n" +
        "  manufacturer: {\n" +
        "    name: string\n" +
        "  }\n" +
        "}",
      item
    );
  });

  test("Props", () => {
    const item = createMinInterface(__dirname + "/testFiles/props.ts", "Car");
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
