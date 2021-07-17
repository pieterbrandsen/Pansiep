/**
 * List of possible visual display levels.
 */
export const VisualDisplayLevels = {
  None: 0,
  Info: 250,
  Debug: 500,
  All: 750,
};

/**
 * A list of intents that's going to be monkey patched to return cpu usage to a heap variable.
 */
export const TrackedIntents = [
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
export const JobActionPriority: { [key in JobActionTypes]: number } = {
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
export const MaxCreepsPerCreepType = 7;

// Timers
export const RoomSourcePlannerDelay = 25;
export const RoomControllerPlannerDelay = 500;
export const RoomBasePlannerDelay = 5000;
