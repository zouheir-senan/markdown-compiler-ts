// src/tokens.ts
export enum TokenType {
    HEADING,
    EMPHASIS,
    STRONG,
    TEXT,
    NEWLINE,
    EOF
}

export interface Token {
    type: TokenType;
    value: string;
}
