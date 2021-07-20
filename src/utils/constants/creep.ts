export default class CreepConstants {
  /**
   * A list of intents that's going to be monkey patched to return cpu usage to a heap variable.
   */
  public static TrackedIntents = [
    "attack",
    "attackController",
    "build",
    "cancelOrder",
    "dismantle",
    "drop",
    "getActiveBodyparts",
    "harvest",
    "heal",
    "move",
    "moveByPath",
    "moveTo",
    "pickup",
    "pull",
    "rangedAttack",
    "rangedHeal",
    "rangedMassAttack",
    "repair",
    "reserveController",
    "say",
    "suicide",
    "transfer",
    "upgradeController",
    "withdraw",
    "getActiveBodyparts",
  ];
}
