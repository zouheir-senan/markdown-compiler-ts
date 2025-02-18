// tests/integration.full.test.ts
import { tokenize } from "../src/lexer";
import { parse } from "../src/parser";
import { generateHTML } from "../src/generator";

describe("Full Integration: Lexer → Parser → generateHTML", () => {
    it("should process plain text input", () => {
        const input = "Hello, world!";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Expecting the parser to wrap plain text in a paragraph.
        expect(html).toBe("<p>Hello, world!</p>");
    });

    it("should process bold text", () => {
        const input = "**Bold Text**";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Bold text should be wrapped in a <strong> tag inside a paragraph.
        expect(html).toBe("<p><strong>Bold Text</strong></p>");
    });

    it("should process italic text", () => {
        const input = "__Italic Text__";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Italic text should be wrapped in an <em> tag inside a paragraph.
        expect(html).toBe("<p><em>Italic Text</em></p>");
    });

    it("should process inline code", () => {
        const input = "`console.log('hi')`";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Inline code should be wrapped in a <code> tag inside a paragraph.
        expect(html).toBe("<p><code>console.log('hi')</code></p>");
    });

    it("should process a code block", () => {
        // The code block has an opening fence, an optional language specifier (omitted here),
        // a newline, the code content, and a closing fence.
        const input = "```\nconsole.log('Hello');\n```";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Assuming generateHTML for a code block produces <pre><code>...</code></pre>
        expect(html).toBe("<pre><code>console.log('Hello');</code></pre>");
    });

    it("should process a link", () => {
        const input = "[Link](https://example.com)";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Our generateHTML currently wraps links in <a href="#">...</a>
        expect(html).toBe("<p><a href=\"#\">Link</a></p>");
    });

    it("should process an emoji", () => {
        // Using the custom emoji format as defined in your lexer.
        // When the content inside the parenthesis starts with "customEmoji:",
        // the lexer tokenizes it as an emoji.
        const input = "[😊](customEmoji:12345)";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // Our generateHTML for emoji is set to return the emoji's value.
        expect(html).toBe("<p>😊</p>");
    });

    it("should process mixed content", () => {
        // This input mixes plain text with bold, italic, and inline code.
        const input = "Hello, **world**! __Nice__ day with `code`.";
        const tokens = tokenize(input);
        const ast = parse(tokens);
        const html = generateHTML(ast);
        // The expected output is the entire input wrapped in a paragraph,
        // with the inline formatting rendered as the appropriate HTML.
        expect(html).toBe("<p>Hello, <strong>world</strong>! <em>Nice</em> day with <code>code</code>.</p>");
    });
});
