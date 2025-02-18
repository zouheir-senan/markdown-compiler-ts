// src/generateHTML.ts
import { ASTNode, ASTNodeType } from "./ast";
import { TokenType } from "./tokens";

export function generateHTML(ast: ASTNode): string {
    // Helper function to check if a node generates empty content
    function isEmptyContent(node: ASTNode): boolean {
        if (!node.children || node.children.length === 0) {
            return !node.value || node.value.trim() === '';
        }

        // Check if all children generate empty content
        return node.children.every(isEmptyContent);
    }

    // Skip empty nodes for certain types
    if ((ast.type === ASTNodeType.paragraph ||
            ast.type === ASTNodeType.bold ||
            ast.type === ASTNodeType.italic ||
            ast.type === ASTNodeType.strike ||
            ast.type === ASTNodeType.spoiler) &&
        isEmptyContent(ast)) {
        return '';
    }

    // Process based on node type
    switch (ast.type) {
        case ASTNodeType.document:
            // Filter out empty children
            return ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

        case ASTNodeType.block:
            // Filter out empty children
            return ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

        case ASTNodeType.paragraph: {
            const content = ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

            return content.trim() ? `<p>${content}</p>` : '';
        }

        case ASTNodeType.code_block: {
            // Handle language specifier for syntax highlighting
            let language = '';
            let content = '';

            for (const child of ast.children) {
                if (child.type === ASTNodeType.language_specifier) {
                    language = child.value || '';
                } else if (child.type === ASTNodeType.code_content) {
                    content += (child.value || '') + '\n';
                }
            }

            // Trim trailing newline
            content = content.trim();

            // Don't generate empty code blocks
            if (!content) return '';

            // Add language class if specified
            const languageAttr = language ? ` class="language-${language}"` : '';
            return `<pre><code${languageAttr}>${escapeHTML(content)}</code></pre>`;
        }

        case ASTNodeType.code_content:
            return ast.value || "";

        case ASTNodeType.bold: {
            const content = ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

            return content.trim() ? `<strong>${content}</strong>` : '';
        }

        case ASTNodeType.italic: {
            const content = ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

            return content.trim() ? `<em>${content}</em>` : '';
        }

        case ASTNodeType.strike: {
            const content = ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

            return content.trim() ? `<del>${content}</del>` : '';
        }

        case ASTNodeType.spoiler: {
            const content = ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

            return content.trim() ? `<span class="spoiler">${content}</span>` : '';
        }

        case ASTNodeType.inline_code: {
            // Get content by filtering out markers
            const content = ast.children
                .filter(child => child.type !== TokenType.INLINE_CODE_MARKER)
                .map(child => child.value || '')
                .join('');

            return content.trim() ? `<code>${escapeHTML(content)}</code>` : '';
        }

        case ASTNodeType.emoji: {
            // Extract emoji name and ID
            let emojiName = '';
            let emojiId = '';

            for (const child of ast.children) {
                if (child.type === TokenType.EMOJI_TEXT) {
                    emojiName = child.value || '';
                } else if (child.type === TokenType.NUMBER) {
                    emojiId = child.value || '';
                }
            }

            if (emojiName && emojiId) {
                return `<span class="emoji" data-emoji-id="${emojiId}">${emojiName}</span>`;
            }

            return ast.value || '';
        }

        case ASTNodeType.link: {
            // Extract link text and URL
            let linkText = '';
            let linkUrl = '';
            let inUrl = false;

            for (const child of ast.children) {
                if (child.type === TokenType.LPAREN) {
                    inUrl = true;
                } else if (child.type === TokenType.RPAREN) {
                    inUrl = false;
                } else if (child.type !== TokenType.LBRACKET && child.type !== TokenType.RBRACKET) {
                    if (inUrl) {
                        linkUrl += child.value || '';
                    } else {
                        linkText += generateHTML(child);
                    }
                }
            }

            if (linkText.trim() && linkUrl.trim()) {
                return `<a href="${escapeAttribute(linkUrl)}">${linkText}</a>`;
            }

            return linkText;
        }

        case ASTNodeType.plain_text:
            return ast.value ? escapeHTML(ast.value) : '';

        case ASTNodeType.inline:
            return ast.children
                .map(generateHTML)
                .filter(html => html.trim() !== '')
                .join("");

        default:
            // Markers and special tokens - ignore them
            if ([
                TokenType.BOLD_MARKER,
                TokenType.ITALIC_MARKER,
                TokenType.STRIKE_MARKER,
                TokenType.SPOILER_MARKER,
                TokenType.INLINE_CODE_MARKER,
                TokenType.CODE_FENCE,
                TokenType.LBRACKET,
                TokenType.RBRACKET,
                TokenType.LPAREN,
                TokenType.RPAREN,
                TokenType.LANGUAGE_SPECIFIER,
                TokenType.NEWLINE,
                TokenType.EOF
            ].includes(ast.type as any)) {
                return '';
            }

            // Fallback: return the node's value or process its children
            return ast.value ||
                (ast.children ?
                    ast.children
                        .map(generateHTML)
                        .filter(html => html.trim() !== '')
                        .join("") :
                    '');
    }
}
// Helper function to escape HTML special characters
function escapeHTML(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// Helper function to escape HTML attribute values
function escapeAttribute(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
