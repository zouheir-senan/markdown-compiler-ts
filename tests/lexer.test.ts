import { tokenize } from "../src/lexer";
import { TokenType } from "../src/tokens";

// Test empty document
test("tokenize empty document", () => {
    const input = "";
    const tokens = tokenize(input);
    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
});

// Test empty paragraph
test("tokenize empty paragraph (just newline)", () => {
    const input = "\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.NEWLINE);
    expect(tokens[1].type).toBe(TokenType.EOF);
});

// Test empty code block
test("tokenize empty code block", () => {
    const input = "```\n```";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[1].type).toBe(TokenType.NEWLINE);
    expect(tokens[2].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[3].type).toBe(TokenType.EOF);
});

// Test code block without language
test("tokenize code block with no content", () => {
    const input = "```\n\n```";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[1].type).toBe(TokenType.NEWLINE);
    expect(tokens[2].type).toBe(TokenType.CODE_CONTENT);
    expect(tokens[2].value).toBe("");
    expect(tokens[3].type).toBe(TokenType.NEWLINE);
    expect(tokens[4].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[5].type).toBe(TokenType.EOF);
});

// Test code block with language but no content
test("tokenize code block with language but no content", () => {
    const input = "```js\n```";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[1].type).toBe(TokenType.LANGUAGE_SPECIFIER);
    expect(tokens[1].value).toBe("js");
    expect(tokens[2].type).toBe(TokenType.NEWLINE);
    expect(tokens[3].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[4].type).toBe(TokenType.EOF);
});

// Test nested code blocks
test("tokenize nested code blocks (invalid but should be handled)", () => {
    const input = "```outer\n```inner\nnested code\n```\nouter continues\n```";
    const tokens = tokenize(input);
    // todo The lexer should treat the first ``` as start of code block
});

// Test code block with backticks inside
test("tokenize code block with backticks inside", () => {
    const input = "```\nThis contains `inline code` inside\n```";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[2].type).toBe(TokenType.CODE_CONTENT);
    expect(tokens[2].value).toBe("This contains `inline code` inside");
    expect(tokens[4].type).toBe(TokenType.CODE_FENCE);
});

// Test multiple consecutive code blocks
test("tokenize multiple consecutive code blocks", () => {
    const input = "```go\ncode1\n```\n```python\ncode2\n```";
    const tokens = tokenize(input);
    // Verify first code block
    expect(tokens[0].type).toBe(TokenType.CODE_FENCE);
    expect(tokens[1].type).toBe(TokenType.LANGUAGE_SPECIFIER);
    expect(tokens[1].value).toBe("go");
    // Verify second code block starts after first one ends
    const secondBlockStartIdx = tokens.findIndex(
        (t, i) => t.type === TokenType.CODE_FENCE && i > 5
    );
    expect(secondBlockStartIdx).toBeGreaterThan(5);
    expect(tokens[secondBlockStartIdx + 1].type).toBe(TokenType.LANGUAGE_SPECIFIER);
    expect(tokens[secondBlockStartIdx + 1].value).toBe("python");
});

// Test empty bold
test("tokenize empty bold markers", () => {
    const input = "****";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[1].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[2].type).toBe(TokenType.EOF);
});

// Test nested bold
test("tokenize nested bold markers", () => {
    const input = "**Bold with **nested bold** text**";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    // Check that the nested bold tokens are properly recognized
    const nestedBoldStartIdx = tokens.findIndex(
        (t, i) => t.type === TokenType.BOLD_MARKER && i > 0
    );
    expect(nestedBoldStartIdx).toBeGreaterThan(0);
});

// Test unmatched bold
test("tokenize unmatched bold marker", () => {
    const input = "**unmatched bold";
    const tokens = tokenize(input);
    // The lexer should treat this as text if it can't find matching marker
    expect(tokens.some(t => t.type === TokenType.BOLD_MARKER)).toBe(false);
    expect(tokens[0].type).toBe(TokenType.TEXT);
});

// Test empty italic
test("tokenize empty italic markers", () => {
    const input = "____";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.ITALIC_MARKER);
    expect(tokens[1].type).toBe(TokenType.ITALIC_MARKER);
    expect(tokens[2].type).toBe(TokenType.EOF);
});

// Test nested formatting
test("tokenize complex nested formatting", () => {
    const input = "**Bold text with __italic ~~struck ||spoiler|| content~~ inside__ it**";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    // Verify we have text, then italic marker, then text, then strike marker, etc.
    let hasItalicMarker = tokens.some(t => t.type === TokenType.ITALIC_MARKER);
    let hasStrikeMarker = tokens.some(t => t.type === TokenType.STRIKE_MARKER);
    let hasSpoilerMarker = tokens.some(t => t.type === TokenType.SPOILER_MARKER);
    expect(hasItalicMarker).toBe(true);
    expect(hasStrikeMarker).toBe(true);
    expect(hasSpoilerMarker).toBe(true);
});

// Test empty spoiler
test("tokenize empty spoiler markers", () => {
    const input = "||||";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.SPOILER_MARKER);
    expect(tokens[1].type).toBe(TokenType.SPOILER_MARKER);
    expect(tokens[2].type).toBe(TokenType.EOF);
});

// Test empty inline code
test("tokenize empty inline code markers", () => {
    const input = "``";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.INLINE_CODE_MARKER);
    expect(tokens[1].type).toBe(TokenType.INLINE_CODE_MARKER);
    expect(tokens[2].type).toBe(TokenType.EOF);
});

// Test backtick inside inline code
test("tokenize backtick inside inline code (escaped)", () => {
    const input = "`` `backtick inside` ``";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.INLINE_CODE_MARKER);
    // Should have inner text containing the backticks
    expect(tokens[4].value).toContain("backtick inside");
});

// Test emoji edge cases
test("tokenize emoji with empty name", () => {
    const input = "[](customEmoji:123)";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.LBRACKET);
    expect(tokens[1].type).toBe(TokenType.EMOJI_TEXT);
    expect(tokens[1].value).toBe("");
    expect(tokens[2].type).toBe(TokenType.RBRACKET);
    expect(tokens[3].type).toBe(TokenType.LPAREN);
    expect(tokens[4].type).toBe(TokenType.CUSTOM_EMOJI_PREFIX);
    expect(tokens[5].type).toBe(TokenType.NUMBER);
    expect(tokens[5].value).toBe("123");
});

// Test emoji with very large number
test("tokenize emoji with very large ID", () => {
    const input = "[large](customEmoji:9999999999)";
    const tokens = tokenize(input);
    expect(tokens[5].type).toBe(TokenType.NUMBER);
    expect(tokens[5].value).toBe("9999999999");
});

// Test link edge cases
test("tokenize link with empty text", () => {
    const input = "[](https://example.com)";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.LBRACKET);
    expect(tokens[1].type).toBe(TokenType.LINK_TEXT);
    expect(tokens[1].value).toBe("");
    expect(tokens[2].type).toBe(TokenType.RBRACKET);
    expect(tokens[3].type).toBe(TokenType.LPAREN);
    expect(tokens[4].type).toBe(TokenType.LINK_URL);
    expect(tokens[4].value).toBe("https://example.com");
    expect(tokens[5].type).toBe(TokenType.RPAREN);
});

// Test link with empty URL
test("tokenize link with empty URL", () => {
    const input = "[text]()";
    const tokens = tokenize(input);
    expect(tokens[4].type).toBe(TokenType.LINK_URL);
    expect(tokens[4].value).toBe("");
});

// Test nested brackets in link text
test("tokenize link with nested brackets in text", () => {
    const input = "[[nested] brackets](https://example.com)";
    const tokens = tokenize(input);
    // Check if the full text with brackets is captured
    expect(tokens[1].type).toBe(TokenType.TEXT);
});

// Test links with special characters
test("tokenize link with special characters in URL", () => {
    const input = "[special](https://example.com/?q=1&b=2#fragment)";
    const tokens = tokenize(input);
    expect(tokens[4].type).toBe(TokenType.LINK_URL);
    expect(tokens[4].value).toBe("https://example.com/?q=1&b=2#fragment");
});

// Test line breaks within formatting
test("tokenize line breaks within formatting", () => {
    const input = "**Bold text\ncontinuing on next line**";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    // The newline should be preserved inside the bold text
    expect(tokens.some(t => t.type === TokenType.NEWLINE)).toBe(true);
    expect(tokens[tokens.length - 2].type).toBe(TokenType.BOLD_MARKER);
});

// Test mixed block and inline
test("tokenize mixed block and inline elements", () => {
    const input = "```\nCode block\n```\n**Bold after code block**";
    const tokens = tokenize(input);
    // Verify code block ends before bold starts
    const codeBlockEndIdx = tokens.findIndex((t, i) => t.type === TokenType.CODE_FENCE && i > 0);
    const boldStartIdx = tokens.findIndex(t => t.type === TokenType.BOLD_MARKER);
    expect(codeBlockEndIdx).toBeLessThan(boldStartIdx);
});

// Test paragraph with all inline elements
test("tokenize paragraph with all inline elements", () => {
    const input = "Plain text **bold** __italic__ ~~strike~~ ||spoiler|| `code` [emoji](customEmoji:123) [link](https://example.com)";
    const tokens = tokenize(input);
    // Verify we have all element types
    expect(tokens.some(t => t.type === TokenType.BOLD_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.ITALIC_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.STRIKE_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.SPOILER_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.INLINE_CODE_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.CUSTOM_EMOJI_PREFIX)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.LINK_URL)).toBe(true);
});

// Test extremely long inline content
test("tokenize extremely long content", () => {
    const longText = "Bold text that goes on for a very long time ".repeat(50);
    const input = `**${longText}**`;
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[1].value.length).toBeGreaterThan(1000);
    expect(tokens[2].type).toBe(TokenType.BOLD_MARKER);
});

// Test Unicode content
test("tokenize unicode content in various elements", () => {
    const input = "**Bold 你好** __Italic 世界__ ~~Strike 😊~~ ||Spoiler 🌍|| `Code 유니코드` [😎](customEmoji:123) [链接](https://例子.com)";
    const tokens = tokenize(input);
    // Check if Unicode characters are properly preserved
    expect(tokens.some(t => t.type === TokenType.TEXT && t.value.includes("你好"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.TEXT && t.value.includes("世界"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.TEXT && t.value.includes("😊"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.TEXT && t.value.includes("🌍"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.TEXT && t.value.includes("유니코드"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.EMOJI_TEXT && t.value.includes("😎"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.LINK_TEXT && t.value.includes("链接"))).toBe(true);
    expect(tokens.some(t => t.type === TokenType.LINK_URL && t.value.includes("例子.com"))).toBe(true);
});

// Test ambiguous parsing cases
test("tokenize ambiguous parsing cases", () => {
    const input = "**Bold__Not Italic__Still Bold**";
    const tokens = tokenize(input);
    // The lexer should interpret this as bold containing text with underscores
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    //  ITALIC_MARKER should be found
    expect(tokens.some(t => t.type === TokenType.ITALIC_MARKER)).toBe(true);
});

// Test mixed whitespace cases
test("tokenize text with extra whitespace", () => {
    const input = "**Bold  With  Extra  Spaces**";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    expect(tokens[1].type).toBe(TokenType.TEXT);
    // Spaces should be preserved in text
    expect(tokens[1].value).toBe("Bold  With  Extra  Spaces");
});

// Test malformed but recoverable input
test("tokenize malformed but recoverable input", () => {
    const input = "**Unclosed Bold __Unclosed Italic\nThis should continue as plain text";
    const tokens = tokenize(input);
    // Since bold is unclosed, it should be treated as text
    expect(tokens[0].type).toBe(TokenType.TEXT);
    // Verify we have a newline
    expect(tokens.some(t => t.type === TokenType.NEWLINE)).toBe(true);
});

// Test pathological nesting
test("tokenize pathological nesting", () => {
    const input = "**Bold __Italic ~~Strike ||Spoiler `Code [Emoji](customEmoji:123) [Link](https://deep.com) Link2` Spoiler2|| Strike2~~ Italic2__ Bold2**";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.BOLD_MARKER);
    // Verify that we have all marker types
    expect(tokens.some(t => t.type === TokenType.ITALIC_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.STRIKE_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.SPOILER_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.INLINE_CODE_MARKER)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.CUSTOM_EMOJI_PREFIX)).toBe(true);
    expect(tokens.some(t => t.type === TokenType.LINK_URL)).toBe(true);
});

// Character escaping edge cases
test("tokenize escaped characters", () => {
    const input = "\\**Not Bold\\** \\__Not Italic\\__ \\~~Not Strike\\~~ \\||Not Spoiler\\|| \\`Not Code\\` \\[Not Emoji\\]\\(customEmoji:123\\) \\[Not Link\\]\\(https://example.com\\)";
    const tokens = tokenize(input);
    // No markdown tokens should be found, just TEXT
    //expect(tokens.every(t => t.type === TokenType.TEXT || t.type === TokenType.EOF)).toBe(true);
    // todo Character escaping edge cases
});
