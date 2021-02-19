import Logger from "../utils/logger";
import Initialization from "./initialization";
import GarbageCollection from "./garbageCollection";
import {
  CacheNextCheckIncrement,
  SaveUnloadedObjectForAmountTicks,
} from "../utils/constants/global";
import { CachedStructureTypes } from "../utils/constants/structure";

export default class UpdateCache {
  public static Update(): boolean {
    if (!this.UpdateRoomsCache()) return false;
    if (!this.UpdateStructuresCache()) return false;
    if (!this.UpdateCreepsCache()) return false;

    return true;
  }

  public static UpdateRoomsCache(): boolean {
    try {
      if (Memory.cache.rooms.nextCheckTick > Game.time) return true;

      Memory.cache.rooms.nextCheckTick =
        Game.time + CacheNextCheckIncrement.rooms;

      const oldCache = Memory.cache.rooms.data;
      const cache: string[] = [];
      Object.keys(Game.rooms).forEach((key) => {
        const roomMemory = Memory.rooms[key];
        if (roomMemory === undefined) {
          Initialization.InitializeRoomMemory(key);
        }
        cache.push(key);
      });

      Object.keys(oldCache).forEach((key) => {
        if (Memory.rooms[key] && !cache.includes(key)) {
          cache.push(key);
          if (Memory.rooms[key].isNotSeenSince === undefined)
            Memory.rooms[key].isNotSeenSince = Game.time;
          else if (
            (Memory.rooms[key].isNotSeenSince as number) +
              SaveUnloadedObjectForAmountTicks * 2 <
            Game.time
          ) {
            GarbageCollection.RemoveRoom(key);
            cache.pop();
          }
        }
      });

      Memory.cache.rooms.data = cache;

      Logger.Debug(
        "src/memory/updateCache:UpdateRoomsCache",
        "Updated the Rooms cache"
      );
      return true;
    } catch (error) {
      Logger.Error("src/memory/updateCache:UpdateRoomsCache", error);
      return false;
    }
  }

  public static UpdateStructuresCache(): boolean {
    try {
      if (Memory.cache.structures.nextCheckTick > Game.time) return true;

      Memory.cache.structures.nextCheckTick =
        Game.time + CacheNextCheckIncrement.structures;

      const oldCache = Memory.cache.structures.data;
      const cache: StringMap<StructureCache[]> = {};
      Object.keys(Game.structures).forEach((key) => {
        const structure = Game.structures[key];
        let structureMemory = Memory.structures[key];
        if (CachedStructureTypes.includes(structure.structureType)) {
          if (structureMemory === undefined) {
            Initialization.InitializeStructureMemory(key, structure.room.name);
            structureMemory = Memory.structures[key];
          }

          if (!cache[structureMemory.room]) cache[structureMemory.room] = [];
          cache[structureMemory.room].push({
            id: key,
            structureType: structure.structureType,
          });
        }
      });

      Object.keys(oldCache).forEach((key) => {
        if (!cache[key]) cache[key] = [];
        const newStructures = cache[key];
        oldCache[key].forEach((structure) => {
          if (
            Memory.structures[structure.id] &&
            !newStructures.some((s) => s.id === structure.id)
          ) {
            newStructures.push(structure);
            if (Memory.structures[structure.id].isNotSeenSince === undefined)
              Memory.structures[structure.id].isNotSeenSince = Game.time;
            else if (
              (Memory.structures[structure.id].isNotSeenSince as number) +
                SaveUnloadedObjectForAmountTicks <
              Game.time
            ) {
              GarbageCollection.RemoveStructure(structure.id);
              newStructures.pop();
            }
          }
        });
      });

      Memory.cache.structures.data = cache;

      Logger.Debug(
        "src/memory/updateCache:UpdateStructuresCache",
        "Updated the Structures cache"
      );
      return true;
    } catch (error) {
      Logger.Error("src/memory/updateCache:UpdateStructuresCache", error);
      return false;
    }
  }

  public static UpdateCreepsCache(): boolean {
    try {
      if (Memory.cache.creeps.nextCheckTick > Game.time) return true;

      Memory.cache.creeps.nextCheckTick =
        Game.time + CacheNextCheckIncrement.creeps;

      const oldCache = Memory.cache.creeps.data;
      const cache: StringMap<CreepCache[]> = {};
      Object.keys(Game.creeps).forEach((key) => {
        let creepMemory = Memory.creeps[key];
        if (creepMemory === undefined) {
          const creep = Game.creeps[key];
          Initialization.InitializeCreepMemory(key, creep.room.name);
          creepMemory = Memory.creeps[key];
        }

        if (!cache[creepMemory.commandRoom])
          cache[creepMemory.commandRoom] = [];
        cache[creepMemory.commandRoom].push({ id: key, creepType: "None" });
      });

      Object.keys(oldCache).forEach((key) => {
        if (!cache[key]) cache[key] = [];
        const newCreeps = cache[key];
        oldCache[key].forEach((creep) => {
          if (
            Memory.creeps[creep.id] &&
            !newCreeps.some((c) => c.id === creep.id)
          ) {
            newCreeps.push(creep);
            if (Memory.creeps[creep.id].isNotSeenSince === undefined)
              Memory.creeps[creep.id].isNotSeenSince = Game.time;
            else if (
              (Memory.creeps[creep.id].isNotSeenSince as number) +
                SaveUnloadedObjectForAmountTicks <
              Game.time
            ) {
              GarbageCollection.RemoveCreep(creep.id);
              newCreeps.pop();
            }
          }
        });
      });

      Memory.cache.creeps.data = cache;

      Logger.Debug(
        "src/memory/updateCache:UpdateCreepsCache",
        "Updated the Creeps cache"
      );
      return true;
    } catch (error) {
      Logger.Error("src/memory/updateCache:UpdateCreepsCache", error);
      return false;
    }
  }
}
