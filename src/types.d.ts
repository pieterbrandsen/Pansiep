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

interface RoomEnergyIncome {
  harvest: number;
  dismantle: number;
}

interface RoomEnergyExpenses {
  build: number;
  repair: number;
  spawn: StringMap<number>;
  upgrade: number;
}

interface EnergyInStorages {
  terminal: number;
  storage: number;
  containers: number;
}

interface RoomStats {
  energyInStorages: EnergyInStorages;
  creepCount: number;
  structureCount: number;
  energyIncome: RoomEnergyIncome;
  energyExpenses: RoomEnergyExpenses;
  rcl: GlobalControlLevel;
  activeJobs: StringMap<number>;
  creepCountPerJob: StringMap<number>;
}

interface GlobalCpuUsage {
  usage: StringMap<number>;
  bucket: StringMap<number>;
}

interface StatsMemory {
  intentCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  funcCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  ticksStatsCollecting: number;
  gcl: GlobalControlLevel;
  rooms: StringMap<RoomStats>;
  cpu: GlobalCpuUsage;
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

  assignedCreepsNames: string[];
  maxCreeps: number;
  assignedStructuresIds: Id<Structure>[];
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

type BaseTypes = "hearth" | "extension" | "lab";
interface BaseStructure {
  pos: RoomPosition;
  type: StructureConstant;
}

interface RoomMemory {
  spawnQueue: CreepTypes[];
  jobs: Job[];
  sourceCount: number;

  // Base
  lastControllerLevelAtRoomPlanner?: number;
  base?: {
    hearth?: RoomPosition;
    lab?: RoomPosition;
    extension: RoomPosition[];
  };

  isNotSeenSince?: number;
}

interface CreepMemory {
  type: CreepTypes;
  commandRoom: string;
  parts: StringMap<number>;

  walkPath?: PathStep[];
  isNotSeenSince?: number;
  jobId?: Id<Job>;
  secondJobId?: Id<Job>;
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

    help(): string;

    resetGlobalMemory(): boolean;
    resetRoomMemory(roomName: string): boolean;
    resetStructureMemory(roomName: string, id: Id<Structure>): boolean;
    resetCreepMemory(roomName: string, creepName: string): boolean;

    deleteRoomMemory(roomName: string): boolean;
    deleteStructureMemory(roomName: string, id: Id<Structure>): boolean;
    deleteCreepMemory(roomName: string, creepName: string): boolean;
  }
}
