interface StringMap<T> {
  [key: string]: T;
}

interface StatsMemory {}

interface RoomMemory {}

interface CreepMemory {
  spawnRoom: string;
}

interface StructureMemory {
  room: string;
}

interface Memory {
  structures: StringMap<StructureMemory>;
  stats: StringMap<StatsMemory>;
}

declare namespace NodeJS {
  interface Global {
    help(): string;

    resetGlobalMemory(): string;
    resetRoomMemory(roomName: string): string;
    resetStructureMemory(id: string, roomName: string): string;
    resetCreepMemory(creepName: string, roomName: string): string;

    deleteRoomMemory(roomName: string): string;
    deleteStructureMemory(id: string): string;
    deleteCreepMemory(creepName: string): string;
    // showAllMyRooms(): string;
  }
}
