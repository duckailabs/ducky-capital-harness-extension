import type { AgentProjectDefinition } from "../index";
export type AgentProjectSourceMode = "typescript" | "openpond-yaml" | "extends-openpond-yaml";
export type LoadedAgentProject = {
    project: AgentProjectDefinition;
    source: {
        mode: AgentProjectSourceMode;
        configPath: string;
        extendsManifest?: string;
    };
};
export declare function loadAgentProject(cwd: string): Promise<AgentProjectDefinition>;
export declare function loadAgentProjectContext(cwd: string): Promise<LoadedAgentProject>;
