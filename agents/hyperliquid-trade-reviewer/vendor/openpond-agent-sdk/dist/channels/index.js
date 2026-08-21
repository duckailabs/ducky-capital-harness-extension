import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/core/channels.ts
function normalizeChannelEvent(project, channelId, event) {
  const channel = findChannel(project, channelId);
  const input = channel.normalizeEvent(event);
  assertChannelInput(channelId, input);
  return input;
}
function renderChannelResponse(project, channelId, result) {
  return findChannel(project, channelId).renderResponse(result);
}
function inspectChannelSetup(project, channelId) {
  return projectChannelSetup(project, findChannel(project, channelId));
}
function listChannelSetups(project) {
  return (project.channels ?? []).map((channel) => projectChannelSetup(project, channel));
}
function findChannel(project, channelId) {
  const channel = (project.channels ?? []).find((candidate) => candidate.id === channelId);
  if (!channel) throw new Error(`Unknown channel: ${channelId}`);
  return channel;
}
function projectChannelSetup(project, channel) {
  const requiredConnections = channel.requiredConnections ?? [];
  const setupRequirements = requiredConnections.map((connection) => ({
    kind: "integration",
    name: connection,
    required: true,
    satisfied: (project.integrations ?? []).some((integration) => integration.provider === connection)
  }));
  return {
    id: channel.id,
    targetAction: channel.target.action,
    enabledByDefault: channel.enabledByDefault ?? false,
    requiredConnections,
    capabilities: channel.capabilities ?? [],
    setupRequirements,
    setupStatus: setupRequirements.every((requirement) => requirement.satisfied) ? "ready" : "missing_setup"
  };
}
function assertChannelInput(channelId, input) {
  if (!input || typeof input !== "object") {
    throw new Error(`Channel ${channelId} normalizeEvent must return an AgentChatInput object.`);
  }
  if (typeof input.prompt !== "string") {
    throw new Error(`Channel ${channelId} normalizeEvent must return a string prompt.`);
  }
  if (input.channel !== channelId) {
    throw new Error(`Channel ${channelId} normalizeEvent returned channel ${input.channel}.`);
  }
}

// src/index.ts
function defineChannel(definition) {
  return { kind: "channel", ...definition };
}
export {
  defineChannel,
  inspectChannelSetup,
  listChannelSetups,
  normalizeChannelEvent,
  renderChannelResponse
};
