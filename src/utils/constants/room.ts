export const VisualDisplayLevels = {
  None: 0,
  Info: 250,
  Debug: 500,
  All: 750,
};

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

export const MaxCreepsPerCreepType = 7;

// Timers
export const RoomSourcePlannerDelay = 25;
export const RoomControllerPlannerDelay = 500;
export const RoomBasePlannerDelay = 5000;
