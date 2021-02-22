interface StringMap<T> {
  [key: string]: T;
}

interface LogType {
  code: number;
  value: {
    name: string;
    color: string;
  };
}

interface Room {
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Function;
}

interface Structure {
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Function;
}

interface Creep {
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Function;
}

interface FunctionReturn {
  code: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: any;
}

interface RoomStats {
  creepCount: number;
  structureCount: number;
}

interface StatsMemory {
  intentCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  funcCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  ticksStatsCollecting: number;
  rooms: StringMap<RoomStats>;
}

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

interface StructureCache {
  structureType: StructureConstant;
  id: string;
}

interface CreepCache {
  creepType: string;
  id: string;
}

interface Cache {
  rooms: {
    nextCheckTick: number;
    data: string[];
  };
  structures: {
    nextCheckTick: number;
    data: StringMap<StructureCache[]>;
  };
  creeps: {
    nextCheckTick: number;
    data: StringMap<CreepCache[]>;
  };
}

interface Memory {
  structures: StringMap<StructureMemory>;
  stats: StatsMemory;
  cache: Cache;
}

declare namespace NodeJS {
  interface Global {
    preProcessingStats: StatsMemory;

    help(): string;

    resetGlobalMemory(): string;
    resetRoomMemory(roomName: string): string;
    resetStructureMemory(id: string, roomName: string): string;
    resetCreepMemory(creepName: string, roomName: string): string;

    deleteRoomMemory(roomName: string): string;
    deleteStructureMemory(id: string, roomName: string): string;
    deleteCreepMemory(creepName: string, roomName: string): string;
    // showAllMyRooms(): string;
  }
}
