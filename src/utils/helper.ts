import WrapperHandler from "./wrapper";

export default class UtilsHelper {
  /**
   * Checks if this tick the function should be executed.
   */
  public static ExecuteEachTick = WrapperHandler.FuncWrapper(
    function ExecuteEachTick(
      tickAmount: number,
      forceExecute = false
    ): boolean {
      if (forceExecute) return forceExecute;

      const executeThisTick: boolean = Game.time % tickAmount === 0;
      return executeThisTick;
    }
  );

  /**
   * Return live position because its otherwise not an active RoomPosition object.
   */
  public static RehydrateRoomPosition = WrapperHandler.FuncWrapper(
    function RehydrateRoomPosition(objPos: RoomPosition): RoomPosition {
      const pos: RoomPosition = new RoomPosition(
        objPos.x,
        objPos.y,
        objPos.roomName
      );
      return pos;
    }
  );

  /**
   * Return object based on inputted Id if its found in the database of Screeps
   */
  public static GetObject = WrapperHandler.FuncWrapper(function GetObject(
    id: Id<Structure | Creep | ConstructionSite | Source>
  ): Structure | Creep | ConstructionSite | Source | null {
    const obj:
      | Structure
      | Creep
      | ConstructionSite
      | Source
      | null = Game.getObjectById(id);

    return obj;
  });
}
