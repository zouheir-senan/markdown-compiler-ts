import { generateHTML } from '../src/generator';
import { ASTNode, ASTNodeType } from '../src/ast';
import { TokenType } from '../src/tokens';

describe('HTML Generator', () => {
    test('skips empty paragraphs', () => {
        const emptyParagraph: ASTNode = {
            type: ASTNodeType.paragraph,
            children: [
                { type: ASTNodeType.plain_text, value: '', children: [] }
            ]
        };

        expect(generateHTML(emptyParagraph)).toBe('');
    });

    test('skips whitespace-only paragraphs', () => {
        const whitespaceOnlyParagraph: ASTNode = {
            type: ASTNodeType.paragraph,
            children: [
                { type: ASTNodeType.plain_text, value: '   \n\t  ', children: [] }
            ]
        };

        expect(generateHTML(whitespaceOnlyParagraph)).toBe('');
    });

    test('handles code blocks with language specifiers', () => {
        const codeBlockWithLanguage: ASTNode = {
            type: ASTNodeType.code_block,
            children: [
                { type: TokenType.CODE_FENCE, value: '```', children: [] },
                { type: ASTNodeType.language_specifier, value: 'javascript', children: [] },
                { type: ASTNodeType.code_content, value: 'const x = 42;', children: [] },
                { type: TokenType.CODE_FENCE, value: '```', children: [] }
            ]
        };

        expect(generateHTML(codeBlockWithLanguage)).toBe(
            '<pre><code class="language-javascript">const x = 42;</code></pre>'
        );
    });

    test('escapes HTML in code blocks', () => {
        const codeWithHtml: ASTNode = {
            type: ASTNodeType.code_block,
            children: [
                { type: TokenType.CODE_FENCE, value: '```', children: [] },
                { type: ASTNodeType.code_content, value: '<div>test</div>', children: [] },
                { type: TokenType.CODE_FENCE, value: '```', children: [] }
            ]
        };

        expect(generateHTML(codeWithHtml)).toBe(
            '<pre><code>&lt;div&gt;test&lt;/div&gt;</code></pre>'
        );
    });

    test('properly handles links', () => {
        const linkNode: ASTNode = {
            type: ASTNodeType.link,
            children: [
                { type: TokenType.LBRACKET, value: '[', children: [] },
                { type: ASTNodeType.plain_text, value: 'Example Link', children: [] },
                { type: TokenType.RBRACKET, value: ']', children: [] },
                { type: TokenType.LPAREN, value: '(', children: [] },
                { type: ASTNodeType.plain_text, value: 'https://example.com', children: [] },
                { type: TokenType.RPAREN, value: ')', children: [] }
            ]
        };

        expect(generateHTML(linkNode)).toBe(
            '<a href="https://example.com">Example Link</a>'
        );
    });

    test('renders emojis with data attributes', () => {
        const emojiNode: ASTNode = {
            type: ASTNodeType.emoji,
            children: [
                { type: TokenType.LBRACKET, value: '[', children: [] },
                { type: TokenType.EMOJI_TEXT, value: 'smile', children: [] },
                { type: TokenType.RBRACKET, value: ']', children: [] },
                { type: TokenType.LPAREN, value: '(', children: [] },
                { type: TokenType.CUSTOM_EMOJI_PREFIX, value: 'emoji:', children: [] },
                { type: TokenType.NUMBER, value: '123456', children: [] },
                { type: TokenType.RPAREN, value: ')', children: [] }
            ]
        };

        expect(generateHTML(emojiNode)).toBe(
            '<span class="emoji" data-emoji-id="123456">smile</span>'
        );
    });

    test('handles nested formatting', () => {
        const nestedFormatting: ASTNode = {
            type: ASTNodeType.paragraph,
            children: [
                { type: ASTNodeType.plain_text, value: 'Text with ', children: [] },
                {
                    type: ASTNodeType.bold,
                    children: [
                        { type: TokenType.BOLD_MARKER, value: '**', children: [] },
                        { type: ASTNodeType.plain_text, value: 'bold and ', children: [] },
                        {
                            type: ASTNodeType.italic,
                            children: [
                                { type: TokenType.ITALIC_MARKER, value: '__', children: [] },
                                { type: ASTNodeType.plain_text, value: 'italic', children: [] },
                                { type: TokenType.ITALIC_MARKER, value: '__', children: [] }
                            ]
                        },
                        { type: TokenType.BOLD_MARKER, value: '**', children: [] }
                    ]
                }
            ]
        };

        expect(generateHTML(nestedFormatting)).toBe(
            '<p>Text with <strong>bold and <em>italic</em></strong></p>'
        );
    });
});
