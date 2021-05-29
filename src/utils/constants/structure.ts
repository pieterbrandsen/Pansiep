/**
 * List of structures that are saved in the memory to be accessible without searching for it.
 */
export const CachedStructureTypes: StructureConstant[] = [
  STRUCTURE_CONTAINER,
  STRUCTURE_CONTROLLER,
  STRUCTURE_EXTENSION,
  STRUCTURE_FACTORY,
  STRUCTURE_LAB,
  STRUCTURE_LINK,
  STRUCTURE_NUKER,
  STRUCTURE_OBSERVER,
  STRUCTURE_SPAWN,
  STRUCTURE_STORAGE,
  STRUCTURE_TERMINAL,
  STRUCTURE_TOWER,
  STRUCTURE_ROAD,
];

/**
 * List of dangerous structures to be destroyed when attacking an room.
 */
export const DangerousStructureTypes: StructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_TOWER,
];

/**
 * List of walkable structures.
 */
export const WalkableStructureTypes: StructureConstant[] = [
  STRUCTURE_CONTAINER,
  STRUCTURE_RAMPART,
];

/**
 * A list of intents that's going to be monkey patched to return cpu usage to a heap variable.
 */
export const TrackedIntents = ["destroy"];

/**
 * Amount of range the controller energy structure is going to be placed from the controller.
 */
export const ControllerEnergyStructureRange = 2;
