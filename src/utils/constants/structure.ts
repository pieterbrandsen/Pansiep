export default class StructureConstants {
  /**
   * List of structures that are saved in the memory to be accessible without searching for it.
   */
  public static CachedStructureTypes: StructureConstant[] = [
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
  public static DangerousStructureTypes: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
  ];

  /**
   * List of walkable structures.
   */
  public static WalkableStructureTypes: StructureConstant[] = [
    STRUCTURE_CONTAINER,
    STRUCTURE_RAMPART,
  ];

  /**
   * A list of intents that's going to be monkey patched to return cpu usage to a heap variable.
   */
  public static TrackedIntents = ["destroy"];

  /**
   * Amount of range the controller energy structure is going to be placed from the controller.
   */
  public static ControllerEnergyStructureRange = 2;
}
