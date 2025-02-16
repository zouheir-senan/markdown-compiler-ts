import { tokenize } from "./lexer";
import { parse } from "./parser";
import { generateHTML } from "./generator";

const markdownInput = `
# Welcome to My Markdown Compiler
This is a simple paragraph.
**test**
`;

const tokens = tokenize(markdownInput);
const ast = parse(tokens);
const htmlOutput = generateHTML(ast);

console.log(htmlOutput);
