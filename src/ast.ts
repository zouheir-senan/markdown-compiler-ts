import {TokenType} from "./tokens";

export enum ASTNodeType {
    document,
    block,
    code_block,
    paragraph,
    language_specifier,
    code_content,
    newline,
    any_character,
    inline,
    bold,
    italic,
    strike,
    spoiler,
    inline_code,
    emoji,
    link,
    plain_text,


}
export interface ASTNode {
    type: ASTNodeType|TokenType;
    children: ASTNode[];
    value?: string;
}

