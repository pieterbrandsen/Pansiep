import { forEach, forOwn, isUndefined } from "lodash";
import { Log } from "../utils/logger";
import {
  InitializeCreepMemory,
  InitializeRoomMemory,
  InitializeStructureMemory,
  IsCreepMemoryInitialized,
  IsRoomMemoryInitialized,
  IsStructureMemoryInitialized,
} from "./initialization";
import {
  CacheNextCheckIncrement,
  FunctionReturnCodes,
  LogTypes,
  SaveUnloadedObjectForAmountTicks,
} from "../utils/constants/global";
import { CachedStructureTypes } from "../utils/constants/structure";
import { FuncWrapper } from "../utils/wrapper";
import { RemoveCreep, RemoveRoom, RemoveStructure } from "./garbageCollection";
import { FunctionReturnHelper } from "../utils/statusGenerator";

type RoomObjTypes = StringMap<StructureCache[]> | StringMap<CreepCache[]>;
export const ReturnCompleteCache = FuncWrapper(function ReturnCompleteCache(
  currentCache: RoomObjTypes,
  newCache: RoomObjTypes,
  roomObject: StringMap<StructureMemory> | StringMap<CreepMemory>
): FunctionReturn {
  const returnCache = newCache;
  Object.keys(currentCache).forEach((key) => {
    if (!returnCache[key]) returnCache[key] = [];
    const newCacheArr = returnCache[key];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEach(currentCache[key], (obj: any) => {
      if (
        obj &&
        roomObject[obj.id] &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !newCacheArr.some((c: any) => c.id === obj.id)
      ) {
        newCacheArr.push(obj);
        if (isUndefined(roomObject[obj.id].isNotSeenSince))
          // eslint-disable-next-line no-param-reassign
          roomObject[obj.id].isNotSeenSince = Game.time;
        else if (
          (roomObject[obj.id].isNotSeenSince as number) +
            SaveUnloadedObjectForAmountTicks <
          Game.time
        ) {
          if ((roomObject[obj.id] as StructureMemory).room !== undefined)
            RemoveStructure(obj.id, key);
          else RemoveCreep(obj.id, key);
          newCacheArr.pop();
        }
      } else if (
        roomObject[obj.id] &&
        roomObject[obj.id].isNotSeenSince !== undefined
      )
        // eslint-disable-next-line no-param-reassign
        delete roomObject[obj.id].isNotSeenSince;
    });
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, newCache);
});

export const UpdateRoomsCache = FuncWrapper(
  function UpdateRoomsCache(): FunctionReturn {
    if (Memory.cache.rooms.nextCheckTick > Game.time)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    Memory.cache.rooms.nextCheckTick =
      Game.time + CacheNextCheckIncrement.rooms;

    const savedCache = Memory.cache.rooms.data;
    const cache: string[] = [];
    forEach(Object.keys(Game.rooms), (key: string) => {
      if (IsRoomMemoryInitialized(key).code !== FunctionReturnCodes.OK)
        InitializeRoomMemory(key);
      cache.push(key);
    });

    forEach(Object.keys(savedCache), (key: string) => {
      if (Memory.rooms[key] && !cache.includes(key)) {
        cache.push(key);

        const roomMem: RoomMemory = Memory.rooms[key];
        if (isUndefined(roomMem.isNotSeenSince))
          roomMem.isNotSeenSince = Game.time;
        else if (
          (roomMem.isNotSeenSince as number) +
            SaveUnloadedObjectForAmountTicks * 2 <
          Game.time
        ) {
          RemoveRoom(key);
          cache.pop();
        }
      } else if (
        Memory.rooms[key] &&
        Memory.rooms[key].isNotSeenSince !== undefined
      )
        delete Memory.rooms[key].isNotSeenSince;
    });

    Memory.cache.rooms.data = cache;

    Log(
      LogTypes.Debug,
      "src/memory/updateCache:UpdateRoomsCache",
      "Updated the Rooms cache"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const UpdateStructuresCache = FuncWrapper(
  function UpdateStructuresCache(): FunctionReturn {
    if (Memory.cache.structures.nextCheckTick > Game.time)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    Memory.cache.structures.nextCheckTick =
      Game.time + CacheNextCheckIncrement.structures;

    const cache: StringMap<StructureCache[]> = {};
    forOwn(Game.structures, (str: Structure, key: string) => {
      let strMem = Memory.structures[key];
      if (CachedStructureTypes.includes(str.structureType)) {
        if (IsStructureMemoryInitialized(key).code !== FunctionReturnCodes.OK) {
          InitializeStructureMemory(key, str.room.name);
          strMem = Memory.structures[key];
        }

        if (!cache[strMem.room]) cache[strMem.room] = [];
        cache[strMem.room].push({
          id: key,
          structureType: str.structureType,
        });
      }
    });

    const returnCompleteCache = ReturnCompleteCache(
      Memory.cache.structures.data,
      cache,
      Memory.structures
    );

    Memory.cache.structures.data = returnCompleteCache.response as StringMap<
      StructureCache[]
    >;

    Log(
      LogTypes.Debug,
      "src/memory/updateCache:UpdateStructuresCache",
      "Updated the Structures cache"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const UpdateCreepsCache = FuncWrapper(
  function UpdateCreepsCache(): FunctionReturn {
    if (Memory.cache.creeps.nextCheckTick > Game.time)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    Memory.cache.creeps.nextCheckTick =
      Game.time + CacheNextCheckIncrement.creeps;

    const cache: StringMap<CreepCache[]> = {};
    forOwn(Game.creeps, (creep: Creep, key: string) => {
      let creepMemory = Memory.creeps[key];
      if (IsCreepMemoryInitialized(key).code !== FunctionReturnCodes.OK) {
        InitializeCreepMemory(key, creep.room.name);
        creepMemory = Memory.creeps[key];
      }

      if (!cache[creepMemory.commandRoom]) cache[creepMemory.commandRoom] = [];
      cache[creepMemory.commandRoom].push({ id: key, creepType: "None" });
    });

    const returnCompleteCache = ReturnCompleteCache(
      Memory.cache.creeps.data,
      cache,
      Memory.creeps
    );

    Memory.cache.creeps.data = returnCompleteCache.response as StringMap<
      CreepCache[]
    >;

    Log(
      LogTypes.Debug,
      "src/memory/updateCache:UpdateCreepsCache",
      "Updated the Creeps cache"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const Update = FuncWrapper(function Update() {
  UpdateRoomsCache();
  UpdateStructuresCache();
  UpdateCreepsCache();

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
