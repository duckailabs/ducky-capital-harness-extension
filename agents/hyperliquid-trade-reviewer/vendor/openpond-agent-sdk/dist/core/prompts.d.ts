import type { AgentProjectDefinition } from "../index";
export type CompiledInstructions = {
    schema: string;
    format: "markdown";
    source: string;
    artifactRef: string;
    sourceHash: string;
    charCount: number;
};
export type CompiledSkill = {
    schema: string;
    name: string;
    description: string | null;
    format: "markdown";
    source: string;
    artifactRef: string;
    sourceHash: string;
    charCount: number;
    files: Array<{
        path: string;
        artifactRef: string;
        sourceHash: string;
        charCount: number;
    }>;
};
export type CompiledPromptArtifacts = {
    instructions: CompiledInstructions | null;
    skills: CompiledSkill[];
};
export declare function compilePromptArtifacts(project: AgentProjectDefinition, cwd: string, artifactDir: string): Promise<CompiledPromptArtifacts>;
