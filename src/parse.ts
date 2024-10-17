import * as ts from "typescript";

function generateInterface(program: ts.Program, interfaceName: string) {
  program.getTypeChecker();

  // Find interface declaration
  let interfaceDeclaration: ts.InterfaceDeclaration | undefined;
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, function visit(node): ts.Node | undefined {
        if (
          ts.isInterfaceDeclaration(node) &&
          node.name.getText(sourceFile) === interfaceName
        ) {
          interfaceDeclaration = node;
          return node;
        }
        return ts.forEachChild(node, visit);
      });
    }
  }

  if (!interfaceDeclaration) {
    throw new Error(`Interface ${interfaceName} not found`);
  }

  // Get used properties in the variable
  const usedProperties = new Set<string>();

  function visitProperties(node: ts.Node, prefix: string = "") {
    if (ts.isPropertyAccessExpression(node)) {
      console.log("Property Access Expression");
      const propName = prefix + node.name.getText();
      usedProperties.add(propName);
      visitProperties(node.expression, propName + ".");
    } else if (ts.isVariableDeclaration(node) && node.initializer) {
      console.log("Variable Declaration");
      visitProperties(node.initializer, prefix);
    } else if (ts.isIdentifier(node)) {
      console.log("Identifier");
      if (!ts.isPropertyAccessExpression(node.parent)) {
        usedProperties.add(prefix + node.getText());
      }
    } else if (ts.isObjectLiteralExpression(node)) {
      console.log("Object Literal Expression");
      console.log(node.properties);
      node.properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          const propName = prefix + prop.name.getText();
          usedProperties.add(propName);
          visitProperties(prop.initializer, propName + ".");
        }
      });
    }
  }

  // Find variable declarations that use the interface
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, function visit(node): ts.Node | undefined {
        if (
          ts.isVariableDeclaration(node) &&
          node.type &&
          ts.isTypeReferenceNode(node.type) &&
          node.type.typeName.getText() === interfaceName &&
          node.initializer !== undefined // Ensure initializer is defined
        ) {
          visitProperties(node.initializer);
        }
        return ts.forEachChild(node, visit);
      });
    }
  }

  function generateInterfaceMembers(
    node: ts.Node,
    prefix: string,
    indent: string = "  "
  ): string {
    let result = "";
    ts.forEachChild(node, (child) => {
      if (ts.isPropertySignature(child) && ts.isIdentifier(child.name)) {
        const propName = prefix + child.name.getText();
        if (usedProperties.has(propName)) {
          if (child.type && ts.isTypeLiteralNode(child.type)) {
            result +=
              indent +
              child.name.getText() +
              ": {\n" +
              generateInterfaceMembers(
                child.type,
                propName + ".",
                indent + "  "
              ) +
              indent +
              "},\n";
          } else {
            result += indent + child.getText().replace(/;$/, ",") + "\n";
          }
        }
      }
    });
    // Trim the trailing comma and newline
    return result.replace(/,\n$/, "\n");
  }

  // Generate new interface
  const newInterface =
    `interface ${interfaceName}Min {\n` +
    generateInterfaceMembers(interfaceDeclaration, "") +
    "}";

  return newInterface;
}

export function createMinInterface(fileName: string, interfaceName: string) {
  const program = ts.createProgram([fileName], {});
  const newInterface = generateInterface(program, interfaceName);
  return newInterface;
}
