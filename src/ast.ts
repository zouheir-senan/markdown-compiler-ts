export interface ASTNode {
    type: string;
    children?: ASTNode[];
    value?: string;
}
