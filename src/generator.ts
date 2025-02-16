// src/generator.ts
import { ASTNode } from "./ast";

export function generateHTML(node: ASTNode): string {
    switch (node.type) {
        case "document":
            return node.children ? node.children.map(generateHTML).join("\n") : "";
        case "heading":
            // For simplicity, assume all headings are <h1>
            return `<h1>${node.value}</h1>`;
        case "paragraph":
            return `<p>${node.value}</p>`;
        default:
            return node.value || "";
    }
}
