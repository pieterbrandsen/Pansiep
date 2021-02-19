import Logger from "../utils/logger";
import UpdateCache from "./updateCache";
import Stats from "./stats";

export default class Initialization {
  public static IsGlobalMemoryInitialized(): boolean {
    if (
      Memory &&
      Memory.powerCreeps &&
      Memory.flags &&
      Memory.rooms &&
      Memory.spawns &&
      Memory.structures &&
      Memory.creeps &&
      Memory.stats &&
      global.preProcessingStats
    ) {
      return true;
    }
    return false;
  }

  public static InitializeGlobalMemory(): boolean {
    Memory.flags = {};
    Memory.rooms = {};
    Memory.spawns = {};
    Memory.structures = {};
    Memory.powerCreeps = {};
    Memory.creeps = {};
    Memory.cache = {
      creeps: { data: {}, nextCheckTick: 0 },
      structures: { data: {}, nextCheckTick: 0 },
      rooms: { data: [], nextCheckTick: 0 },
    };

    Stats.ResetStats();
    if (!UpdateCache.Update()) return false;
    Logger.Info(
      "memory/initialization:InitializeGlobalMemory",
      "Initialized Global memory"
    );
    return true;
  }

  public static InitializeRoomMemory(roomName: string): boolean {
    try {
      Memory.rooms[roomName] = {};
      Logger.Info(
        "memory/initialization:InitializeRoomMemory",
        "Initialized Room memory"
      );
      return true;
    } catch (error) {
      Logger.Error("memory/initialization:InitializeRoomMemory", error, {
        roomName,
      });
      return false;
    }
  }

  public static InitializeStructureMemory(
    id: string,
    roomName: string
  ): boolean {
    try {
      // const structure = StructureHelper.GetStructure(id);
      // if (structure === null) throw new Error("Structure was null!");

      Memory.structures[id] = { room: roomName };
      Logger.Debug(
        "memory/initialization:InitializeStructureMemory",
        "Initialized Structure memory"
      );
      return true;
    } catch (error) {
      Logger.Error("memory/initialization:InitializeStructureMemory", error, {
        id,
        roomName,
      });
      return false;
    }
  }

  public static InitializeCreepMemory(
    creepName: string,
    roomName: string
  ): boolean {
    try {
      // const room = Game.rooms[roomName];
      Memory.creeps[creepName] = { commandRoom: roomName };
      Logger.Debug(
        "memory/initialization:InitializeCreepMemory",
        "Initialized Creep memory"
      );
      return true;
    } catch (error) {
      Logger.Error("memory/initialization:InitializeCreepMemory", error, {
        creepName,
        roomName,
      });
      return false;
    }
  }

  public static IsRoomMemoryInitialized(roomName: string): boolean {
    try {
      if (Memory.rooms && Memory.rooms[roomName]) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.Error("memory/initialization:IsRoomMemoryInitialized", error, {
        roomName,
      });
      return false;
    }
  }

  public static IsStructureMemoryInitialized(id: string): boolean {
    try {
      if (Memory.structures && Memory.structures[id]) {
        const structureMemory = Memory.structures[id];
        if (structureMemory.room) return true;
      }
      return false;
    } catch (error) {
      Logger.Error(
        "memory/initialization:IsStructureMemoryInitialized",
        error,
        { id }
      );
      return false;
    }
  }

  public static IsCreepMemoryInitialized(id: string): boolean {
    try {
      if (Memory.creeps && Memory.creeps[id]) {
        const creepMemory = Memory.creeps[id];
        if (creepMemory.commandRoom) return true;
      }
      return false;
    } catch (error) {
      Logger.Error("memory/initialization:IsCreepMemoryInitialized", error, {
        id,
      });
      return false;
    }
  }
}
