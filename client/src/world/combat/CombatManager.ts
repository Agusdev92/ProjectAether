import { GameConstants } from "@shared/config/GameConstants";
import type { CombatExchangeResult, CombatQuery } from "@world/combat/CombatTypes";
import type { CreatureRegistry } from "@world/creature/CreatureRegistry";

/**
 * CombatManager tracks the one piece of state InteractableRegistry's binary
 * exhausted/not-exhausted model can't express: incremental health, on both
 * sides of a fight. Attack pacing and "fled, recovering" cooldowns reuse
 * InteractableRegistry's existing exhaust()/isExhausted() untouched — this
 * class only ever answers "what happened to the health totals", never
 * touches focus, exhaustion, inventory, or the player entity directly.
 * Fully deterministic, like every other system in this project: no rolls,
 * only fixed numbers from data.
 */
export class CombatManager implements CombatQuery {
  private readonly creatureHealthByCreatureId = new Map<string, number>();
  private playerHealth: number = GameConstants.combat.playerMaxHealth;

  public constructor(private readonly creatures: CreatureRegistry) {}

  /**
   * 0..1, scaled against the player's *current* effective max (base + worn
   * armor bonus) — never a raw number, so presentation only ever reads a
   * ratio to drive continuous diegetic feedback (screen vignette).
   */
  public getPlayerHealthRatio(armorHealthBonus: number): number {
    const maxHealth = GameConstants.combat.playerMaxHealth + armorHealthBonus;

    return Math.max(0, Math.min(1, this.playerHealth / maxHealth));
  }

  /**
   * Resolves one exchange: the player's hit lands first. A killing blow never
   * draws a retaliation. Otherwise the creature hits back for its own damage;
   * reaching zero resets the player to full so they can fight again
   * immediately — WorldSession applies the actual defeat consequence
   * (reposition, resource loss) once it sees playerDefeated.
   */
  public resolveAttack(
    creatureId: string,
    weaponDamage: number,
    armorHealthBonus: number
  ): CombatExchangeResult {
    const creature = this.creatures.all.find((candidate) => candidate.id === creatureId);

    if (!creature) {
      return { creatureDefeated: false, playerDefeated: false };
    }

    const currentCreatureHealth =
      this.creatureHealthByCreatureId.get(creatureId) ?? creature.health;
    const remainingCreatureHealth = Math.max(0, currentCreatureHealth - weaponDamage);
    const creatureDefeated = remainingCreatureHealth <= 0;

    // Reset to full on defeat: it flees now and recovers before it's
    // fightable again (InteractableRegistry's exhaustion handles the
    // cooldown), so it must be at full health the next time it's engaged.
    this.creatureHealthByCreatureId.set(
      creatureId,
      creatureDefeated ? creature.health : remainingCreatureHealth
    );

    if (creatureDefeated) {
      return { creatureDefeated: true, playerDefeated: false };
    }

    const maxHealth = GameConstants.combat.playerMaxHealth + armorHealthBonus;

    this.playerHealth = Math.max(0, Math.min(maxHealth, this.playerHealth) - creature.damage);

    const playerDefeated = this.playerHealth <= 0;

    if (playerDefeated) {
      this.playerHealth = maxHealth;
    }

    return { creatureDefeated: false, playerDefeated };
  }
}
