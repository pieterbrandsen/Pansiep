type StructuresWithStorage =
  | StructureLab
  | StructureLink
  | StructureNuker
  | StructureSpawn
  | StructureExtension
  | StructureTower;
type DedicatedStorageStructures =
  | StructureTerminal
  | StructureContainer
  | StructureFactory
  | StructureStorage;

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
  rcl: GlobalControlLevel;
}

interface StatsMemory {
  intentCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  funcCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  ticksStatsCollecting: number;
  gcl: GlobalControlLevel;
  rooms: StringMap<RoomStats>;
}

type JobActionTypes =
  | "move"
  | "transfer"
  | "transferSource"
  | "withdraw"
  | "withdrawController"
  | "harvest"
  | "build"
  | "repair"
  | "dismantle"
  | "upgrade"
  | "attack"
  | "claim"
  | "heal";

interface Job {
  id: Id<Job>;
  action: JobActionTypes;
  updateJobAtTick: number;

  assignedCreepsIds: string[];
  maxCreeps: number;
  assignedStructuresIds: string[];
  maxStructures: number;

  roomName: string;
  objId: Id<Structure | ConstructionSite | Creep | Source>;

  hasPriority: boolean;
  position?: RoomPosition;
  resourceType?: ResourceConstant;
  energyRequired?: number;
  stopHealingAtMaxHits?: boolean;
  expireAtTick?: number;
}

type CreepTypes =
  | "pioneer"
  | "work"
  | "move"
  | "transferring"
  | "heal"
  | "attack"
  | "claim"
  | "none";

interface BaseStructure {
  pos: RoomPosition;
  type: StructureConstant;
}

interface RoomMemory {
  spawnQueue: CreepTypes[];
  jobs: Job[];

  // Base
  lastControllerLevelAtRoomPlanner?: number;
  base?: string[];

  isNotSeenSince?: number;
}

interface CreepMemory {
  type: CreepTypes;
  commandRoom: string;

  walkPath?: PathStep[];
  isNotSeenSince?: number;
  jobId?: string;
  secondJobId?: string;
}

interface StructureMemory {
  isNotSeenSince?: number;
  room: string;
  jobId?: string;
}

interface StructureCache {
  structureType: StructureConstant;
  id: string;
}

interface CreepCache {
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

    help?(): string;

    resetGlobalMemory(): number;
    resetRoomMemory(roomName: string): number;
    resetStructureMemory(id: Id<Structure>, roomName: string): number;
    resetCreepMemory(creepName: string, roomName: string): number;

    deleteRoomMemory(roomName: string): number;
    deleteStructureMemory(id: Id<Structure>, roomName: string): number;
    deleteCreepMemory(creepName: string, roomName: string): number;
  }
}
