import type { AgentProjectDefinition } from "../index";
import { ARTIFACT_SCHEMAS } from "./constants";
import type { CompiledPromptArtifacts } from "./prompts";
export type ArtifactIndexEntry = {
    path: string;
    kind: "agent-manifest" | "action-registry" | "artifact-index" | "inspect" | "runtime-manifest-preview" | "runtime-bridge" | "runtime-bundle" | "validator-report" | "instructions" | "skill" | "skill-file" | "eval-results" | "trace-jsonl";
    schema: string;
    format: "json" | "jsonl" | "yaml" | "markdown" | "javascript";
};
export type ArtifactIndex = {
    schemaVersion: number;
    schema: string;
    artifactSchemas: typeof ARTIFACT_SCHEMAS;
    project: {
        name: string;
        version: string;
    };
    artifactDir: string;
    entries: ArtifactIndexEntry[];
};
export declare function createArtifactIndex(project: AgentProjectDefinition, artifactDir: string, options?: {
    includeStandard?: boolean;
    promptArtifacts?: CompiledPromptArtifacts;
    extraEntries?: ArtifactIndexEntry[];
}): ArtifactIndex;
export declare function writeArtifactIndex(cwd: string, project: AgentProjectDefinition, artifactDir: string, options?: {
    includeStandard?: boolean;
    promptArtifacts?: CompiledPromptArtifacts;
    extraEntries?: ArtifactIndexEntry[];
    mergeExisting?: boolean;
}): Promise<ArtifactIndex>;
export declare function assertArtifactSchemaCompatibility(cwd: string, index: ArtifactIndex): Promise<void>;
export declare function evalResultsEntry(artifactDir: string): ArtifactIndexEntry;
export declare function traceEntry(traceArtifactRef: string): ArtifactIndexEntry;
