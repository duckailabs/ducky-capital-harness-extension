import type { IntegrationDefinition } from "../index";
export type ConnectedIntegrationProvider = "google" | "github" | "x";
export type ConnectedIntegrationCatalogEntry = {
    provider: ConnectedIntegrationProvider;
    label: string;
    description: string;
    capabilityIds: string[];
    defaultLeaseCapabilityIds: string[];
    defaultTtlSeconds: number | null;
};
export type ConnectedIntegrationDefinition<TProvider extends ConnectedIntegrationProvider = ConnectedIntegrationProvider> = Omit<IntegrationDefinition, "provider"> & {
    provider: TProvider;
    setupSurface?: "oauth_connector";
};
export declare const CONNECTED_INTEGRATION_PROVIDERS: ConnectedIntegrationProvider[];
export declare function connectedIntegrationCatalog(): ConnectedIntegrationCatalogEntry[];
export declare function connectedIntegrationCapabilityIds(provider: ConnectedIntegrationProvider | string): string[];
export declare function connectedIntegrationDefaultCapabilityIds(provider: ConnectedIntegrationProvider | string): string[];
export declare function isConnectedIntegrationProvider(provider: string | null | undefined): provider is ConnectedIntegrationProvider;
export declare function normalizeConnectedIntegrationProvider(provider: string | null | undefined): ConnectedIntegrationProvider | null;
export declare function defineConnectedIntegration<TProvider extends ConnectedIntegrationProvider>(provider: TProvider, definition?: Omit<ConnectedIntegrationDefinition<TProvider>, "provider">): ConnectedIntegrationDefinition<TProvider>;
