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
   */
  private static RunRoom = WrapperHandler.FuncWrapper(function RunRoom(
    roomName: string
  ): void {
    const room = RoomHelper.GetRoom(roomName);
    if(room === undefined) return;

    StatsHandler.RoomStatsPreProcessing(roomName);
    StructureManager.Run(roomName);
    CreepManager.Run(roomName);

    RoomPlannerHandler.TryToExecuteRoomPlanner(room);
    RoomVisualHandler.DrawRoomVisuals(room);

    StatsHandler.RoomStats(room);
  });

  /**
   * Execute all visible rooms
   */
  public static Run = WrapperHandler.FuncWrapper(function RunRooms(): void {
    const roomIds = RoomHelper.GetRoomIds();

    forEach(roomIds, (roomName: string) => {
      if (MemoryInitializationHandler.IsRoomMemoryInitialized(roomName))
        RoomManager.RunRoom(roomName);
    });
  });
}
