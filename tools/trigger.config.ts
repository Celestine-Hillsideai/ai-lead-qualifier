import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Replace with your project ref from the trigger.dev dashboard
  // (Project settings -> Project ref), e.g. "proj_abcdefghijklmnop".
  project: "proj_jttutwasmhutguvubkcy",
  dirs: ["./src/trigger"],
  runtime: "node",
  maxDuration: 60,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
});
