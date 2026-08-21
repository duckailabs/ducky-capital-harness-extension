import type { AgentProjectDefinition } from "../index";
import type { ValidationResult } from "./types";
export declare function validateAgentProject(project: AgentProjectDefinition, cwd: string): ValidationResult;
export declare function writeValidationReport(cwd: string, validation: ValidationResult, artifactDir?: string): Promise<void>;
export declare function formatValidationReport(validation: ValidationResult): string;
