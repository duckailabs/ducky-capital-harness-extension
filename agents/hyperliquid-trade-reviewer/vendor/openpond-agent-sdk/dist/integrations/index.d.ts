import { defineEnvSecret, defineIntegration, env, secret, type EnvSecretDefinition, type IntegrationDefinition } from "../index";
import { CONNECTED_INTEGRATION_PROVIDERS, connectedIntegrationCapabilityIds, connectedIntegrationCatalog, connectedIntegrationDefaultCapabilityIds, defineConnectedIntegration, isConnectedIntegrationProvider, normalizeConnectedIntegrationProvider, type ConnectedIntegrationDefinition, type ConnectedIntegrationProvider } from "../core/connected-integrations";
export declare const integration: {
    google(definition?: Omit<ConnectedIntegrationDefinition<"google">, "provider">): ConnectedIntegrationDefinition<"google">;
    github(definition?: Omit<ConnectedIntegrationDefinition<"github">, "provider">): ConnectedIntegrationDefinition<"github">;
    x(definition?: Omit<ConnectedIntegrationDefinition<"x">, "provider">): ConnectedIntegrationDefinition<"x">;
    openpondChat(definition?: Omit<IntegrationDefinition, "provider">): {
        provider: string;
    };
    microsoftTeams(definition?: Omit<IntegrationDefinition, "provider">): {
        provider: string;
    };
    slack(definition?: Omit<IntegrationDefinition, "provider">): {
        provider: string;
    };
    opchat(definition: Omit<IntegrationDefinition, "provider">): {
        provider: string;
    };
};
export declare const connectedIntegration: {
    providers: ConnectedIntegrationProvider[];
    catalog: typeof connectedIntegrationCatalog;
    capabilityIds: typeof connectedIntegrationCapabilityIds;
    defaultCapabilityIds: typeof connectedIntegrationDefaultCapabilityIds;
    isProvider: typeof isConnectedIntegrationProvider;
    normalizeProvider: typeof normalizeConnectedIntegrationProvider;
    define: typeof defineConnectedIntegration;
    google: (definition?: Omit<ConnectedIntegrationDefinition<"google">, "provider">) => ConnectedIntegrationDefinition<"google">;
    github: (definition?: Omit<ConnectedIntegrationDefinition<"github">, "provider">) => ConnectedIntegrationDefinition<"github">;
    x: (definition?: Omit<ConnectedIntegrationDefinition<"x">, "provider">) => ConnectedIntegrationDefinition<"x">;
};
export { CONNECTED_INTEGRATION_PROVIDERS, connectedIntegrationCapabilityIds, connectedIntegrationCatalog, connectedIntegrationDefaultCapabilityIds, defineConnectedIntegration, defineEnvSecret, defineIntegration, env, isConnectedIntegrationProvider, normalizeConnectedIntegrationProvider, secret, };
export type { ConnectedIntegrationDefinition, ConnectedIntegrationProvider, EnvSecretDefinition, IntegrationDefinition, };
