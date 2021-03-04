import { forEach } from "lodash";
import { GetRoomIds, GetRoom } from "./helper";
import { Run as RunStructures } from "../structure/loop";
import { Run as RunCreeps } from "../creep/loop";
import { IsRoomMemoryInitialized } from "../memory/initialization";
import { RoomStatsPreProcessing, RoomStats } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { RoomVisuals } from "./visuals";
import { BuildStructure } from "../structure/helper";
import { SpawnCreeps } from "./spawning";

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

  RoomVisuals(room);

  // BuildStructure(
  //   room,
  //   new RoomPosition(26, 25, room.name),
  //   STRUCTURE_CONTAINER
  // );
  SpawnCreeps(room.name);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunRooms(): FunctionReturn {
  const getRoomIds = GetRoomIds();

  forEach(getRoomIds.response, (key: string) => {
    const isRoomMemoryInitialized = IsRoomMemoryInitialized(key);
    if (isRoomMemoryInitialized.code === FunctionReturnCodes.OK) RunRoom(key);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
