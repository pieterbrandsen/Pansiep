interface StringMap<T> {
  [key: string]: T;
}
// eslint-disable-next-line
interface StatsMemory {}

interface RoomMemory {
  isNotSeenSince?: number;
}

interface CreepMemory {
  isNotSeenSince?: number;
  commandRoom: string;
}

interface StructureMemory {
  isNotSeenSince?: number;
  room: string;
}

interface CacheObjectWArray {
  nextCheckTick: number;
  data: string[];
}

interface CacheObjectWObject {
  nextCheckTick: number;
  data: StringMap<string[]>;
}

interface Cache {
  structures: CacheObjectWObject;
  creeps: CacheObjectWObject;
  rooms: CacheObjectWArray;
}

interface Memory {
  structures: StringMap<StructureMemory>;
  stats: StringMap<StatsMemory>;
  cache: Cache;
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
