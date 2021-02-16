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
    return true;
  }

  public static InitializeRoomMemory(roomName: string): boolean {
    try {
      Memory.rooms[roomName] = {};
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
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
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
      return false;
    }
  }

  public static InitializeCreepMemory(id: string, roomName: string): boolean {
    try {
      // const room = Game.rooms[roomName];
      Memory.creeps[id] = { spawnRoom: roomName };
      return true;
    } catch (error) {
      console.log(error);
      Game.notify(error);
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
      console.log(error);
      Game.notify(error);
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
      console.log(error);
      Game.notify(error);
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
      console.log(error);
      Game.notify(error);
      return false;
    }
  }
}
