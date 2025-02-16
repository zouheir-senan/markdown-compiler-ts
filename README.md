# Markdown Compiler in TypeScript

A high-performance Markdown compiler written in TypeScript. This project converts a subset of CommonMark Markdown into HTML using a modular architecture.

## Overview

The compiler consists of the following stages:

1. **Lexical Analysis (Lexer):**  
   Converts the raw Markdown input into a stream of tokens.

2. **Syntax Analysis (Parser):**  
   Processes the token stream and builds an Abstract Syntax Tree (AST) based on the defined grammar (see `COMMONMARK_GRAMMAR.txt`).

3. **Code Generation (Generator):**  
   Traverses the AST and produces the final HTML output.

## Architecture Diagram

Below is a graphical representation of the compiler architecture:

```mermaid
graph TD
    A[Input Markdown]
    B[Lexer ]
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
