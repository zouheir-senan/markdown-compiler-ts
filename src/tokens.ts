// src/tokens.ts
export enum TokenType {
    // Basic tokens
    TEXT,       // Generic text (used for plain_text or code content)
    NEWLINE,    // "\n" or "\r\n"
    EOF,        // End of file/input

    // Code block tokens
    CODE_FENCE,         // "```" (both start and end of a code block)
    LANGUAGE_SPECIFIER, // Optional language identifier following the opening code fence
    CODE_CONTENT,       // Everything inside a code block (until the closing fence)

    // Inline formatting tokens (these mark both the start and the end)
    BOLD_MARKER,        // "**"
    ITALIC_MARKER,      // "__"
    STRIKE_MARKER,      // "~~"
    SPOILER_MARKER,     // "||"
    INLINE_CODE_MARKER, // "`"

    // Punctuation tokens (used by both emoji and links)
    LBRACKET,           // "["
    RBRACKET,           // "]"
    LPAREN,             // "("
    RPAREN,             // ")"

    // Emoji-specific tokens
    CUSTOM_EMOJI_PREFIX, // Literal "customEmoji:" in an emoji token
    NUMBER,              // One or more digits (for the emoji id)

    // Link-specific tokens (if you wish to distinguish inner text)
    LINK_TEXT,           // Text inside the square brackets of a link
    LINK_URL,            // URL inside the parentheses of a link
}

export interface Token {
    type: TokenType;
    value: string;
}

