// src/lexer.ts
import {Token, TokenType} from "./tokens";
const markers = ["**", "```", "__", "||", "~~", "`", "["];
function startsWithAny(input: string, pos: number, markers: string[]): boolean {
    for (const marker of markers) {
        if (input.startsWith(marker, pos)) {
            return true;
        }
    }
    return false;
}
export function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let pos = 0;

    while (pos < input.length) {
        const char = input[pos];

        // Code fence (```), which may include a language specifier and content.
        if (input.startsWith("```", pos)) {
            const endPos = findMatchingDelimiter(input, "```", pos + 3);
            if (endPos !== -1) {
                // Opening fence
                tokens.push({ type: TokenType.CODE_FENCE, value: "```" });
                pos += 3;

                // Optional language specifier until newline
                const langStart = pos;
                while (pos < input.length && input[pos] !== "\n" && input[pos] !== "\r") {
                    pos++;
                }
                if (pos > langStart) {
                    tokens.push({
                        type: TokenType.LANGUAGE_SPECIFIER,
                        value: input.substring(langStart, pos),
                    });
                }
                // Consume newline if present
                if (pos < input.length && (input[pos] === "\n" || input[pos] === "\r")) {
                    tokens.push({ type: TokenType.NEWLINE, value: input[pos] });
                    pos++;
                }

                // Code content until the closing fence
                if(pos<endPos && input[endPos-1] === "\n" || input[endPos-1] === "\r"){
                    tokens.push({
                        type: TokenType.CODE_CONTENT,
                        value: input.substring(pos, endPos-1),
                    });
                    tokens.push({ type: TokenType.NEWLINE, value: input[endPos-1] });
                }
                else if(pos<endPos){
                    tokens.push({
                        type: TokenType.CODE_CONTENT,
                        value: input.substring(pos, endPos),
                    });
                }
                // Closing fence
                tokens.push({ type: TokenType.CODE_FENCE, value: "```" });
                pos = endPos + 3;
            }
            else {
                tokens.push({ type: TokenType.TEXT, value: "```" });
                pos += 3;
            }
        }
        // Bold marker (**)
        else if (input.startsWith("**", pos)) {
            const endPos = findMatchingDelimiter(input, "**", pos + 2);
            if (endPos !== -1) {
                tokens.push({ type: TokenType.BOLD_MARKER, value: "**" });
                const innerTokens = tokenize(input.substring(pos + 2, endPos));
                innerTokens.pop(); // Removes the EOF token.
                tokens.push(...innerTokens);
                tokens.push({ type: TokenType.BOLD_MARKER, value: "**" });
                pos = endPos + 2;

            }
            else {
                tokens.push({ type: TokenType.TEXT, value: "**" });
                pos+=2;
            }
        }
        // Italic marker (__)
        else if (input.startsWith("__", pos)) {
            const endPos = findMatchingDelimiter(input, "__", pos + 2);
            if (endPos !== -1) {
                tokens.push({ type: TokenType.ITALIC_MARKER, value: "__" });
                const innerTokens = tokenize(input.substring(pos + 2, endPos));
                innerTokens.pop(); // Removes the EOF token.
                tokens.push(...innerTokens);
                tokens.push({ type: TokenType.ITALIC_MARKER, value: "__" });
                pos = endPos + 2;
            }
            else{
                tokens.push({ type: TokenType.TEXT, value: "__" });
                pos+=2;
            }
        }
        // Strike marker (~~)
        else if (input.startsWith("~~", pos)) {
            const endPos = findMatchingDelimiter(input, "~~", pos + 2);
            if (endPos !== -1) {
                tokens.push({ type: TokenType.STRIKE_MARKER, value: "~~" });
                const innerTokens = tokenize(input.substring(pos + 2, endPos));
                innerTokens.pop(); // Removes the EOF token.
                tokens.push(...innerTokens);
                tokens.push({ type: TokenType.STRIKE_MARKER, value: "~~" });
                pos = endPos + 2;
            }
            else{
                tokens.push({ type: TokenType.TEXT, value: "~~" });
                pos+=2;
            }
        }
        // Spoiler marker (||)
        else if (input.startsWith("||", pos)) {
            const endPos = findMatchingDelimiter(input, "||", pos + 2);
            if (endPos !== -1) {
                tokens.push({ type: TokenType.SPOILER_MARKER, value: "||" });
                const innerTokens = tokenize(input.substring(pos + 2, endPos));
                innerTokens.pop(); // Removes the EOF token.
                tokens.push(...innerTokens);
                tokens.push({ type: TokenType.SPOILER_MARKER, value: "||" });
                pos = endPos + 2;
            }
            else{
                tokens.push({ type: TokenType.TEXT, value: "||" });
                pos+=2;
            }
        }
        // Inline code marker (`)
        else if (input.startsWith("`", pos)) {
            const endPos = findMatchingDelimiter(input, "`", pos + 1);
            if (endPos !== -1) {
                tokens.push({ type: TokenType.INLINE_CODE_MARKER, value: "`" });
                const innerTokens = tokenize(input.substring(pos + 1, endPos));
                innerTokens.pop(); // Removes the EOF token.
                tokens.push(...innerTokens);
                tokens.push({ type: TokenType.INLINE_CODE_MARKER, value: "`" });
                pos = endPos + 1;
            }
            else{
                tokens.push({ type: TokenType.TEXT, value: "`" });
                pos+=1;
            }
        }
        // Link markers ([...])
        else if (input.startsWith("[", pos)) {
            // Find the closing bracket for the text inside the square brackets.
            const closingBracket = findMatchingDelimiter(input, "]", pos + 1);
            // Check that there is an opening parenthesis immediately after.
            if (closingBracket !== -1 && input[closingBracket + 1] === "(") {
                const openParen = closingBracket + 1;
                const closingParen = findMatchingDelimiter(input, ")", openParen + 1);
                if (closingParen !== -1) {
                    // Extract the text inside the brackets and the parentheses.
                    const innerText = input.substring(pos + 1, closingBracket);
                    const innerParen = input.substring(openParen + 1, closingParen);

                    // Check if the parenthesis content indicates an emoji.
                    if (innerParen.startsWith("customEmoji:")) {
                        // Tokenize as an emoji.
                        tokens.push({type: TokenType.LBRACKET, value: "["});
                        tokens.push({type: TokenType.EMOJI_TEXT, value: innerText});
                        tokens.push({type: TokenType.RBRACKET, value: "]"});
                        tokens.push({type: TokenType.LPAREN, value: "("});
                        tokens.push({type: TokenType.CUSTOM_EMOJI_PREFIX, value: "customEmoji:"});
                        // Get the emoji id (digits following "customEmoji:")
                        const emojiId = innerParen.substring("customEmoji:".length);
                        tokens.push({type: TokenType.NUMBER, value: emojiId});
                        tokens.push({type: TokenType.RPAREN, value: ")"});
                    } else {
                        // Otherwise, tokenize as a link.
                        tokens.push({type: TokenType.LBRACKET, value: "["});
                        tokens.push({type: TokenType.LINK_TEXT, value: innerText});
                        tokens.push({type: TokenType.RBRACKET, value: "]"});
                        tokens.push({type: TokenType.LPAREN, value: "("});
                        tokens.push({type: TokenType.LINK_URL, value: innerParen});
                        tokens.push({type: TokenType.RPAREN, value: ")"});
                    }
                    // Update the position to the character after the closing parenthesis.
                    pos = closingParen + 1;
                }
                else{
                    tokens.push({ type: TokenType.TEXT, value: "[" });
                    pos+=1;
                }
            }
            else{
                tokens.push({ type: TokenType.TEXT, value: "[" });
                pos+=1;
            }
        }
        // Newline
        else if (char === "\n") {
            tokens.push({ type: TokenType.NEWLINE, value: "\n" });
            pos++;
        }
        // Regular text (until the next newline)
        else {
            let text = "";
            while (pos < input.length && input[pos] !== "\n" && !startsWithAny(input, pos, markers)) {
                text += input[pos++];
            }
            if (text) {
                if(tokens[tokens.length - 1] && tokens[tokens.length - 1].type === TokenType.TEXT) {
                    const lastToken = tokens.pop();
                    tokens.push({ type: TokenType.TEXT, value: lastToken?.value+text});
                }
                else{
                    tokens.push({ type: TokenType.TEXT, value: text });
                }
            }
        }
    }

    tokens.push({ type: TokenType.EOF, value: "" });
    return tokens;
}

export function findMatchingDelimiter(
    input: string,
    delimiter: string,
    startIndex: number
): number {
    return input.indexOf(delimiter, startIndex);
}
