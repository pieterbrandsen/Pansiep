export default class RoomConstants {
  /**
   * List of possible visual display levels.
   */
  public static VisualDisplayLevels = {
    None: 0,
    Info: 250,
    Debug: 500,
  };

  /**
   * A list of intents that's going to be monkey patched to return cpu usage to a heap variable.
   */
  public static TrackedIntents = [
    "createConstructionSite",
    "createFlag",
    "find",
    "findExitTo",
    "findPath",
    "getPositionAt",
    "getTerrain",
    "lookAt",
    "lookAtArea",
    "lookForAt",
    "lookForAtArea",
  ];

  /**
   * List of possible job action with their associated priority level. Lower equals higher priority..
   */
  public static JobActionPriority: { [key in JobActionTypes]: number } = {
    move: 0,
    transfer: 0,
    transferSource: 0,

    withdraw: 1,
    withdrawController: 1,
    attack: 1,
    heal: 1,
    harvest: 1,
    repair: 1,

    build: 2,

    dismantle: 3,
    upgrade: 3,

    claim: 4,
  };

  /**
   * Max amount of creeps per job type.
   */
  public static MaxCreepsPerCreepType = 7;

  // Timers
  public static RoomSourcePlannerDelay = 25;

  public static RoomControllerPlannerDelay = 500;

  public static RoomBasePlannerDelay = 5000;
}
