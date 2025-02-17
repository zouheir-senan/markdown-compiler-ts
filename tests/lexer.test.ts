import { tokenize } from "../src/lexer";
import { TokenType } from "../src/tokens";

test("tokenize plain paragraph", () => {
    const input = "This is plain text.\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.TEXT);
    expect(tokens[0].value).toBe("This is plain text.");
    expect(tokens[1].type).toBe(TokenType.NEWLINE);
    expect(tokens[2].type).toBe(TokenType.EOF);
});

test("tokenize code block with language specifier", () => {
    const input = "```js\nconsole.log(\"Hello\");\n```";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[0].value).toBe("```");

    expect(tokens[1].type).toBe(TokenType.LANGUAGE_SPECIFIER);
    expect(tokens[1].value).toBe("js");

    expect(tokens[2].type).toBe(TokenType.NEWLINE);
    expect(tokens[2].value).toBe("\n");

    expect(tokens[3].type).toBe(TokenType.CODE_CONTENT);
    expect(tokens[3].value).toBe("console.log(\"Hello\");");

    expect(tokens[4].type).toBe(TokenType.NEWLINE);
    expect(tokens[4].value).toBe("\n");

    expect(tokens[5].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[5].value).toBe("```");

    expect(tokens[6].type).toBe(TokenType.EOF);
});

test("tokenize code block without language specifier", () => {
    const input = "```\nCode without language\n```";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[0].value).toBe("```");

    // No language specifier: the newline comes directly after the opening fence.
    expect(tokens[1].type).toBe(TokenType.NEWLINE);
    expect(tokens[1].value).toBe("\n");

    expect(tokens[2].type).toBe(TokenType.CODE_CONTENT);
    expect(tokens[2].value).toBe("Code without language");

    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].value).toBe("\n");

    expect(tokens[4].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[4].value).toBe("```");

    expect(tokens[5].type).toBe(TokenType.EOF);
});

test("tokenize bold text", () => {
    const input = "**bold text**\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[0].value).toBe("**");

    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value).toBe("bold text");

    expect(tokens[2].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[2].value).toBe("**");

    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].value).toBe("\n");

    expect(tokens[4].type).toBe(TokenType.EOF);
});

test("tokenize italic text", () => {
    const input = "__italic__\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.ITALIC_MARKER);
    expect(tokens[0].value).toBe("__");

    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value).toBe("italic");

    expect(tokens[2].type).toBe(TokenType.ITALIC_MARKER);
    expect(tokens[2].value).toBe("__");

    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].value).toBe("\n");

    expect(tokens[4].type).toBe(TokenType.EOF);
});

test("tokenize strike text", () => {
    const input = "~~strike~~\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.STRIKE_MARKER);
    expect(tokens[0].value).toBe("~~");

    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value).toBe("strike");

    expect(tokens[2].type).toBe(TokenType.STRIKE_MARKER);
    expect(tokens[2].value).toBe("~~");

    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].value).toBe("\n");

    expect(tokens[4].type).toBe(TokenType.EOF);
});

test("tokenize spoiler text", () => {
    const input = "||spoiler||\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.SPOILER_MARKER);
    expect(tokens[0].value).toBe("||");

    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value).toBe("spoiler");

    expect(tokens[2].type).toBe(TokenType.SPOILER_MARKER);
    expect(tokens[2].value).toBe("||");

    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].value).toBe("\n");

    expect(tokens[4].type).toBe(TokenType.EOF);
});

test("tokenize inline code", () => {
    const input = "`inline code`\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.INLINE_CODE_MARKER);
    expect(tokens[0].value).toBe("`");

    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value).toBe("inline code");

    expect(tokens[2].type).toBe(TokenType.INLINE_CODE_MARKER);
    expect(tokens[2].value).toBe("`");

    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].value).toBe("\n");

    expect(tokens[4].type).toBe(TokenType.EOF);
});

test("tokenize emoji", () => {
    const input = "[smile](customEmoji:123)\n";
    const tokens = tokenize(input);

    expect(tokens[0].type).toBe(TokenType.LBRACKET);
    expect(tokens[0].value).toBe("[");

    // Here we assume the lexer treats the emoji text as generic TEXT.
    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value).toBe("smile");

    expect(tokens[2].type).toBe(TokenType.RBRACKET);
    expect(tokens[2].value).toBe("]");

    expect(tokens[3].type).toBe(TokenType.LPAREN);
    expect(tokens[3].value).toBe("(");

    expect(tokens[4].type).toBe(TokenType.CUSTOM_EMOJI_PREFIX);
    expect(tokens[4].value).toBe("customEmoji:");

    expect(tokens[5].type).toBe(TokenType.NUMBER);
    expect(tokens[5].value).toBe("123");

    expect(tokens[6].type).toBe(TokenType.RPAREN);
    expect(tokens[6].value).toBe(")");

    expect(tokens[7].type).toBe(TokenType.NEWLINE);
    expect(tokens[7].value).toBe("\n");

    expect(tokens[8].type).toBe(TokenType.EOF);
});

test("tokenize link", () => {
    const input = "[OpenAI](https://openai.com)\n";
    const tokens = tokenize(input);

    expect(tokens[0].type).toBe(TokenType.LBRACKET);
    expect(tokens[0].value).toBe("[");

    // Assuming your lexer produces a dedicated token for link text.
    expect(tokens[1].type).toBe(TokenType.LINK_TEXT);
    expect(tokens[1].value).toBe("OpenAI");

    expect(tokens[2].type).toBe(TokenType.RBRACKET);
    expect(tokens[2].value).toBe("]");

    expect(tokens[3].type).toBe(TokenType.LPAREN);
    expect(tokens[3].value).toBe("(");

    expect(tokens[4].type).toBe(TokenType.LINK_URL);
    expect(tokens[4].value).toBe("https://openai.com");

    expect(tokens[5].type).toBe(TokenType.RPAREN);
    expect(tokens[5].value).toBe(")");

    expect(tokens[6].type).toBe(TokenType.NEWLINE);
    expect(tokens[6].value).toBe("\n");

    expect(tokens[7].type).toBe(TokenType.EOF);
});

test("tokenize combined inline formatting", () => {
    const input = "Hello **bold** and __italic__ text\n";
    const tokens = tokenize(input);

    // Expected sequence:
    // TEXT("Hello "), BOLD_MARKER("**"), TEXT("bold"), BOLD_MARKER("**"),
    // TEXT(" and "), ITALIC_MARKER("__"), TEXT("italic"), ITALIC_MARKER("__"),
    // TEXT(" text"), NEWLINE, EOF
    expect(tokens[0].type).toBe(TokenType.TEXT);
    expect(tokens[0].value).toBe("Hello ");

    expect(tokens[1].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[1].value).toBe("**");

    expect(tokens[2].type).toBe(TokenType.TEXT);
    expect(tokens[2].value).toBe("bold");

    expect(tokens[3].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[3].value).toBe("**");

    expect(tokens[4].type).toBe(TokenType.TEXT);
    expect(tokens[4].value).toBe(" and ");

    expect(tokens[5].type).toBe(TokenType.ITALIC_MARKER);
    expect(tokens[5].value).toBe("__");

    expect(tokens[6].type).toBe(TokenType.TEXT);
    expect(tokens[6].value).toBe("italic");

    expect(tokens[7].type).toBe(TokenType.ITALIC_MARKER);
    expect(tokens[7].value).toBe("__");

    expect(tokens[8].type).toBe(TokenType.TEXT);
    expect(tokens[8].value).toBe(" text");

    expect(tokens[9].type).toBe(TokenType.NEWLINE);
    expect(tokens[9].value).toBe("\n");

    expect(tokens[10].type).toBe(TokenType.EOF);
});
test("tokenize complex composition", () => {
    const input =
        "```python\n" +
        "def hello():\n" +
        "    print(\"Hello, world!\")\n" +
        "```\n" +
        "This is a paragraph with **bold text**, __italic text__, and a ~~strikethrough~~. " +
        "Also, inline code: `code snippet`, an emoji: [smile](customEmoji:12345), and a link: [OpenAI](https://openai.com).\n";

    const tokens = tokenize(input);

    const expected = [
        // Code block start
        { type: TokenType.CODE_FENCE, value: "```" },
        { type: TokenType.LANGUAGE_SPECIFIER, value: "python" },
        { type: TokenType.NEWLINE, value: "\n" },
        // Code block content (may include internal newlines)
        { type: TokenType.CODE_CONTENT, value: "def hello():\n    print(\"Hello, world!\")" },
        { type: TokenType.NEWLINE, value: "\n" },
        // Code block end
        { type: TokenType.CODE_FENCE, value: "```" },
        { type: TokenType.NEWLINE, value: "\n" },

        // Paragraph start (plain text)
        { type: TokenType.TEXT, value: "This is a paragraph with " },
        // Bold text
        { type: TokenType.BOLD_MARKER, value: "**" },
        { type: TokenType.TEXT, value: "bold text" },
        { type: TokenType.BOLD_MARKER, value: "**" },
        { type: TokenType.TEXT, value: ", " },
        // Italic text
        { type: TokenType.ITALIC_MARKER, value: "__" },
        { type: TokenType.TEXT, value: "italic text" },
        { type: TokenType.ITALIC_MARKER, value: "__" },
        { type: TokenType.TEXT, value: ", and a " },
        // Strike-through text
        { type: TokenType.STRIKE_MARKER, value: "~~" },
        { type: TokenType.TEXT, value: "strikethrough" },
        { type: TokenType.STRIKE_MARKER, value: "~~" },
        { type: TokenType.TEXT, value: ". Also, inline code: " },
        // Inline code
        { type: TokenType.INLINE_CODE_MARKER, value: "`" },
        { type: TokenType.TEXT, value: "code snippet" },
        { type: TokenType.INLINE_CODE_MARKER, value: "`" },
        { type: TokenType.TEXT, value: ", an emoji: " },
        // Emoji syntax
        { type: TokenType.LBRACKET, value: "[" },
        { type: TokenType.TEXT, value: "smile" },
        { type: TokenType.RBRACKET, value: "]" },
        { type: TokenType.LPAREN, value: "(" },
        { type: TokenType.CUSTOM_EMOJI_PREFIX, value: "customEmoji:" },
        { type: TokenType.NUMBER, value: "12345" },
        { type: TokenType.RPAREN, value: ")" },
        { type: TokenType.TEXT, value: ", and a link: " },
        // Link syntax
        { type: TokenType.LBRACKET, value: "[" },
        { type: TokenType.LINK_TEXT, value: "OpenAI" },
        { type: TokenType.RBRACKET, value: "]" },
        { type: TokenType.LPAREN, value: "(" },
        { type: TokenType.LINK_URL, value: "https://openai.com" },
        { type: TokenType.RPAREN, value: ")" },
        // End of paragraph
        { type: TokenType.NEWLINE, value: "\n" },
        { type: TokenType.EOF, value: "" }
    ];

    expect(tokens).toEqual(expected);
});
