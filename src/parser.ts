// src/parser.ts
import { Token, TokenType } from "./tokens";
import { ASTNode, ASTNodeType } from "./ast";

export function parse(tokens: Token[]): ASTNode {
    let pos = 0;

    // Helper functions for token management
    function peek(offset = 0): Token | undefined {
        return tokens[pos + offset];
    }

    function nextToken(): Token {
        if (pos >= tokens.length) {
            throw new Error("Unexpected end of input");
        }
        return tokens[pos++];
    }

    function match(tokenType: TokenType): boolean {
        return peek()?.type === tokenType;
    }

    function expect(tokenType: TokenType): Token {
        if (match(tokenType)) {
            return nextToken();
        }
        throw new Error(`Expected token of type ${tokenType} but got ${peek()?.type}`);
    }

    // document → block* EOF
    function document(): ASTNode {
        const children: ASTNode[] = [];

        while (peek() && peek()!.type !== TokenType.EOF) {
            children.push(block());
        }

        // Consume EOF token if present
        if (peek()?.type === TokenType.EOF) {
            nextToken();
        }

        return { type: ASTNodeType.document, children };
    }

    // block → code_block | paragraph
    function block(): ASTNode {
        if (match(TokenType.CODE_FENCE)) {
            return codeBlock();
        } else {
            return paragraph();
        }
    }

    // code_block → CODE_FENCE [language_specifier] [newline] code_content [newline] CODE_FENCE
    function codeBlock(): ASTNode {
        const children: ASTNode[] = [];

        // Opening code fence
        const openFence = expect(TokenType.CODE_FENCE);
        children.push({ type: openFence.type, value: openFence.value, children: [] });

        // Optional language specifier
        if (match(TokenType.LANGUAGE_SPECIFIER)) {
            const langSpec = nextToken();
            children.push({ type: ASTNodeType.language_specifier, value: langSpec.value, children: [] });
        }

        // Optional newline
        if (match(TokenType.NEWLINE)) {
            const newline = nextToken();
            children.push({ type: newline.type, value: newline.value, children: [] });
        }

        // Code content until closing fence
        while (peek() && peek()!.type !== TokenType.CODE_FENCE) {
            const content = nextToken();
            children.push({ type: ASTNodeType.code_content, value: content.value, children: [] });
        }

        // Optional newline before closing fence
        if (match(TokenType.NEWLINE)) {
            const newline = nextToken();
            children.push({ type: newline.type, value: newline.value, children: [] });
        }

        // Closing code fence
        if (!match(TokenType.CODE_FENCE)) {
            throw new Error("Unclosed code fence");
        }
        const closeFence = nextToken();
        children.push({ type: closeFence.type, value: closeFence.value, children: [] });

        return { type: ASTNodeType.code_block, children };
    }

    // paragraph → inline+
    function paragraph(): ASTNode {
        const children: ASTNode[] = [];

        // Parse one or more inline elements
        do {
            children.push(inline());
        } while (
            peek() &&
            peek()!.type !== TokenType.CODE_FENCE &&
            peek()!.type !== TokenType.EOF
            );

        return { type: ASTNodeType.paragraph, children };
    }

    // inline → bold | italic | strike | spoiler | inline_code | link | emoji | plain_text
    function inline(): ASTNode {
        if (!peek()) {
            throw new Error("Unexpected end of input in inline content");
        }

        switch (peek()!.type) {
            case TokenType.BOLD_MARKER:
                return bold();
            case TokenType.ITALIC_MARKER:
                return italic();
            case TokenType.STRIKE_MARKER:
                return strike();
            case TokenType.SPOILER_MARKER:
                return spoiler();
            case TokenType.INLINE_CODE_MARKER:
                return inlineCode();
            case TokenType.LBRACKET:
                // Additional lookahead to determine link or emoji
                if (peek(1)?.type === TokenType.EMOJI_TEXT) {
                    return emoji();
                } else {
                    return link();
                }
            default:
                return plainText();
        }
    }

    // bold → BOLD_MARKER inline+ BOLD_MARKER
    function bold(): ASTNode {
        const children: ASTNode[] = [];

        // Consume opening marker
        const openMarker = expect(TokenType.BOLD_MARKER);
        children.push({ type: openMarker.type, value: openMarker.value, children: [] });

        // Parse inline content until closing marker
        while (peek() && peek()!.type !== TokenType.BOLD_MARKER) {
            children.push(inline());
        }

        // Consume closing marker
        if (!match(TokenType.BOLD_MARKER)) {
            throw new Error("Unclosed bold marker");
        }
        const closeMarker = nextToken();
        children.push({ type: closeMarker.type, value: closeMarker.value, children: [] });

        return { type: ASTNodeType.bold, children };
    }

    // italic → ITALIC_MARKER inline+ ITALIC_MARKER
    function italic(): ASTNode {
        const children: ASTNode[] = [];

        // Consume opening marker
        const openMarker = expect(TokenType.ITALIC_MARKER);
        children.push({ type: openMarker.type, value: openMarker.value, children: [] });

        // Parse inline content until closing marker
        while (peek() && peek()!.type !== TokenType.ITALIC_MARKER) {
            children.push(inline());
        }

        // Consume closing marker
        if (!match(TokenType.ITALIC_MARKER)) {
            throw new Error("Unclosed italic marker");
        }
        const closeMarker = nextToken();
        children.push({ type: closeMarker.type, value: closeMarker.value, children: [] });

        return { type: ASTNodeType.italic, children };
    }

    // strike → STRIKE_MARKER inline+ STRIKE_MARKER
    function strike(): ASTNode {
        const children: ASTNode[] = [];

        // Consume opening marker
        const openMarker = expect(TokenType.STRIKE_MARKER);
        children.push({ type: openMarker.type, value: openMarker.value, children: [] });

        // Parse inline content until closing marker
        while (peek() && peek()!.type !== TokenType.STRIKE_MARKER) {
            children.push(inline());
        }

        // Consume closing marker
        if (!match(TokenType.STRIKE_MARKER)) {
            throw new Error("Unclosed strike marker");
        }
        const closeMarker = nextToken();
        children.push({ type: closeMarker.type, value: closeMarker.value, children: [] });

        return { type: ASTNodeType.strike, children };
    }

    // spoiler → SPOILER_MARKER inline+ SPOILER_MARKER
    function spoiler(): ASTNode {
        const children: ASTNode[] = [];

        // Consume opening marker
        const openMarker = expect(TokenType.SPOILER_MARKER);
        children.push({ type: openMarker.type, value: openMarker.value, children: [] });

        // Parse inline content until closing marker
        while (peek() && peek()!.type !== TokenType.SPOILER_MARKER) {
            children.push(inline());
        }

        // Consume closing marker
        if (!match(TokenType.SPOILER_MARKER)) {
            throw new Error("Unclosed spoiler marker");
        }
        const closeMarker = nextToken();
        children.push({ type: closeMarker.type, value: closeMarker.value, children: [] });

        return { type: ASTNodeType.spoiler, children };
    }

    // inline_code → INLINE_CODE_MARKER plain_text INLINE_CODE_MARKER
    function inlineCode(): ASTNode {
        const children: ASTNode[] = [];

        // Consume opening marker
        const openMarker = expect(TokenType.INLINE_CODE_MARKER);
        children.push({ type: openMarker.type, value: openMarker.value, children: [] });

        // Parse plain text until closing marker
        while (peek() && peek()!.type !== TokenType.INLINE_CODE_MARKER) {
            // For inline code, content is treated as plain text
            const contentToken = nextToken();
            children.push({ type: ASTNodeType.plain_text, value: contentToken.value, children: [] });
        }

        // Consume closing marker
        if (!match(TokenType.INLINE_CODE_MARKER)) {
            throw new Error("Unclosed inline code marker");
        }
        const closeMarker = nextToken();
        children.push({ type: closeMarker.type, value: closeMarker.value, children: [] });

        return { type: ASTNodeType.inline_code, children };
    }

    // link → LBRACKET link_text RBRACKET LPAREN link_url RPAREN
    function link(): ASTNode {
        const children: ASTNode[] = [];

        // Consume LBRACKET
        const lbracket = expect(TokenType.LBRACKET);
        children.push({ type: lbracket.type, value: lbracket.value, children: [] });

        // Parse link text until RBRACKET
        while (peek() && peek()!.type !== TokenType.RBRACKET) {
            children.push(plainText());
        }

        // Consume RBRACKET
        if (!match(TokenType.RBRACKET)) {
            throw new Error("Unclosed link: missing RBRACKET");
        }
        const rbracket = nextToken();
        children.push({ type: rbracket.type, value: rbracket.value, children: [] });

        // Consume LPAREN
        if (!match(TokenType.LPAREN)) {
            throw new Error("Invalid link: missing LPAREN");
        }
        const lparen = nextToken();
        children.push({ type: lparen.type, value: lparen.value, children: [] });

        // Parse link URL until RPAREN
        while (peek() && peek()!.type !== TokenType.RPAREN) {
            children.push(plainText());
        }

        // Consume RPAREN
        if (!match(TokenType.RPAREN)) {
            throw new Error("Unclosed link: missing RPAREN");
        }
        const rparen = nextToken();
        children.push({ type: rparen.type, value: rparen.value, children: [] });

        return { type: ASTNodeType.link, children };
    }

    // emoji → LBRACKET EMOJI_TEXT RBRACKET LPAREN CUSTOM_EMOJI_PREFIX NUMBER RPAREN
    function emoji(): ASTNode {
        const children: ASTNode[] = [];

        // Consume LBRACKET
        const lbracket = expect(TokenType.LBRACKET);
        children.push({ type: lbracket.type, value: lbracket.value, children: [] });

        // Consume EMOJI_TEXT
        if (!match(TokenType.EMOJI_TEXT)) {
            throw new Error("Invalid emoji: expected EMOJI_TEXT");
        }
        const emojiText = nextToken();
        children.push({ type: emojiText.type, value: emojiText.value, children: [] });

        // Consume RBRACKET
        if (!match(TokenType.RBRACKET)) {
            throw new Error("Invalid emoji: missing RBRACKET");
        }
        const rbracket = nextToken();
        children.push({ type: rbracket.type, value: rbracket.value, children: [] });

        // Consume LPAREN
        if (!match(TokenType.LPAREN)) {
            throw new Error("Invalid emoji: missing LPAREN");
        }
        const lparen = nextToken();
        children.push({ type: lparen.type, value: lparen.value, children: [] });

        // Consume CUSTOM_EMOJI_PREFIX
        if (!match(TokenType.CUSTOM_EMOJI_PREFIX)) {
            throw new Error("Invalid emoji: missing CUSTOM_EMOJI_PREFIX");
        }
        const prefix = nextToken();
        children.push({ type: prefix.type, value: prefix.value, children: [] });

        // Consume NUMBER
        if (!match(TokenType.NUMBER)) {
            throw new Error("Invalid emoji: missing NUMBER");
        }
        const number = nextToken();
        children.push({ type: number.type, value: number.value, children: [] });

        // Consume RPAREN
        if (!match(TokenType.RPAREN)) {
            throw new Error("Invalid emoji: missing RPAREN");
        }
        const rparen = nextToken();
        children.push({ type: rparen.type, value: rparen.value, children: [] });

        return { type: ASTNodeType.emoji, children };
    }

    // plain_text → TEXT
    function plainText(): ASTNode {
        const token = nextToken();
        return { type: ASTNodeType.plain_text, value: token.value, children: [] };
    }

    // Start parsing from the document rule
    return document();
}
