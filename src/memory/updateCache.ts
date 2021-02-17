import Logger from "../utils/logger";
import RoomHelper from "../room/helper";
import { CacheNextCheckIncrement } from "../utils/constants/global";
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

      Memory.cache.rooms.data = [];
      Memory.cache.rooms.nextCheckTick =
        Game.time + CacheNextCheckIncrement.rooms;
      Object.keys(Game.rooms).forEach((key) => {
        const room = Game.rooms[key];
        if (RoomHelper.IsMyRoom(room) || RoomHelper.IsMyReservedRoom(room))
          Memory.cache.rooms.data.push(key);
      });

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

      Memory.cache.structures.data = {};
      Memory.cache.structures.nextCheckTick =
        Game.time + CacheNextCheckIncrement.structures;

      Object.keys(Game.structures).forEach((key) => {
        const structure = Game.structures[key];
        const structureMemory = Memory.structures[key];
        if (
          structureMemory !== undefined &&
          CachedStructureTypes.includes(structure.structureType)
        ) {
          if (Memory.cache.structures.data[structureMemory.room] === undefined)
            Memory.cache.structures.data[structureMemory.room] = [];
          Memory.cache.structures.data[structureMemory.room].push(key);
        }
      });

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

      Memory.cache.creeps.data = {};
      Memory.cache.creeps.nextCheckTick =
        Game.time + CacheNextCheckIncrement.creeps;
      Object.keys(Game.creeps).forEach((key) => {
        const creepMemory = Memory.creeps[key];
        if (creepMemory !== undefined) {
          if (Memory.cache.creeps.data[creepMemory.commandRoom] === undefined)
            Memory.cache.creeps.data[creepMemory.commandRoom] = [];
          Memory.cache.creeps.data[creepMemory.commandRoom].push(key);
        }
      });

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
