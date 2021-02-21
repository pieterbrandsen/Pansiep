import _ from "lodash";
import { Log } from "../utils/logger";
import { ResetRoomStats } from "./stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes, LogTypes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const RemoveCreep = FuncWrapper(function RemoveCreep(
  id: string,
  roomName: string
): FunctionReturn {
  delete Memory.creeps[id];
  Memory.cache.creeps.data[roomName] = _.remove(
    Memory.cache.creeps.data[roomName],
    (c) => c.id
  );

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveCreep",
    "Deleted Creep memory",
    id
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const RemoveStructure = FuncWrapper(function RemoveStructure(
  id: string,
  roomName: string
): FunctionReturn {
  delete Memory.structures[id];
  Memory.cache.structures.data[roomName] = _.remove(
    Memory.cache.structures.data[roomName],
    (s) => s.id
  );

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveStructure",
    "Deleted Structure memory",
    id
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const RemoveRoom = FuncWrapper(function RemoveRoom(
  roomName: string
): FunctionReturn {
  _.forOwn(Memory.structures, (str: StructureMemory, key: string) => {
    if (str.room === roomName) {
      RemoveStructure(key, roomName);
    }
  });
  _.forOwn(Memory.creeps, (crp: CreepMemory, key: string) => {
    if (crp.commandRoom === roomName) {
      RemoveCreep(key, roomName);
    }
  });

  delete Memory.rooms[roomName];
  Memory.cache.rooms.data = _.remove(
    Memory.cache.rooms.data,
    (s) => s === roomName
  );

  ResetRoomStats(roomName);

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveRoom",
    "Deleted Room memory",
    roomName
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
