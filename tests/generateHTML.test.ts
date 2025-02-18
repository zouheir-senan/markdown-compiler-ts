// tests/generateHTML.test.ts
import { generateHTML } from "../src/generator";
import { ASTNode, ASTNodeType } from "../src/ast";
import { TokenType } from "../src/tokens";

describe("generateHTML", () => {
    it("generates HTML for a plain text node", () => {
        const ast: ASTNode = {
            type: ASTNodeType.plain_text,
            children: [],
            value: "Hello, world!",
        };
        const html = generateHTML(ast);
        expect(html).toBe("Hello, world!");
    });

    it("generates HTML for a paragraph", () => {
        const ast: ASTNode = {
            type: ASTNodeType.paragraph,
            children: [
                {
                    type: ASTNodeType.plain_text,
                    children: [],
                    value: "This is a paragraph.",
                },
            ],
        };
        const html = generateHTML(ast);
        expect(html).toBe("<p>This is a paragraph.</p>");
    });

    it("generates HTML for bold text", () => {
        const ast: ASTNode = {
            type: ASTNodeType.bold,
            children: [
                { type: TokenType.BOLD_MARKER, children: [], value: "**" },
                { type: ASTNodeType.plain_text, children: [], value: "Bold Text" },
                { type: TokenType.BOLD_MARKER, children: [], value: "**" },
            ],
        };
        const html = generateHTML(ast);
        expect(html).toBe("<strong>Bold Text</strong>");
    });

    it("generates HTML for italic text", () => {
        const ast: ASTNode = {
            type: ASTNodeType.italic,
            children: [
                { type: TokenType.ITALIC_MARKER, children: [], value: "*" },
                { type: ASTNodeType.plain_text, children: [], value: "Italic Text" },
                { type: TokenType.ITALIC_MARKER, children: [], value: "*" },
            ],
        };
        const html = generateHTML(ast);
        expect(html).toBe("<em>Italic Text</em>");
    });

    it("generates HTML for inline code", () => {
        const ast: ASTNode = {
            type: ASTNodeType.inline_code,
            children: [
                { type: TokenType.INLINE_CODE_MARKER, children: [], value: "`" },
                { type: ASTNodeType.plain_text, children: [], value: "console.log('hi')" },
                { type: TokenType.INLINE_CODE_MARKER, children: [], value: "`" },
            ],
        };
        const html = generateHTML(ast);
        expect(html).toBe("<code>console.log('hi')</code>");
    });

    it("generates HTML for a link", () => {
        const ast: ASTNode = {
            type: ASTNodeType.link,
            children: [
                { type: TokenType.LBRACKET, children: [], value: "[" },
                { type: ASTNodeType.plain_text, children: [], value: "Link" },
                { type: TokenType.RPAREN, children: [], value: ")" },
            ],
        };
        const html = generateHTML(ast);
        expect(html).toBe('<a href="#">Link</a>');
    });

    it("generates HTML for an emoji", () => {
        const ast: ASTNode = {
            type: ASTNodeType.emoji,
            children: [
                { type: TokenType.LBRACKET, children: [], value: "[" },
                { type: ASTNodeType.emoji, children: [], value: "😊" },
                { type: TokenType.RPAREN, children: [], value: ")" },
            ],
        };
        const html = generateHTML(ast);
        // In our generateHTML, for emoji we return its value.
        expect(html).toBe("😊");
    });

    it("generates HTML for a code block", () => {
        const ast: ASTNode = {
            type: ASTNodeType.code_block,
            children: [
                { type: TokenType.CODE_FENCE, children: [], value: "```" },
                {
                    type: ASTNodeType.code_content,
                    children: [],
                    value: "console.log('Hello');",
                },
                { type: TokenType.CODE_FENCE, children: [], value: "```" },
            ],
        };
        const html = generateHTML(ast);
        expect(html).toBe("<pre><code>console.log('Hello');</code></pre>");
    });

    it("generates HTML for a document with multiple blocks", () => {
        const ast: ASTNode = {
            type: ASTNodeType.document,
            children: [
                {
                    type: ASTNodeType.block,
                    children: [
                        {
                            type: ASTNodeType.paragraph,
                            children: [
                                {
                                    type: ASTNodeType.plain_text,
                                    children: [],
                                    value: "Hello, world!",
                                },
                            ],
                        },
                    ],
                },
                {
                    type: ASTNodeType.block,
                    children: [
                        {
                            type: ASTNodeType.paragraph,
                            children: [
                                {
                                    type: ASTNodeType.plain_text,
                                    children: [],
                                    value: "Another paragraph.",
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const html = generateHTML(ast);
        expect(html).toBe("<p>Hello, world!</p><p>Another paragraph.</p>");
    });
});
