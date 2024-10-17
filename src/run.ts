import * as fs from "fs";
import { createMinInterface } from "./parse";

function main() {
  if (process.argv.length !== 4) {
    console.error("Usage: ts-node src/run.ts <file_path> <interface_name>");
    process.exit(1);
  }

  const filePath = process.argv[2];
  const interfaceName = process.argv[3];

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const minInterface = createMinInterface(filePath, interfaceName);
    console.log(minInterface);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
