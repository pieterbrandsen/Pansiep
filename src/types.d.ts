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
