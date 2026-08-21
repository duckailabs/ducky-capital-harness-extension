import type { ActionCatalogEntry, AgentChatInput, AgentChatResult, AgentProjectDefinition, EvalContext } from "../index";
import type { ExecuteActionOptions, RunState } from "./types";
export declare function createRunState(): RunState;
export declare function executeAction(project: AgentProjectDefinition, actionName: string, input: AgentChatInput, state: RunState, options?: ExecuteActionOptions): Promise<AgentChatResult>;
export declare function runAction(project: AgentProjectDefinition, actionName: string, input?: Record<string, unknown>, options?: ExecuteActionOptions): Promise<{
    result: AgentChatResult;
    state: RunState;
    actionCatalog: ActionCatalogEntry[];
}>;
export declare function runChatAction(project: AgentProjectDefinition, input?: Record<string, unknown>, options?: ExecuteActionOptions): Promise<{
    result: AgentChatResult;
    state: RunState;
    actionCatalog: ActionCatalogEntry[];
}>;
export declare function runEval(project: AgentProjectDefinition): Promise<{
    state: RunState;
    results: Array<{
        name: string;
        status: "passed" | "failed";
        error?: string;
    }>;
}>;
export declare function createEvalContext(project: AgentProjectDefinition, state: RunState): EvalContext;
export declare function writeTrace(cwd: string, name: string, state: RunState, artifactDir?: string): Promise<string>;
