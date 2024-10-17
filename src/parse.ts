import * as ts from "typescript";
import * as path from "path";

function generateMinimalInterface(
  program: ts.Program,
  sourceFile: ts.SourceFile,
  functionName: string,
  argumentName: string,
  interfaceName: string
): string {
  console.log(
    `Generating minimal interface for function: ${functionName}, argument: ${argumentName}, interface: ${interfaceName}`
  );
  const typeChecker = program.getTypeChecker();
  const usedProperties: string[] = [];

  function visitProperties(node: ts.Node) {
    console.log(`Visiting node: ${ts.SyntaxKind[node.kind]}`);
    if (ts.isPropertyAccessExpression(node)) {
      let current: ts.Node = node;
      const chain: string[] = [];
      while (
        ts.isPropertyAccessExpression(current) ||
        ts.isIdentifier(current)
      ) {
        if (ts.isPropertyAccessExpression(current)) {
          chain.unshift(current.name.getText());
          current = current.expression;
        } else if (
          ts.isIdentifier(current) &&
          current.getText() === argumentName
        ) {
          chain.unshift(current.getText());
          usedProperties.push(chain.join("."));
          console.log(`Added property chain: ${chain.join(".")}`);
          console.log(
            `Type of ${chain.join(".")}: ${typeChecker.typeToString(
              typeChecker.getTypeAtLocation(node)
            )}`
          );
          break;
        } else {
          break;
        }
      }
    }
    ts.forEachChild(node, visitProperties);
  }

  function visitNode(node: ts.Node): string | undefined {
    console.log(`Visiting node: ${ts.SyntaxKind[node.kind]}`);

    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.getText() === functionName
    ) {
      console.log(`Found function: ${functionName}`);
      if (node.initializer && ts.isArrowFunction(node.initializer)) {
        const parameter = node.initializer.parameters.find(
          (p) => p.name.getText() === argumentName
        );
        if (parameter) {
          console.log(`Found parameter: ${argumentName}`);
          if (parameter.type && ts.isTypeReferenceNode(parameter.type)) {
            console.log(`Parameter type: ${parameter.type.getText()}`);
            const symbol = typeChecker.getSymbolAtLocation(
              parameter.type.typeName
            );
            if (symbol && symbol.declarations) {
              const interfaceDeclaration = symbol.declarations.find(
                (decl): decl is ts.InterfaceDeclaration =>
                  ts.isInterfaceDeclaration(decl) &&
                  decl.name.getText() === interfaceName
              );
              if (interfaceDeclaration) {
                console.log(`Found interface declaration: ${interfaceName}`);
                visitProperties(node.initializer.body);
                return generateNewInterface(interfaceDeclaration);
              }
            }
          }
        }
      }
    }

    let result: string | undefined;
    ts.forEachChild(node, (child) => {
      result = visitNode(child) || result;
    });
    return result;
  }

  function generateNewInterface(
    interfaceDeclaration: ts.InterfaceDeclaration
  ): string {
    function generateInterfaceMembers(properties: string[]): string {
      console.log(
        `Generating interface members for properties: ${properties.join(", ")}`
      );
      const result: { [key: string]: any } = {};

      // Sort properties by length (descending) to process most specific first
      properties.sort((a, b) => b.split(".").length - a.split(".").length);

      for (const prop of properties) {
        console.log(`Processing property: ${prop}`);
        const parts = prop.split(".");
        let current = result;
        let type: ts.Type | undefined;

        for (let i = 1; i < parts.length; i++) {
          if (i === parts.length - 1) {
            if (typeof current[parts[i]] !== "object") {
              // Get the type of the property
              if (!type) {
                const symbol = typeChecker.getSymbolAtLocation(
                  sourceFile.getChildAt(0).getChildAt(0)
                );
                type = symbol
                  ? typeChecker.getTypeOfSymbolAtLocation(symbol, sourceFile)
                  : undefined;
              }
              for (let j = 1; j < parts.length; j++) {
                if (type) {
                  const property = type.getProperty(parts[j]);
                  if (property) {
                    type = typeChecker.getTypeOfSymbolAtLocation(
                      property,
                      sourceFile
                    );
                  } else {
                    type = undefined;
                    break;
                  }
                }
              }
              current[parts[i]] = type ? typeChecker.typeToString(type) : "any";
            }
          } else {
            if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
        }
        console.log(`Current result:`, JSON.stringify(result, null, 2));
      }

      function stringifyObject(obj: any, indent: string = "  "): string {
        let str = "{\n";
        for (const [key, value] of Object.entries(obj)) {
          if (value && typeof value === "object") {
            str += `${indent}  ${key}: ${stringifyObject(
              value,
              indent + "  "
            )},\n`;
          } else {
            str += `${indent}  ${key}: ${value},\n`;
          }
        }
        str += `${indent}}`;
        return str;
      }

      console.log(
        `Result object before stringifying:`,
        JSON.stringify(result, null, 2)
      );
      return stringifyObject(result);
    }

    const newInterface = `interface ${interfaceName}Min ${generateInterfaceMembers(
      usedProperties
    )}`;

    console.log(`Generated interface:\n${newInterface}`);
    return newInterface;
  }
  const result = visitNode(sourceFile) || "";
  console.log(`Final generated interface:\n${result}`);
  return result;
}

export function createMinInterface(
  fileName: string,
  functionName: string,
  argumentName: string,
  interfaceName: string
): string {
  console.log(`Creating minimal interface for file: ${fileName}`);
  const program = ts.createProgram([fileName], {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
  });
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) {
    throw new Error(`Source file ${fileName} not found`);
  }
  console.log(`Source file content:\n${sourceFile.getText()}`);
  const newInterface = generateMinimalInterface(
    program,
    sourceFile,
    functionName,
    argumentName,
    interfaceName
  );
  return newInterface;
}
