import { forEach } from 'lodash';
import { GetRoomNames, GetRoom } from "./helper";
import { Run as RunStructures } from "../structure/loop";
import { Run as RunCreeps } from "../creep/loop";
import { IsRoomMemoryInitialized } from "../memory/initialization";
import { RoomStatsPreProcessing, RoomStats } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const RunRoom = FuncWrapper(function RunRoom(
  id: string
): FunctionReturn {
  const getRoom = GetRoom(id);

  if (getRoom.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const room = getRoom.response;

  RoomStatsPreProcessing(room);
  RunStructures(id);
  RunCreeps(id);
  RoomStats(room);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunRooms(): FunctionReturn {
  const getRoomNames = GetRoomNames();

  if (getRoomNames.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  forEach(getRoomNames.response, (key: string) => {
    const isRoomMemoryInitialized = IsRoomMemoryInitialized(key);
    if (isRoomMemoryInitialized.code === FunctionReturnCodes.OK) RunRoom(key);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
