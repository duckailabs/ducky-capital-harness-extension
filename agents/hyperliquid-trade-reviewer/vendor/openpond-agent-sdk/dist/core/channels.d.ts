import type { AgentChannelId, AgentChatInput, AgentChatResult, AgentProjectDefinition } from "../index";
export type ChannelSetupProjection = {
    id: AgentChannelId;
    targetAction: string;
    enabledByDefault: boolean;
    requiredConnections: string[];
    capabilities: string[];
    setupRequirements: Array<{
        kind: "integration";
        name: string;
        required: true;
        satisfied: boolean;
    }>;
    setupStatus: "ready" | "missing_setup";
};
export declare function normalizeChannelEvent(project: AgentProjectDefinition, channelId: AgentChannelId, event: Record<string, unknown>): AgentChatInput;
export declare function renderChannelResponse(project: AgentProjectDefinition, channelId: AgentChannelId, result: AgentChatResult): Record<string, unknown>;
export declare function inspectChannelSetup(project: AgentProjectDefinition, channelId: AgentChannelId): ChannelSetupProjection;
export declare function listChannelSetups(project: AgentProjectDefinition): ChannelSetupProjection[];
