import type { ActionApprovalPolicyDefinition, ActionArtifactPolicyDefinition, ActionCatalogEntry, ActionMcpExportDefinition, ActionSchedulePolicyDefinition, AgentProjectDefinition } from "../index";
import type { CompiledPromptArtifacts } from "./prompts";
export declare function createInspect(project: AgentProjectDefinition, cwd: string, artifactDir?: string): {
    schemaVersion: number;
    schema: "openpond.agent.inspect.v1";
    artifactSchemas: {
        readonly action: "openpond.agent.action.v1";
        readonly actionRegistry: "openpond.agent.action-registry.v1";
        readonly agent: "openpond.agent.local-agent.v1";
        readonly artifactIndex: "openpond.agent.artifact-index.v1";
        readonly agentManifest: "openpond.agent.manifest.v1";
        readonly channel: "openpond.agent.channel.v1";
        readonly editablePolicy: "openpond.agent.editable-policy.v1";
        readonly envSecret: "openpond.agent.env-secret.v1";
        readonly eval: "openpond.agent.eval.v1";
        readonly evalResults: "openpond.agent.eval-results.v1";
        readonly inspect: "openpond.agent.inspect.v1";
        readonly instructions: "openpond.agent.instructions.v1";
        readonly integration: "openpond.agent.integration.v1";
        readonly intentRouter: "openpond.agent.intent-router.v1";
        readonly mcpClientConnection: "openpond.agent.mcp-client-connection.v1";
        readonly remoteAgent: "openpond.agent.remote-agent.v1";
        readonly runtimeManifest: "openpond.runtime.manifest.v1";
        readonly runtimeBridge: "openpond.agent.runtime-bridge.v1";
        readonly runtimeBundle: "openpond.agent.runtime-bundle.v1";
        readonly schedule: "openpond.agent.schedule.v1";
        readonly skill: "openpond.agent.skill.v1";
        readonly tool: "openpond.agent.tool.v1";
        readonly trace: "openpond.agent.trace.v1";
        readonly validatorReport: "openpond.agent.validation.v1";
        readonly volume: "openpond.agent.volume.v1";
        readonly workflow: "openpond.agent.workflow.v1";
    };
    command: string;
    packageCommand: string;
    sourceOfTruth: string;
    project: {
        name: string;
        version: string;
        useCase: string;
        description: string | null;
    };
    agent: {
        id: string;
        defaultAction: string | null;
        manifestHash: string;
    };
    actionCatalog: ActionCatalogEntry[];
    mcpExports: ActionCatalogEntry[];
    providerSupport: {
        id: import("../index").AgentChannelId;
        setupStatus: string;
        setupRequirements: {
            kind: string;
            name: string;
            required: boolean;
            satisfied: boolean;
        }[];
        capabilities: string[];
        enabledByDefault: boolean;
        responseRendering: {
            kind: string;
            input: string;
            output: string;
            supportedFields: string[];
        };
    }[];
    modelPolicy: import("../index").AgentModelPolicyDefinition | {
        provider: "openpond-managed";
        required: boolean;
    };
    implementationRefs: {
        agents: {
            id: string;
            label: string | null;
            description: string | null;
        }[];
        remoteAgents: {
            id: string;
            description: string;
            projectId: string | null;
            agentId: string | null;
            url: string | null;
            trace: {
                namespace?: string;
                linkParent?: boolean;
            } | null;
        }[];
        workflows: {
            id: string;
            description: string | null;
        }[];
        tools: {
            id: string;
            description: string;
            visibility: "end_user" | "internal" | "debug";
        }[];
        connections: {
            id: string;
            description: string | null;
            traceNamespace: string;
        }[];
    };
    sourceLayout: {
        root: string;
        agentConfig: string;
        manifestMode: "typescript" | "openpond-yaml" | "extends-openpond-yaml";
        extendsManifest: string | null;
        openpondYaml: string | null;
        actions: string | null;
        legacyActions: string | null;
        agents: string | null;
        remoteAgents: string | null;
        connections: string | null;
        editable: string | null;
        workflows: string | null;
        channels: string | null;
        tools: string | null;
        evals: string | null;
        volumes: string | null;
        integrations: string | null;
        schedules: string | null;
    };
    generatedArtifacts: {
        inspectJson: string;
        agentManifestJson: string;
        actionRegistryJson: string;
        runtimeManifestPreviewYaml: string;
        validatorReport: string;
        evalResultsJson: string;
        traces: string;
    };
    runtimeManifest: string;
    editable: {
        kind: "editable";
        enabled: boolean;
        sourceOfTruth: "agent-source";
        policyDiscovery: {
            command: string;
            runAfter: "source-materialized";
        };
        allowedPaths: string[];
        requiredChecks: string[];
        defaultResultMode: import("../index").EditableResultMode;
        supportedResultModes?: import("../index").EditableResultMode[];
        schema: "openpond.agent.editable-policy.v1";
    } | null;
    capabilities: {
        actions: string[];
        agents: string[];
        remoteAgents: string[];
        connections: string[];
        channels: import("../index").AgentChannelId[];
        tools: string[];
        workflows: string[];
        schedules: string[];
        evals: string[];
        volumes: string[];
        env: string[];
        integrations: string[];
    };
    setup: {
        channels: {
            id: import("../index").AgentChannelId;
            targetAction: string;
            requiredConnections: string[];
            capabilities: string[];
            enabledByDefault: boolean;
            setupRequirements: {
                kind: string;
                name: string;
                required: boolean;
                satisfied: boolean;
            }[];
            setupStatus: string;
        }[];
        integrations: {
            schema: "openpond.agent.integration.v1";
            provider: string;
            required: boolean;
            capabilities: string[];
            scopes: string[];
        }[];
        connections: {
            schema: "openpond.agent.mcp-client-connection.v1";
            id: string;
            required: boolean;
            auth: {
                policy: "none" | "openpond-oauth" | "connection" | "env-token";
                connectionId?: string;
                env?: string;
            };
            toolFilters: {
                allow?: string[];
                block?: string[];
            };
            setupStatus: string;
        }[];
        envRefs: {
            schema: "openpond.agent.env-secret.v1";
            kind: "env";
            name: string;
            required: boolean;
            secret: boolean;
            description: string | null;
        }[];
        volumes: {
            schema: "openpond.agent.volume.v1";
            name: string;
            mountPath: string;
            provisioning: import("../index").VolumeProvisioningPolicy;
            required: boolean;
        }[];
        schedules: {
            schema: "openpond.agent.schedule.v1";
            name: string;
            targetAction: string;
            enabledByDefault: boolean;
            setupStatus: string;
        }[];
    };
    inputSchema: import("../index").JsonSchema | null;
    inputSchemas: Record<string, import("../index").JsonSchema>;
    validation: {
        declaredCommands: string[];
        requiredChecks: string[];
    };
};
export declare function createAgentManifest(project: AgentProjectDefinition, promptArtifacts?: CompiledPromptArtifacts): {
    schemaVersion: number;
    schema: "openpond.agent.manifest.v1";
    artifactSchemas: {
        readonly action: "openpond.agent.action.v1";
        readonly actionRegistry: "openpond.agent.action-registry.v1";
        readonly agent: "openpond.agent.local-agent.v1";
        readonly artifactIndex: "openpond.agent.artifact-index.v1";
        readonly agentManifest: "openpond.agent.manifest.v1";
        readonly channel: "openpond.agent.channel.v1";
        readonly editablePolicy: "openpond.agent.editable-policy.v1";
        readonly envSecret: "openpond.agent.env-secret.v1";
        readonly eval: "openpond.agent.eval.v1";
        readonly evalResults: "openpond.agent.eval-results.v1";
        readonly inspect: "openpond.agent.inspect.v1";
        readonly instructions: "openpond.agent.instructions.v1";
        readonly integration: "openpond.agent.integration.v1";
        readonly intentRouter: "openpond.agent.intent-router.v1";
        readonly mcpClientConnection: "openpond.agent.mcp-client-connection.v1";
        readonly remoteAgent: "openpond.agent.remote-agent.v1";
        readonly runtimeManifest: "openpond.runtime.manifest.v1";
        readonly runtimeBridge: "openpond.agent.runtime-bridge.v1";
        readonly runtimeBundle: "openpond.agent.runtime-bundle.v1";
        readonly schedule: "openpond.agent.schedule.v1";
        readonly skill: "openpond.agent.skill.v1";
        readonly tool: "openpond.agent.tool.v1";
        readonly trace: "openpond.agent.trace.v1";
        readonly validatorReport: "openpond.agent.validation.v1";
        readonly volume: "openpond.agent.volume.v1";
        readonly workflow: "openpond.agent.workflow.v1";
    };
    sourceOfTruth: "typescript" | "openpond-yaml" | "extends-openpond-yaml";
    project: {
        name: string;
        version: string;
        useCase: string;
        description: string | null;
    };
    defaultEntrypoint: {
        scope: string;
        name: string | null;
    };
    runtime: Record<string, unknown>;
    resources: Record<string, unknown>;
    modelPolicy: import("../index").AgentModelPolicyDefinition | {
        provider: "openpond-managed";
        required: boolean;
    };
    instructions: import("./prompts").CompiledInstructions | {
        schema: "openpond.agent.instructions.v1";
        source: string;
        format: string;
    } | null;
    skills: import("./prompts").CompiledSkill[] | {
        schema: "openpond.agent.skill.v1";
        name: string;
        description: string | null;
        source: string;
        format: "markdown";
    }[];
    editable: {
        kind: "editable";
        enabled: boolean;
        sourceOfTruth: "agent-source";
        policyDiscovery: {
            command: string;
            runAfter: "source-materialized";
        };
        allowedPaths: string[];
        requiredChecks: string[];
        defaultResultMode: import("../index").EditableResultMode;
        supportedResultModes?: import("../index").EditableResultMode[];
        schema: "openpond.agent.editable-policy.v1";
    } | null;
    setup: {
        commands: string[];
    } | null;
    validation: {
        commands: string[];
    } | null;
    inputSchema: import("../index").JsonSchema | null;
    inputSchemas: Record<string, import("../index").JsonSchema>;
    actionCatalog: ActionCatalogEntry[];
    actions: {
        schema: "openpond.agent.action.v1";
        id: string;
        name: string;
        label: string;
        description: string | null;
        visibility: "default" | "end_user" | "internal" | "debug";
        target: {
            kind: string;
            allowedActions: string[];
            hasRuntime: boolean;
            workflow?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            workflow: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            agentId: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            remoteAgentId: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            agentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            tool: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            router: string;
            intents: string[];
            defaultIntent: string | null;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
        };
        implementation: import("../index").ActionImplementationDefinition;
        timeoutSeconds: number | null;
        inputSchema: string | null;
        outputSchema: string | null;
        approvalPolicy: ActionApprovalPolicyDefinition;
        artifactPolicy: ActionArtifactPolicyDefinition;
        setupRequirements: import("../index").ActionSetupRequirementDefinition[];
        mcp: ActionMcpExportDefinition;
        schedulePolicy: ActionSchedulePolicyDefinition;
        trace: import("../index").ActionTracePolicyDefinition;
        invokesModel: boolean;
        outputArtifacts: string[];
    }[];
    chat: {
        schema: "openpond.agent.intent-router.v1";
        kind: string;
        allowedActions: string[];
        router?: undefined;
        inputSchema?: undefined;
        intents?: undefined;
        defaultIntent?: undefined;
        routing?: undefined;
    } | {
        schema: "openpond.agent.intent-router.v1";
        kind: string;
        router: string;
        allowedActions?: undefined;
        inputSchema?: undefined;
        intents?: undefined;
        defaultIntent?: undefined;
        routing?: undefined;
    } | {
        schema: "openpond.agent.intent-router.v1";
        kind: string;
        inputSchema: string | null;
        intents: string[];
        defaultIntent: string;
        routing: {
            strategy: "model" | "code" | "model-or-code";
            model?: string;
            traceSelection?: boolean;
        } | null;
        allowedActions?: undefined;
        router?: undefined;
    } | null;
    agents: {
        schema: "openpond.agent.local-agent.v1";
        id: string;
        label: string | null;
        description: string | null;
        tools: string[];
        workflows: string[];
        modelPolicy: import("../index").AgentModelPolicyDefinition | null;
    }[];
    remoteAgents: {
        schema: "openpond.agent.remote-agent.v1";
        id: string;
        description: string;
        projectId: string | null;
        agentId: string | null;
        url: string | null;
        auth: {
            policy: "openpond-service" | "connection" | "bearer-token" | "none";
            connectionId?: string;
            env?: string;
        };
        inputSchema: string | null;
        outputSchema: string | null;
        trace: {
            namespace?: string;
            linkParent?: boolean;
        } | null;
    }[];
    connections: {
        schema: "openpond.agent.mcp-client-connection.v1";
        id: string;
        description: string | null;
        serverUrl: string | null;
        auth: {
            policy: "none" | "openpond-oauth" | "connection" | "env-token";
            connectionId?: string;
            env?: string;
        };
        tools: {
            allow?: string[];
            block?: string[];
        };
        approvalPolicy: ActionApprovalPolicyDefinition;
        traceNamespace: string;
    }[];
    workflows: {
        schema: "openpond.agent.workflow.v1";
        name: string;
        description: string | null;
    }[];
    channels: {
        schema: "openpond.agent.channel.v1";
        id: import("../index").AgentChannelId;
        target: {
            action: string;
        };
        targetAction: string;
        requiredConnections: string[];
        capabilities: string[];
        enabledByDefault: boolean;
        adapter: {
            normalizeEvent: {
                kind: string;
                output: string;
                requiredFields: string[];
            };
            renderResponse: {
                kind: string;
                input: string;
                output: string;
                supportedFields: string[];
            };
        };
        setupRequirements: {
            kind: string;
            name: string;
            required: boolean;
            satisfied: boolean;
        }[];
        setupStatus: string;
    }[];
    tools: {
        schema: "openpond.agent.tool.v1";
        name: string;
        description: string;
        visibility: "end_user" | "internal" | "debug";
        target: import("../index").ToolTargetDefinition;
        inputSchema: string | null;
        outputArtifacts: string[];
    }[];
    volumes: {
        name: string;
        mountPath: string;
        description?: string;
        storageGb?: number;
        deleteOnSandboxDelete?: boolean;
        provisioning: import("../index").VolumeProvisioningPolicy;
        state?: import("../index").VolumeStatePolicy;
        usedBy?: string[];
        schema: "openpond.agent.volume.v1";
    }[];
    envRefs: {
        schema: "openpond.agent.env-secret.v1";
        kind: "env";
        name: string;
        required: boolean;
        secret: boolean;
        description: string | null;
    }[];
    integrations: {
        provider: string;
        required?: boolean;
        capabilities?: string[];
        scopes?: string[];
        models?: string[];
        schema: "openpond.agent.integration.v1";
    }[];
    schedules: {
        kind: "schedule";
        name: string;
        scheduleType: "cron" | "rate";
        target: {
            action: string;
        };
        enabledByDefault?: boolean;
        input?: Partial<import("../index").AgentChatInput>;
        cron?: string;
        rate?: string;
        timezone?: string;
        schema: "openpond.agent.schedule.v1";
    }[];
    evals: {
        schema: "openpond.agent.eval.v1";
        name: string;
        description: string;
        expectedArtifacts: string[];
    }[];
};
export declare function createRuntimeManifest(project: AgentProjectDefinition): {
    setup: {
        commands: string[];
    };
    validation: {
        commands: string[];
    };
    start: {
        command: string;
        timeoutSeconds: number;
        artifactPaths: string[];
        ports: never[];
    };
    actions: {
        id: string;
        name: string;
        label: string;
        command: string;
        timeoutSeconds: number;
        artifactPaths: string[];
        ports: never[];
    }[];
    services: never[];
    schedules: ({
        metadata?: {
            input: Partial<import("../index").AgentChatInput>;
        } | undefined;
        enabled: boolean;
        action: string;
        timezone?: string | undefined;
        cron: {};
        name: string;
    } | {
        metadata?: {
            input: Partial<import("../index").AgentChatInput>;
        } | undefined;
        enabled: boolean;
        action: string;
        timezone?: string | undefined;
        rate: {};
        name: string;
    })[];
    volumes: {
        deleteOnSandboxDelete?: boolean | undefined;
        storageGb?: number | undefined;
        name: string;
        mountPath: string;
    }[];
    integrations: {
        requiredLeases: {
            provider: string;
            scopes: string[];
            capabilities: string[];
        }[];
    };
    permissions: {
        opchat?: {
            models: string[];
            scopes: string[];
        } | undefined;
    };
    inputs: {
        schema: import("../index").JsonSchema;
        env: {
            name: string;
            required: boolean;
            secret: boolean;
            description: string | null;
        }[];
    };
    artifacts: {
        paths: string[];
    };
    network: {
        egress: string;
    };
    resources?: Record<string, unknown> | undefined;
    schemaVersion: number;
    schema: "openpond.runtime.manifest.v1";
    name: string;
    version: string;
    useCase: string;
    description: string;
    runtime: Record<string, unknown>;
};
export declare function createActionRegistry(project: AgentProjectDefinition): {
    schemaVersion: number;
    schema: "openpond.agent.action-registry.v1";
    generatedBy: string;
    actions: {
        id: string;
        name: string;
        label: string;
        description: string;
        command: string;
        target: import("../index").ActionImplementationDefinition | {
            kind: string;
            allowedActions: string[];
            hasRuntime: boolean;
            workflow?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            workflow: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            agentId: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            remoteAgentId: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            agentId?: undefined;
            tool?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            tool: string;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            router?: undefined;
            intents?: undefined;
            defaultIntent?: undefined;
        } | {
            kind: string;
            router: string;
            intents: string[];
            defaultIntent: string | null;
            allowedActions?: undefined;
            hasRuntime?: undefined;
            workflow?: undefined;
            agentId?: undefined;
            remoteAgentId?: undefined;
            tool?: undefined;
        };
        implementation: import("../index").ActionImplementationDefinition;
        visibility: "default" | "end_user" | "internal" | "debug";
        timeoutSeconds: number;
        inputSchema: string | null;
        outputSchema: string | null;
        outputArtifacts: string[];
        approvalPolicy: ActionApprovalPolicyDefinition;
        setupRequirements: import("../index").ActionSetupRequirementDefinition[];
        mcp: ActionMcpExportDefinition;
        trace: import("../index").ActionTracePolicyDefinition;
    }[];
};
export declare function createRuntimeBridge(actionRegistry: ReturnType<typeof createActionRegistry>): string;
export declare function inspectActions(project: AgentProjectDefinition): ActionCatalogEntry[];
