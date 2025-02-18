// src/parser.test.ts
import { parse } from '../src/parser';
import { Token, TokenType } from '../src/tokens';
import { ASTNode, ASTNodeType } from'../src/ast';



describe('Parser', () => {
    // Helper function to create tokens for testing
    function createToken(type: TokenType, value: string = ''): Token {
        return { type, value };
    }

    describe('document parsing', () => {
        test('should parse an empty document', () => {
            const tokens: Token[] = [
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result).toEqual({
                type: ASTNodeType.document,
                children: []
            });
        });

        test('should parse a document with multiple blocks', () => {
            const tokens: Token[] = [
                createToken(TokenType.TEXT, 'Plain text paragraph 1'),
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.TEXT, 'code content'),
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.TEXT, 'Plain text paragraph 2'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.type).toBe(ASTNodeType.document);
            expect(result.children.length).toBe(3); // Two paragraphs and one code block
        });
    });

    describe('block parsing', () => {
        test('should parse a paragraph block', () => {
            const tokens: Token[] = [
                createToken(TokenType.TEXT, 'This is a paragraph'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].type).toBe(ASTNodeType.paragraph);
            expect(result.children[0].children[0].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[0].value).toBe('This is a paragraph');
        });

        test('should parse a code block', () => {
            const tokens: Token[] = [
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.LANGUAGE_SPECIFIER, 'javascript'),
                createToken(TokenType.NEWLINE, '\n'),
                createToken(TokenType.TEXT, 'const x = 42;'),
                createToken(TokenType.NEWLINE, '\n'),
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].type).toBe(ASTNodeType.code_block);
            expect(result.children[0].children[1].type).toBe(ASTNodeType.language_specifier);
            expect(result.children[0].children[1].value).toBe('javascript');
            expect(result.children[0].children[3].type).toBe(ASTNodeType.code_content);
            expect(result.children[0].children[3].value).toBe('const x = 42;');
        });

        test('should throw an error for unclosed code block', () => {
            const tokens: Token[] = [
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.TEXT, 'code content'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Unclosed code fence');
        });
    });

    describe('inline element parsing', () => {
        test('should parse bold text', () => {
            const tokens: Token[] = [
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.TEXT, 'bold text'),
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.bold);
            expect(result.children[0].children[0].children[1].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[0].children[1].value).toBe('bold text');
        });

        test('should parse italic text', () => {
            const tokens: Token[] = [
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.TEXT, 'italic text'),
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.italic);
            expect(result.children[0].children[0].children[1].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[0].children[1].value).toBe('italic text');
        });

        test('should parse strikethrough text', () => {
            const tokens: Token[] = [
                createToken(TokenType.STRIKE_MARKER, '~~'),
                createToken(TokenType.TEXT, 'strikethrough text'),
                createToken(TokenType.STRIKE_MARKER, '~~'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.strike);
            expect(result.children[0].children[0].children[1].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[0].children[1].value).toBe('strikethrough text');
        });

        test('should parse spoiler text', () => {
            const tokens: Token[] = [
                createToken(TokenType.SPOILER_MARKER, '||'),
                createToken(TokenType.TEXT, 'spoiler text'),
                createToken(TokenType.SPOILER_MARKER, '||'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.spoiler);
            expect(result.children[0].children[0].children[1].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[0].children[1].value).toBe('spoiler text');
        });

        test('should parse inline code', () => {
            const tokens: Token[] = [
                createToken(TokenType.INLINE_CODE_MARKER, '`'),
                createToken(TokenType.TEXT, 'inline code'),
                createToken(TokenType.INLINE_CODE_MARKER, '`'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.inline_code);
            expect(result.children[0].children[0].children[1].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[0].children[1].value).toBe('inline code');
        });

        test('should parse links', () => {
            const tokens: Token[] = [
                createToken(TokenType.LBRACKET, '['),
                createToken(TokenType.TEXT, 'link text'),
                createToken(TokenType.RBRACKET, ']'),
                createToken(TokenType.LPAREN, '('),
                createToken(TokenType.TEXT, 'https://example.com'),
                createToken(TokenType.RPAREN, ')'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.link);
            expect(result.children[0].children[0].children[1].value).toBe('link text');
            expect(result.children[0].children[0].children[4].value).toBe('https://example.com');
        });

        test('should parse emojis', () => {
            const tokens: Token[] = [
                createToken(TokenType.LBRACKET, '['),
                createToken(TokenType.EMOJI_TEXT, 'smile'),
                createToken(TokenType.RBRACKET, ']'),
                createToken(TokenType.LPAREN, '('),
                createToken(TokenType.CUSTOM_EMOJI_PREFIX, 'emoji:'),
                createToken(TokenType.NUMBER, '123456'),
                createToken(TokenType.RPAREN, ')'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.emoji);
            expect(result.children[0].children[0].children[1].type).toBe(TokenType.EMOJI_TEXT);
            expect(result.children[0].children[0].children[1].value).toBe('smile');
            expect(result.children[0].children[0].children[5].value).toBe('123456');
        });
    });

    describe('error handling', () => {
        test('should throw an error for unclosed bold marker', () => {
            const tokens: Token[] = [
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.TEXT, 'bold text'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Unclosed bold marker');
        });

        test('should throw an error for unclosed italic marker', () => {
            const tokens: Token[] = [
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.TEXT, 'italic text'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Unclosed italic marker');
        });

        test('should throw an error for unclosed strike marker', () => {
            const tokens: Token[] = [
                createToken(TokenType.STRIKE_MARKER, '~~'),
                createToken(TokenType.TEXT, 'strikethrough text'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Unclosed strike marker');
        });

        test('should throw an error for unclosed spoiler marker', () => {
            const tokens: Token[] = [
                createToken(TokenType.SPOILER_MARKER, '||'),
                createToken(TokenType.TEXT, 'spoiler text'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Unclosed spoiler marker');
        });

        test('should throw an error for unclosed inline code marker', () => {
            const tokens: Token[] = [
                createToken(TokenType.INLINE_CODE_MARKER, '`'),
                createToken(TokenType.TEXT, 'inline code'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Unclosed inline code marker');
        });

        test('should throw an error for invalid link format', () => {
            const tokens: Token[] = [
                createToken(TokenType.LBRACKET, '['),
                createToken(TokenType.TEXT, 'link text'),
                createToken(TokenType.RBRACKET, ']'),
                createToken(TokenType.TEXT, 'not a valid URL part'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Invalid link: missing LPAREN');
        });

        test('should throw an error for invalid emoji format', () => {
            const tokens: Token[] = [
                createToken(TokenType.LBRACKET, '['),
                createToken(TokenType.EMOJI_TEXT, 'smile'),
                createToken(TokenType.RBRACKET, ']'),
                createToken(TokenType.LPAREN, '('),
                createToken(TokenType.TEXT, 'wrong content'),
                createToken(TokenType.RPAREN, ')'),
                createToken(TokenType.EOF)
            ];

            expect(() => parse(tokens)).toThrow('Invalid emoji: missing CUSTOM_EMOJI_PREFIX');
        });

        test('should throw an error for unexpected end of input', () => {
            const tokens: Token[] = [];

            expect(() => parse(tokens)).toThrow('Unexpected end of input');
        });
    });

    describe('complex parsing scenarios', () => {
        test('should parse nested formatting', () => {
            const tokens: Token[] = [
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.TEXT, 'bold and italic'),
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children[0].type).toBe(ASTNodeType.bold);
            expect(result.children[0].children[0].children[1].type).toBe(ASTNodeType.italic);
        });

        test('should parse multiple consecutive inline elements', () => {
            const tokens: Token[] = [
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.TEXT, 'bold'),
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.TEXT, ' normal '),
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.TEXT, 'italic'),
                createToken(TokenType.ITALIC_MARKER, '*'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children[0].children.length).toBe(3);
            expect(result.children[0].children[0].type).toBe(ASTNodeType.bold);
            expect(result.children[0].children[1].type).toBe(ASTNodeType.plain_text);
            expect(result.children[0].children[2].type).toBe(ASTNodeType.italic);
        });

        test('should parse a combination of block and inline elements', () => {
            const tokens: Token[] = [
                createToken(TokenType.TEXT, 'Paragraph with '),
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.TEXT, 'bold'),
                createToken(TokenType.BOLD_MARKER, '**'),
                createToken(TokenType.TEXT, ' text'),
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.TEXT, 'code block'),
                createToken(TokenType.CODE_FENCE, '```'),
                createToken(TokenType.EOF)
            ];

            const result = parse(tokens);

            expect(result.children.length).toBe(2);
            expect(result.children[0].type).toBe(ASTNodeType.paragraph);
            expect(result.children[1].type).toBe(ASTNodeType.code_block);
        });
    });
});
