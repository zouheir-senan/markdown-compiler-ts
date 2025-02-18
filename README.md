# Markdown Compiler in TypeScript

A high-performance Markdown compiler written in TypeScript. This project converts a subset of CommonMark Markdown into HTML using a modular architecture.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Grammar](#grammar)
- [LL(1) Parsing Table](#ll1-parsing-table)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Running Tests](#running-tests)

## Overview

The compiler consists of the following stages:

1. **Lexical Analysis (Lexer):**  
   Converts the raw Markdown input into a stream of tokens.

2. **Syntax Analysis (Parser):**  
   Processes the token stream and builds an Abstract Syntax Tree (AST) based on the defined grammar.

3. **Code Generation (Generator):**  
   Traverses the AST and produces the final HTML output.

## Architecture

This project is a custom markup parser that converts text with special formatting markers (e.g., **bold**, __italic__, `inline code`, etc.) into HTML. The parser is implemented using a recursive descent approach (an LL(1) parser with some localized additional lookahead) and comprises three main components:

- **Lexer**: Converts input text into a stream of tokens. ([src/lexer.ts](src/lexer.ts))
- **Parser**: Consumes tokens to build an Abstract Syntax Tree (AST). ([src/parser.ts](src/parser.ts))
- **HTML Generator**: Traverses the AST and produces HTML output. ([src/generateHTML.ts](src/generateHTML.ts))

Additionally, there is a comprehensive suite of tests to verify functionality at the unit and integration levels. ([tests/](tests/))

### Architecture Diagram

Below is a graphical representation of the compiler architecture:

```mermaid
graph TD
    A[Input Markdown]
    B[Lexer]
    C[Parser]
    D[AST]
    E[Code Generator]
    F[Output HTML]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
```

## Grammar

The language handled by the parser is defined by the following grammar in a BNF-style notation:

```
<document> ::= <block>* EOF

<block> ::= <code_block> | <paragraph>

<code_block> ::= CODE_FENCE [<language_specifier>] [<newline>] <code_content> [<newline>] CODE_FENCE

<language_specifier> ::= LANGUAGE_SPECIFIER

<code_content> ::= CODE_CONTENT

<paragraph> ::= <inline>+

<inline> ::= <bold> | <italic> | <strike> | <spoiler> | <inline_code> | <link> | <emoji> | <plain_text>

<bold> ::= BOLD_MARKER <inline>+ BOLD_MARKER

<italic> ::= ITALIC_MARKER <inline>+ ITALIC_MARKER

<strike> ::= STRIKE_MARKER <inline>+ STRIKE_MARKER

<spoiler> ::= SPOILER_MARKER <inline>+ SPOILER_MARKER

<inline_code> ::= INLINE_CODE_MARKER <plain_text> INLINE_CODE_MARKER

<link> ::= LBRACKET <link_text> RBRACKET LPAREN <link_url> RPAREN

<emoji> ::= LBRACKET EMOJI_TEXT RBRACKET LPAREN CUSTOM_EMOJI_PREFIX NUMBER RPAREN

<plain_text> ::= TEXT

<link_text> ::= TEXT

<link_url> ::= TEXT

<newline> ::= NEWLINE
```

**Note**:
- **Optional elements** are enclosed in square brackets `[ ]`.
- The `+` sign indicates one or more repetitions.

## LL(1) Parsing Table

Below is an LL(1) parsing table constructed for the grammar. Nonterminals are listed in the left column and for each lookahead terminal the table provides the production to apply.

| **Nonterminal**             | **Terminal(s)**                                                                                                              | **Production**                                                                                                      |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| **document**                | CODE_FENCE, BOLD_MARKER, ITALIC_MARKER, STRIKE_MARKER, SPOILER_MARKER, INLINE_CODE_MARKER, LBRACKET, TEXT                     | document → block document′                                                                                          |
| **document**                | EOF                                                                                                                          | document → ε                                                                                                        |
| **document′**               | CODE_FENCE, BOLD_MARKER, ITALIC_MARKER, STRIKE_MARKER, SPOILER_MARKER, INLINE_CODE_MARKER, LBRACKET, TEXT                     | document′ → block document′                                                                                         |
| **document′**               | EOF                                                                                                                          | document′ → ε                                                                                                        |
| **block**                   | CODE_FENCE                                                                                                                   | block → code_block                                                                                                  |
| **block**                   | BOLD_MARKER, ITALIC_MARKER, STRIKE_MARKER, SPOILER_MARKER, INLINE_CODE_MARKER, LBRACKET, TEXT                                 | block → paragraph                                                                                                   |
| **code_block**              | CODE_FENCE                                                                                                                   | code_block → CODE_FENCE language_specifier_opt newline_opt code_content newline_opt CODE_FENCE                        |
| **language_specifier_opt**  | LANGUAGE_SPECIFIER                                                                                                           | language_specifier_opt → language_specifier                                                                          |
| **language_specifier_opt**  | (FOLLOW set e.g. NEWLINE or CODE_CONTENT)                                                                                    | language_specifier_opt → ε                                                                                            |
| **newline_opt**             | NEWLINE                                                                                                                      | newline_opt → newline                                                                                               |
| **newline_opt**             | (FOLLOW set e.g. CODE_CONTENT or CODE_FENCE)                                                                                 | newline_opt → ε                                                                                                     |
| **code_content**            | CODE_CONTENT                                                                                                                 | code_content → CODE_CONTENT                                                                                         |
| **paragraph**               | BOLD_MARKER, ITALIC_MARKER, STRIKE_MARKER, SPOILER_MARKER, INLINE_CODE_MARKER, LBRACKET, TEXT                                 | paragraph → inline paragraph′                                                                                       |
| **paragraph′**              | BOLD_MARKER, ITALIC_MARKER, STRIKE_MARKER, SPOILER_MARKER, INLINE_CODE_MARKER, LBRACKET, TEXT                                 | paragraph′ → inline paragraph′                                                                                      |
| **paragraph′**              | (FOLLOW set e.g. EOF, NEWLINE, CODE_FENCE)                                                                                   | paragraph′ → ε                                                                                                      |
| **inline**                  | BOLD_MARKER                                                                                                                  | inline → bold                                                                                                       |
| **inline**                  | ITALIC_MARKER                                                                                                                | inline → italic                                                                                                     |
| **inline**                  | STRIKE_MARKER                                                                                                                | inline → strike                                                                                                     |
| **inline**                  | SPOILER_MARKER                                                                                                               | inline → spoiler                                                                                                    |
| **inline**                  | INLINE_CODE_MARKER                                                                                                           | inline → inline_code                                                                                                |
| **inline**                  | LBRACKET                                                                                                                     | inline → link or emoji (determined via additional lookahead)                                                        |
| **inline**                  | TEXT                                                                                                                         | inline → plain_text                                                                                                 |
| **bold**                    | BOLD_MARKER                                                                                                                  | bold → BOLD_MARKER inline+ BOLD_MARKER                                                                                |
| **italic**                  | ITALIC_MARKER                                                                                                                | italic → ITALIC_MARKER inline+ ITALIC_MARKER                                                                          |
| **strike**                  | STRIKE_MARKER                                                                                                                | strike → STRIKE_MARKER inline+ STRIKE_MARKER                                                                          |
| **spoiler**                 | SPOILER_MARKER                                                                                                               | spoiler → SPOILER_MARKER inline+ SPOILER_MARKER                                                                       |
| **inline_code**             | INLINE_CODE_MARKER                                                                                                           | inline_code → INLINE_CODE_MARKER plain_text INLINE_CODE_MARKER                                                        |
| **link**                    | LBRACKET                                                                                                                     | link → LBRACKET link_text RBRACKET LPAREN link_url RPAREN                                                             |
| **emoji**                   | LBRACKET                                                                                                                     | emoji → LBRACKET EMOJI_TEXT RBRACKET LPAREN CUSTOM_EMOJI_PREFIX NUMBER RPAREN                                          |
| **plain_text**              | TEXT                                                                                                                         | plain_text → TEXT                                                                                                   |
| **link_text**               | TEXT                                                                                                                         | link_text → TEXT                                                                                                    |
| **link_url**                | TEXT                                                                                                                         | link_url → TEXT                                                                                                     |
| **newline**                 | NEWLINE                                                                                                                      | newline → NEWLINE                                                                                                   |

**Note**:
- Optional and repeated constructs have been refactored (e.g., `document′`, `paragraph′`, `language_specifier_opt`, `newline_opt`) to ensure the grammar is LL(1).
- For nonterminals with multiple possibilities (e.g., `inline` when the lookahead is LBRACKET), additional lookahead is used to determine whether to parse a link or an emoji.

## Project Structure

```
project-root/
├── src/
│   ├── lexer.ts         # Lexical analysis: converts input text into tokens.
│   ├── parser.ts        # Parser: builds an AST from the token stream.
│   ├── generateHTML.ts  # HTML generator: converts the AST into HTML.
│   └── ast.ts           # AST definitions and node types.
├── tests/
│   ├── parser.test.ts           # Unit tests for the parser.
│   ├── generateHTML.test.ts     # Unit tests for the HTML generator.
│   ├── integration.test.ts      # Integration tests (Parser + HTML generator).
│   └── integration.full.test.ts # Full pipeline integration (Lexer → Parser → HTML).
├── package.json         # Project configuration and dependencies.
└── README.md            # Project documentation (this file).
```

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-project.git
   cd your-project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Usage

You can use the parser and HTML generator by importing the relevant functions. For example:

```typescript
import { tokenize } from "./src/lexer";
import { parse } from "./src/parser";
import { generateHTML } from "./src/generator";

const input = "Hello, **world**!";
const tokens = tokenize(input);
const ast = parse(tokens);
const html = generateHTML(ast);

console.log(html); // Outputs: <p>Hello, <strong>world</strong>!</p>
```

## Running Tests

To run the unit and integration tests, use:

```bash
npm test
```

This command runs Jest, which executes tests found in the tests/ directory.
