/** What happened when the player's attack and a creature's retaliation resolved. */
export type CombatExchangeResult = Readonly<{
  creatureDefeated: boolean;
  playerDefeated: boolean;
}>;

/**
 * Read-only combat interface carried by the interaction context, mirroring
 * EquipmentQuery's role: the Attack handler resolves an exchange without ever
 * knowing CombatManager or the creature registry directly.
 */
export type CombatQuery = Readonly<{
  resolveAttack(
    creatureId: string,
    weaponDamage: number,
    armorHealthBonus: number
  ): CombatExchangeResult;
}>;
