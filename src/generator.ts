// src/generateHTML.ts
import { ASTNode, ASTNodeType } from "./ast";
import { TokenType } from "./tokens";

export function generateHTML(ast: ASTNode): string {
    switch (ast.type) {
        case ASTNodeType.document:
            return ast.children.map(generateHTML).join("");

        case ASTNodeType.block:
            // A block node simply concatenates its children.
            return ast.children.map(generateHTML).join("");

        case ASTNodeType.paragraph:
            return `<p>${ast.children.map(generateHTML).join("")}</p>`;

        case ASTNodeType.code_block:
            // Assume a code block has structure:
            // [CODE_FENCE, code_content, CODE_FENCE]
            // We ignore the code fences and join the code content.
            const codeContent = ast.children
                .filter((child) => child.type === ASTNodeType.code_content)
                .map((child) => child.value || "")
                .join("\n");
            return `<pre><code>${codeContent}</code></pre>`;

        case ASTNodeType.code_content:
            return ast.value || "";

        case ASTNodeType.bold:
            return `<strong>${ast.children.map(generateHTML).join("")}</strong>`;

        case ASTNodeType.italic:
            return `<em>${ast.children.map(generateHTML).join("")}</em>`;

        case ASTNodeType.strike:
            return `<del>${ast.children.map(generateHTML).join("")}</del>`;

        case ASTNodeType.spoiler:
            return `<span class="spoiler">${ast.children.map(generateHTML).join("")}</span>`;

        case ASTNodeType.inline_code:
            return `<code>${ast.children.map(generateHTML).join("")}</code>`;

        case ASTNodeType.emoji:
            // For emoji, if a value exists, return it.
            // Otherwise, join the children (ignoring markers).
            return ast.value || ast.children.map(generateHTML).join("");

        case ASTNodeType.link:
            // For a link node, assume that the markers (LBRACKET/RPAREN) are present,
            // and the inner content represents the link text.
            // You can adjust the href value as needed.
            const linkText = ast.children
                .filter(
                    (child) =>
                        child.type !== TokenType.LBRACKET && child.type !== TokenType.RPAREN
                )
                .map(generateHTML)
                .join("");
            return `<a href="#">${linkText}</a>`;

        case ASTNodeType.plain_text:
            return ast.value || "";

        case ASTNodeType.inline:
            // Inline node: simply join children.
            return ast.children.map(generateHTML).join("");

        default:
            // For any token markers we want to ignore in the final HTML (like markers)
            if (
                ast.type === TokenType.BOLD_MARKER ||
                ast.type === TokenType.ITALIC_MARKER ||
                ast.type === TokenType.STRIKE_MARKER ||
                ast.type === TokenType.SPOILER_MARKER ||
                ast.type === TokenType.INLINE_CODE_MARKER ||
                ast.type === TokenType.CODE_FENCE ||
                ast.type === TokenType.LBRACKET ||
                ast.type === TokenType.RPAREN
            ) {
                return "";
            }
            // Fallback: return the node's value or process its children.
            return ast.value || (ast.children ? ast.children.map(generateHTML).join("") : "");
    }
}
