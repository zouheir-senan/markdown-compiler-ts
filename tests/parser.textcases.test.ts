import { tokenize } from '../src/lexer'; // Assuming you have a tokenizer function
import { parse } from '../src/parser';
import { ASTNodeType } from '../src/ast';

describe('Parser Text Cases', () => {
    function testParsing(input: string, expectedNodeTypes: ASTNodeType[]) {
        const tokens = tokenize(input);
        const ast = parse(tokens);

        // Helper function to collect all node types in preorder traversal
        function collectNodeTypes(node: any): ASTNodeType[] {
            const types = [node.type];
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    types.push(...collectNodeTypes(child));
                }
            }
            return types;
        }

        const nodeTypes = collectNodeTypes(ast);

        // Check that all expected node types are present
        for (const expectedType of expectedNodeTypes) {
            expect(nodeTypes.includes(expectedType)).toBe(true);
        }
    }

    test('parses simple paragraph', () => {
        const input = 'This is a simple paragraph.';
        testParsing(input, [ASTNodeType.document, ASTNodeType.paragraph, ASTNodeType.plain_text]);
    });

    test('parses bold text', () => {
        const input = 'This has **bold text** in it.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.bold,
            ASTNodeType.plain_text
        ]);
    });

    test('parses italic text', () => {
        const input = 'This has __italic text__ in it.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.italic,
            ASTNodeType.plain_text
        ]);
    });

    test('parses strikethrough text', () => {
        const input = 'This has ~~strikethrough text~~ in it.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.strike,
            ASTNodeType.plain_text
        ]);
    });

    test('parses spoiler text', () => {
        const input = 'This has ||spoiler text|| in it.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.spoiler,
            ASTNodeType.plain_text
        ]);
    });

    test('parses inline code', () => {
        const input = 'This has `inline code` in it.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.inline_code,
            ASTNodeType.plain_text
        ]);
    });

    test('parses links', () => {
        const input = 'Check out [this link](https://example.com).';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.link,
            ASTNodeType.plain_text
        ]);
    });

    test('parses emojis', () => {
        const input = 'I love this [smile](emoji:123456) emoji!';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.emoji,
            ASTNodeType.plain_text
        ]);
    });

    test('parses code blocks', () => {
        const input = '```javascript\nconst x = 42;\n```';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.code_block,
            ASTNodeType.language_specifier,
            ASTNodeType.code_content
        ]);
    });

    test('parses complex nested formatting', () => {
        const input = 'This **bold text has __italic__ and ~~strike~~ inside** it.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.bold,
            ASTNodeType.plain_text,
            ASTNodeType.italic,
            ASTNodeType.plain_text,
            ASTNodeType.strike,
            ASTNodeType.plain_text
        ]);
    });

    test('parses multiple blocks', () => {
        const input = 'First paragraph.\n\n```\ncode block\n```\n\nSecond paragraph with **bold**.';
        testParsing(input, [
            ASTNodeType.document,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.code_block,
            ASTNodeType.code_content,
            ASTNodeType.paragraph,
            ASTNodeType.plain_text,
            ASTNodeType.bold
        ]);
    });

    // Edge cases

    test('handles empty input', () => {
        const input = '';
        testParsing(input, [ASTNodeType.document]);
    });

    test('handles only whitespace', () => {
        const input = '   \n   \t   ';
        testParsing(input, [ASTNodeType.document, ASTNodeType.paragraph, ASTNodeType.plain_text]);
    });
});
