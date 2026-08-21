export declare const SKILL_MARKDOWN_FILE = "SKILL.md";
export type ParsedSkillMarkdown = {
    name: string | null;
    description: string | null;
    body: string;
    messages: string[];
};
export declare function formatSkillMarkdown(input: {
    name: string;
    description?: string | null;
    body: string;
}): string;
export declare function parseSkillMarkdown(markdown: string): ParsedSkillMarkdown;
export declare function isKebabCaseSkillName(value: string): boolean;
