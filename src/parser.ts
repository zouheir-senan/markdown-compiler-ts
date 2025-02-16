// src/parser.ts
import { Token, TokenType } from "./tokens";
import { ASTNode } from "./ast";

export function parse(tokens: Token[]): ASTNode {
    let pos = 0;

    function nextToken(): Token {
        return tokens[pos++];
    }

    function parseNode(): ASTNode | null {
        const token = tokens[pos];
        if (!token) return null;

        if (token.type === TokenType.HEADING) {
            // Consume heading token and following text tokens until newline
            const headingToken = nextToken();
            let content = "";
            while (tokens[pos] && tokens[pos].type !== TokenType.NEWLINE) {
                content += nextToken().value;
            }
            // Skip the newline
            if (tokens[pos] && tokens[pos].type === TokenType.NEWLINE) nextToken();
            return { type: "heading", value: content.trim() };
        }
        // Fallback: parse a paragraph
        let paragraph = "";
        while (tokens[pos] && tokens[pos].type !== TokenType.NEWLINE && tokens[pos].type !== TokenType.EOF) {
            paragraph += nextToken().value;
        }
        // Skip the newline if present
        if (tokens[pos] && tokens[pos].type === TokenType.NEWLINE) nextToken();
        return { type: "paragraph", value: paragraph.trim() };
    }

    const children: ASTNode[] = [];
    while (tokens[pos] && tokens[pos].type !== TokenType.EOF) {
        const node = parseNode();
        if (node) children.push(node);
    }

    return { type: "document", children };
}
