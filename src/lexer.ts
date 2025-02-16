// src/lexer.ts
import { Token, TokenType } from "./tokens";

export function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let pos = 0;

    while (pos < input.length) {
        const char = input[pos];

        // Example: detect heading tokens
        if (char === "#") {
            let count = 0;
            while (input[pos] === "#") {
                count++;
                pos++;
            }
            tokens.push({ type: TokenType.HEADING, value: "#".repeat(count) });
            continue;
        }

        // Handle newlines
        if (char === "\n") {
            tokens.push({ type: TokenType.NEWLINE, value: "\n" });
            pos++;
            continue;
        }

        // Simple text capture until a special character is encountered
        let text = "";
        while (pos < input.length && input[pos] !== "#" && input[pos] !== "\n") {
            text += input[pos++];
        }
        if (text) tokens.push({ type: TokenType.TEXT, value: text });
    }

    tokens.push({ type: TokenType.EOF, value: "" });
    return tokens;
}
