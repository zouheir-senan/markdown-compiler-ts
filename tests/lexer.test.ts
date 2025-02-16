import { tokenize } from "../src/lexer";
import { TokenType } from "../src/tokens";

test("tokenize heading", () => {
    const input = "# Hello\n";
    const tokens = tokenize(input);
    expect(tokens[0].type).toBe(TokenType.HEADING);
    expect(tokens[1].type).toBe(TokenType.TEXT);
    expect(tokens[2].type).toBe(TokenType.NEWLINE);
});
