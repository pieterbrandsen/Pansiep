import { forEach } from "lodash";
import { GetRoomIds, GetRoom } from "./helper";
import { Run as RunStructures } from "../structure/loop";
import { Run as RunCreeps } from "../creep/loop";
import { IsRoomMemoryInitialized } from "../memory/initialization";
import { RoomStatsPreProcessing, RoomStats } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { TryToExecuteRoomPlanner } from "./planner";
import { RoomVisuals } from "./overviewVisual";

/**
 * Execute an single room
 *
 * @param {Room} room - room to be executed
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const RunRoom = FuncWrapper(function RunRoom(
  name: string
): FunctionReturn {
  const getRoom = GetRoom(name);

  if (getRoom.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const room = getRoom.response;

  const roomStatsPreProcessing = RoomStatsPreProcessing(room);
  RunStructures(name);
  RunCreeps(name);
  if (roomStatsPreProcessing.code === FunctionReturnCodes.OK) RoomStats(room);

  TryToExecuteRoomPlanner(room);
  RoomVisuals(room);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute all visible rooms
 *
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const Run = FuncWrapper(function RunRooms(): FunctionReturn {
  const getRoomIds = GetRoomIds();

  forEach(getRoomIds.response, (key: string) => {
    const isRoomMemoryInitialized = IsRoomMemoryInitialized(key);
    if (isRoomMemoryInitialized.code === FunctionReturnCodes.OK) RunRoom(key);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
