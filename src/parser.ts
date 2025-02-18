// src/parser.ts
import { Token, TokenType } from "./tokens";
import { ASTNode, ASTNodeType } from "./ast";

export function parse(tokens: Token[]): ASTNode {
    let pos = 0;

    // Safely peek ahead without advancing the position.
    function peek(offset = 0): Token | undefined {
        return tokens[pos + offset];
    }

    // Return the next token and advance the position.
    function nextToken(): Token {
        if (pos >= tokens.length) {
            throw new Error("Unexpected end of input");
        }
        return tokens[pos++];
    }

    // Parse the entire document.
    function document(): ASTNode {
        const children: ASTNode[] = [];
        while (peek() && peek()!.type !== TokenType.EOF) {
            const node = block();
            if (node) children.push(node);
        }
        return { type: ASTNodeType.document, children };
    }

    // Parse a block-level element (code block or paragraph).
    function block(): ASTNode {
        let node: ASTNode;
        if (peek() && peek()!.type === TokenType.CODE_FENCE) {
            node = codeBlock();
        } else {
            node = paragraph();
        }
        // Wrap the node in a generic block node.
        return { type: ASTNodeType.block, children: [node] };
    }

    // Parse a code block delimited by CODE_FENCE tokens.
    function codeBlock(): ASTNode {
        const children: ASTNode[] = [];

        // Opening code fence.
        let token = nextToken();
        children.push({ type: token.type, value: token.value, children: [] });

        // Code content until closing fence.
        token = nextToken();
        while (token && token.type !== TokenType.CODE_FENCE) {
            // Wrap content as a code_content node.
            children.push({ type: ASTNodeType.code_content, value: token.value, children: [] });
            token = nextToken();
        }
        if (!token || token.type !== TokenType.CODE_FENCE) {
            throw new Error("Unclosed code fence");
        }
        // Closing code fence.
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.code_block, children };
    }

    // Parse a paragraph until a block-level token (like a code fence or EOF) is encountered.
    function paragraph(): ASTNode {
        const children: ASTNode[] = [];
        while (
            peek() &&
            peek()!.type !== TokenType.CODE_FENCE &&
            peek()!.type !== TokenType.EOF
            ) {
            children.push(inline());
        }
        return { type: ASTNodeType.paragraph, children };
    }

    // Parse inline elements based on the current token.
    function inline(): ASTNode {
        const currentToken = peek();
        if (!currentToken) {
            throw new Error("Unexpected end of input in inline content");
        }
        switch (currentToken.type) {
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
                // If the token following LBRACKET is EMOJI_TEXT, treat it as an emoji.
                if (peek(1) && peek(1)!.type === TokenType.EMOJI_TEXT) {
                    return emoji();
                } else {
                    return link();
                }
            default:
                return plainText();
        }
    }

    // Parse a link delimited by LBRACKET and RPAREN.
    function link(): ASTNode {
        const children: ASTNode[] = [];
        // Consume LBRACKET.
        let token = nextToken();
        children.push({ type: token.type, value: token.value, children: [] });
        // Accumulate the link text until a closing RPAREN.
        while (peek() && peek()!.type !== TokenType.RPAREN) {
            // Here we treat the inside as plain text.
            children.push(plainText());
        }
        if (!peek() || peek()!.type !== TokenType.RPAREN) {
            throw new Error("Unclosed link: missing RPAREN");
        }
        token = nextToken(); // Consume RPAREN.
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.link, children };
    }

    // Parse an emoji which is similar to a link but with specific expectations.
    function emoji(): ASTNode {
        const children: ASTNode[] = [];
        // Consume LBRACKET.
        let token = nextToken();
        children.push({ type: token.type, value: token.value, children: [] });
        // Next token must be EMOJI_TEXT.
        token = nextToken();
        if (token.type !== TokenType.EMOJI_TEXT) {
            throw new Error("Invalid emoji: Expected EMOJI_TEXT");
        }
        children.push({ type: ASTNodeType.emoji, value: token.value, children: [] });
        // Consume closing RPAREN.
        token = nextToken();
        if (!token || token.type !== TokenType.RPAREN) {
            throw new Error("Invalid emoji: missing RPAREN");
        }
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.emoji, children };
    }

    // Parse bold text enclosed by bold markers.
    function bold(): ASTNode {
        const children: ASTNode[] = [];
        // Consume the opening bold marker.
        let token = nextToken();
        children.push({ type: token.type, value: token.value, children: [] });
        // Process inline content until the closing bold marker.
        while (peek() && peek()!.type !== TokenType.BOLD_MARKER) {
            children.push(inline());
        }
        if (!peek() || peek()!.type !== TokenType.BOLD_MARKER) {
            throw new Error("Unclosed bold marker");
        }
        // Consume the closing bold marker.
        token = nextToken();
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.bold, children };
    }

    // Parse italic text enclosed by italic markers.
    function italic(): ASTNode {
        const children: ASTNode[] = [];
        let token = nextToken(); // Consume opening italic marker.
        children.push({ type: token.type, value: token.value, children: [] });
        while (peek() && peek()!.type !== TokenType.ITALIC_MARKER) {
            children.push(inline());
        }
        if (!peek() || peek()!.type !== TokenType.ITALIC_MARKER) {
            throw new Error("Unclosed italic marker");
        }
        token = nextToken(); // Consume closing italic marker.
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.italic, children };
    }

    // Parse strikethrough text.
    function strike(): ASTNode {
        const children: ASTNode[] = [];
        let token = nextToken(); // Consume opening strike marker.
        children.push({ type: token.type, value: token.value, children: [] });
        while (peek() && peek()!.type !== TokenType.STRIKE_MARKER) {
            children.push(inline());
        }
        if (!peek() || peek()!.type !== TokenType.STRIKE_MARKER) {
            throw new Error("Unclosed strike marker");
        }
        token = nextToken(); // Consume closing strike marker.
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.strike, children };
    }

    // Parse spoiler text.
    function spoiler(): ASTNode {
        const children: ASTNode[] = [];
        let token = nextToken(); // Consume opening spoiler marker.
        children.push({ type: token.type, value: token.value, children: [] });
        while (peek() && peek()!.type !== TokenType.SPOILER_MARKER) {
            children.push(inline());
        }
        if (!peek() || peek()!.type !== TokenType.SPOILER_MARKER) {
            throw new Error("Unclosed spoiler marker");
        }
        token = nextToken(); // Consume closing spoiler marker.
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.spoiler, children };
    }

    // Parse inline code.
    function inlineCode(): ASTNode {
        const children: ASTNode[] = [];
        let token = nextToken(); // Consume opening inline code marker.
        children.push({ type: token.type, value: token.value, children: [] });
        while (peek() && peek()!.type !== TokenType.INLINE_CODE_MARKER) {
            // For inline code, we treat the content as plain text.
            const contentToken = nextToken();
            children.push({ type: ASTNodeType.plain_text, value: contentToken.value, children: [] });
        }
        if (!peek() || peek()!.type !== TokenType.INLINE_CODE_MARKER) {
            throw new Error("Unclosed inline code marker");
        }
        token = nextToken(); // Consume closing inline code marker.
        children.push({ type: token.type, value: token.value, children: [] });
        return { type: ASTNodeType.inline_code, children };
    }

    // Parse a plain text token.
    function plainText(): ASTNode {
        const token = nextToken();
        return { type: ASTNodeType.plain_text, value: token.value, children: [] };
    }

    return document();
}
