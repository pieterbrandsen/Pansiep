import Logger from '../utils/logger';

interface IInitialization {}

export default class Initialization implements IInitialization {
  public static IsGlobalMemoryInitialized(): boolean {
    if (
      Memory &&
      Memory.powerCreeps &&
      Memory.flags &&
      Memory.rooms &&
      Memory.spawns &&
      Memory.structures &&
      Memory.creeps &&
      Memory.stats
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
    Memory.stats = {};
    Logger.Info("memory/initialization:InitializeGlobalMemory", "Initialized Global memory");
    return true;
  }

  public static InitializeRoomMemory(roomName: string): boolean {
    try {
      Memory.rooms[roomName] = {};
      Logger.Info("memory/initialization:InitializeRoomMemory", "Initialized Room memory");
      return true;
    } catch (error) {
      Logger.Error("memory/initialization:InitializeRoomMemory", error,{roomName});
      return false;
    }
  }

  public static InitializeStructureMemory(
    id: string,
    roomName: string
  ): boolean {
    try {
      // const room = Game.rooms[roomName];
      Memory.structures[id] = { room: roomName };
      Logger.Info("memory/initialization:InitializeStructureMemory", "Initialized Structure memory");
    return true;
    } catch (error) {
      Logger.Error("memory/initialization:InitializeStructureMemory", error,{id, roomName});
      return false;
    }
  }

  public static InitializeCreepMemory(id: string, roomName: string): boolean {
    try {
      // const room = Game.rooms[roomName];
      Memory.creeps[id] = { spawnRoom: roomName };
      Logger.Info("memory/initialization:InitializeCreepMemory", "Initialized Creep memory");
      return true;
    } catch (error) {
      Logger.Error("memory/initialization:InitializeCreepMemory", error,{id, roomName});
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
      Logger.Error("memory/initialization:IsRoomMemoryInitialized", error,{ roomName});
      return false;
    }
  }

  public static IsStructureMemoryInitialized(id: string): boolean {
    try {
      if (Memory.structures && Memory.structures[id]) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.Error("memory/initialization:IsStructureMemoryInitialized", error,{id});
      return false;
    }
  }

  public static IsCreepMemoryInitialized(id: string): boolean {
    try {
      if (Memory.creeps && Memory.creeps[id]) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.Error("memory/initialization:IsCreepMemoryInitialized", error,{id});
      return false;
    }
  }
}
