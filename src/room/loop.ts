import { forEach } from "lodash";
import RoomVisualHandler from "./visuals/handler";
import StatsHandler from "../memory/stats";
import MemoryInitializationHandler from "../memory/initialization";
import RoomHelper from "./helper";
import CreepManager from "../creep/loop";
import RoomPlannerHandler from "./planner/planner";
import StructureManager from "../structure/loop";
import WrapperHandler from "../utils/wrapper";

export default class RoomManager {
  /**
   * Execute an single room
   *
   * @param {Room} room - room to be executed
   * @return {FunctionReturn} HTTP response with code and data
   *
   */
  private static RunRoom = WrapperHandler.FuncWrapper(function RunRoom(
    name: string
  ): void {
    const room = RoomHelper.GetRoom(name);

    const roomStatsPreProcessing = StatsHandler.RoomStatsPreProcessing(room);
    StructureManager.Run(name);
    CreepManager.Run(name);
    if (roomStatsPreProcessing) StatsHandler.RoomStats(room);

    RoomPlannerHandler.TryToExecuteRoomPlanner(room);
    RoomVisualHandler.DrawRoomVisuals(room);
  });

  /**
   * Execute all visible rooms
   *
   * @return {FunctionReturn} HTTP response with code and data
   *
   */
  public static Run = WrapperHandler.FuncWrapper(function RunRooms(): void {
    const roomIds = RoomHelper.GetRoomIds();

    forEach(roomIds, (key: string) => {
      if (MemoryInitializationHandler.IsRoomMemoryInitialized(key))
        RoomManager.RunRoom(key);
    });
  });
}
