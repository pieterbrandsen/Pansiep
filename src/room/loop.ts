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
    roomName: string
  ): void {
    const room = RoomHelper.GetRoom(roomName);

    StatsHandler.RoomStatsPreProcessing(roomName);
    StructureManager.Run(roomName);
    CreepManager.Run(roomName);

    RoomPlannerHandler.TryToExecuteRoomPlanner(room);
    RoomVisualHandler.DrawRoomVisuals(room);

    StatsHandler.RoomStats(room);
  });

  /**
   * Execute all visible rooms
   *
   * @return {FunctionReturn} HTTP response with code and data
   *
   */
  public static Run = WrapperHandler.FuncWrapper(function RunRooms(): void {
    const roomIds = RoomHelper.GetRoomIds();

    forEach(roomIds, (roomName: string) => {
      if (MemoryInitializationHandler.IsRoomMemoryInitialized(roomName))
        RoomManager.RunRoom(roomName);
    });
  });
}
