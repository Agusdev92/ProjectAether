import Phaser from "phaser";
import "@styles/global.css";
import { createGameConfig } from "@game/config";

/**
 * Browser entry point for Project Aether.
 *
 * Keeping Phaser.Game creation isolated makes it easier to add future boot-time
 * services, telemetry, platform adapters, or test harnesses without spreading
 * startup concerns throughout the scene layer.
 */
const game = new Phaser.Game(createGameConfig());

/**
 * Expose the game instance only for local diagnostics. Production systems
 * should communicate through typed services instead of global state.
 */
if (import.meta.env.DEV) {
  globalThis.__PROJECT_AETHER_GAME__ = game;
}
