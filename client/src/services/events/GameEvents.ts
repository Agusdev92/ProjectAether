import type { GameEventHandler, GameEventMap, GameEventName } from "@shared/events/GameEventMap";

type HandlerRegistry = {
  [EventName in GameEventName]?: Set<(payload: unknown) => void>;
};

/**
 * GameEvents is a lightweight typed event bus for cross-layer communication.
 * It intentionally avoids Phaser.Events so domain services can remain testable
 * without booting a Phaser runtime.
 */
export class GameEvents {
  private readonly handlers: HandlerRegistry = {};

  public on<EventName extends GameEventName>(
    eventName: EventName,
    handler: GameEventHandler<EventName>
  ): () => void {
    const handlers = this.getHandlers(eventName);

    handlers.add(handler as (payload: unknown) => void);

    return () => {
      handlers.delete(handler as (payload: unknown) => void);
    };
  }

  public once<EventName extends GameEventName>(
    eventName: EventName,
    handler: GameEventHandler<EventName>
  ): () => void {
    const unsubscribe = this.on(eventName, (payload) => {
      unsubscribe();
      handler(payload);
    });

    return unsubscribe;
  }

  public emit<EventName extends GameEventName>(
    eventName: EventName,
    ...payload: GameEventMap[EventName] extends undefined ? [] : [GameEventMap[EventName]]
  ): void {
    const handlers = this.handlers[eventName];

    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(payload[0]);
    }
  }

  public clear(): void {
    for (const handlers of Object.values(this.handlers)) {
      handlers?.clear();
    }
  }

  private getHandlers<EventName extends GameEventName>(
    eventName: EventName
  ): Set<(payload: unknown) => void> {
    const existingHandlers = this.handlers[eventName];

    if (existingHandlers) {
      return existingHandlers;
    }

    const handlers = new Set<(payload: unknown) => void>();
    this.handlers[eventName] = handlers;

    return handlers;
  }
}

export const gameEvents = new GameEvents();
