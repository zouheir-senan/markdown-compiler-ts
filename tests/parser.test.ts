// tests/parser.test.ts
import { parse } from "../src/parser";
import { TokenType } from "../src/tokens";
import { ASTNodeType } from "../src/ast";

describe("Parser", () => {
    it("parses a plain text paragraph", () => {
        // Plain text token followed by EOF.
        const tokens = [
            { type: TokenType.TEXT, value: "Hello, world!" },
            { type: TokenType.EOF, value: "" },
        ];
        const ast = parse(tokens);

        // Expected structure:
        // document -> block -> paragraph -> plain_text
        expect(ast.type).toBe(ASTNodeType.document);
        expect(Array.isArray(ast.children)).toBe(true);

        const block = ast.children![0];
        expect(block.type).toBe(ASTNodeType.block);
        expect(Array.isArray(block.children)).toBe(true);

        const paragraph = block.children![0];
        expect(paragraph.type).toBe(ASTNodeType.paragraph);
        expect(Array.isArray(paragraph.children)).toBe(true);

        const plain = paragraph.children![0];
        expect(plain.type).toBe(ASTNodeType.plain_text);
        expect(plain.value).toBe("Hello, world!");
    });

    it("parses bold text", () => {
        // Bold text: opening bold marker, text, closing bold marker, then EOF.
        const tokens = [
            { type: TokenType.BOLD_MARKER, value: "**" },
            { type: TokenType.TEXT, value: "Bold Text" },
            { type: TokenType.BOLD_MARKER, value: "**" },
            { type: TokenType.EOF, value: "" },
        ];
        const ast = parse(tokens);

        // Expected structure:
        // document -> block -> paragraph -> bold
        const block = ast.children![0];
        const paragraph = block.children![0];
        const boldNode = paragraph.children![0];
        expect(boldNode.type).toBe(ASTNodeType.bold);
        expect(Array.isArray(boldNode.children)).toBe(true);

        // Bold node children: [opening bold marker, inline plain text, closing bold marker]
        expect(boldNode.children[0].type).toBe(TokenType.BOLD_MARKER);
        expect(boldNode.children[1].type).toBe(ASTNodeType.plain_text);
        expect(boldNode.children[1].value).toBe("Bold Text");
        expect(boldNode.children[2].type).toBe(TokenType.BOLD_MARKER);
    });

    it("parses inline code", () => {
        // Inline code: inline code marker, text, inline code marker, then EOF.
        const tokens = [
            { type: TokenType.INLINE_CODE_MARKER, value: "`" },
            { type: TokenType.TEXT, value: "code" },
            { type: TokenType.INLINE_CODE_MARKER, value: "`" },
            { type: TokenType.EOF, value: "" },
        ];
        const ast = parse(tokens);

        // Expected structure:
        // document -> block -> paragraph -> inline_code
        const block = ast.children![0];
        const paragraph = block.children![0];
        const inlineCodeNode = paragraph.children![0];
        expect(inlineCodeNode.type).toBe(ASTNodeType.inline_code);
        expect(Array.isArray(inlineCodeNode.children)).toBe(true);

        // inlineCode children: [opening marker, plain_text, closing marker]
        expect(inlineCodeNode.children[0].type).toBe(TokenType.INLINE_CODE_MARKER);
        expect(inlineCodeNode.children[1].type).toBe(ASTNodeType.plain_text);
        expect(inlineCodeNode.children[1].value).toBe("code");
        expect(inlineCodeNode.children[2].type).toBe(TokenType.INLINE_CODE_MARKER);
    });

    it("parses a link", () => {
        // Link: LBRACKET, text, RPAREN, then EOF.
        const tokens = [
            { type: TokenType.LBRACKET, value: "[" },
            { type: TokenType.TEXT, value: "Link" },
            { type: TokenType.RPAREN, value: ")" },
            { type: TokenType.EOF, value: "" },
        ];
        const ast = parse(tokens);

        // Expected structure:
        // document -> block -> paragraph -> link
        const block = ast.children![0];
        const paragraph = block.children![0];
        const linkNode = paragraph.children![0];
        expect(linkNode.type).toBe(ASTNodeType.link);
        expect(Array.isArray(linkNode.children)).toBe(true);

        // link children: [LBRACKET token, plain_text, RPAREN token]
        expect(linkNode.children[0].type).toBe(TokenType.LBRACKET);
        expect(linkNode.children[1].type).toBe(ASTNodeType.plain_text);
        expect(linkNode.children[1].value).toBe("Link");
        expect(linkNode.children[2].type).toBe(TokenType.RPAREN);
    });

    it("parses an emoji", () => {
        // Emoji: LBRACKET, EMOJI_TEXT, RPAREN, then EOF.
        const tokens = [
            { type: TokenType.LBRACKET, value: "[" },
            { type: TokenType.EMOJI_TEXT, value: "😊" },
            { type: TokenType.RPAREN, value: ")" },
            { type: TokenType.EOF, value: "" },
        ];
        const ast = parse(tokens);

        // Expected structure:
        // document -> block -> paragraph -> emoji
        const block = ast.children![0];
        const paragraph = block.children![0];
        const emojiNode = paragraph.children![0];
        expect(emojiNode.type).toBe(ASTNodeType.emoji);
        expect(Array.isArray(emojiNode.children)).toBe(true);

        // emoji children: [LBRACKET token, emoji node with value, RPAREN token]
        expect(emojiNode.children[0].type).toBe(TokenType.LBRACKET);
        expect(emojiNode.children[1].type).toBe(ASTNodeType.emoji);
        expect(emojiNode.children[1].value).toBe("😊");
        expect(emojiNode.children[2].type).toBe(TokenType.RPAREN);
    });

    it("parses a code block", () => {
        // Code block: CODE_FENCE, code text, CODE_FENCE, then EOF.
        const tokens = [
            { type: TokenType.CODE_FENCE, value: "```" },
            { type: TokenType.TEXT, value: "console.log('Hello');" },
            { type: TokenType.CODE_FENCE, value: "```" },
            { type: TokenType.EOF, value: "" },
        ];
        const ast = parse(tokens);

        // Expected structure:
        // document -> block -> (code_block node)
        const block = ast.children![0];
        const codeBlockNode = block.children![0];
        expect(codeBlockNode.type).toBe(ASTNodeType.code_block);
        expect(Array.isArray(codeBlockNode.children)).toBe(true);

        // codeBlock children: [opening CODE_FENCE, code_content, closing CODE_FENCE]
        expect(codeBlockNode.children[0].type).toBe(TokenType.CODE_FENCE);
        expect(codeBlockNode.children[1].type).toBe(ASTNodeType.code_content);
        expect(codeBlockNode.children[1].value).toBe("console.log('Hello');");
        expect(codeBlockNode.children[2].type).toBe(TokenType.CODE_FENCE);
    });
});
