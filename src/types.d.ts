interface StringMap {
  [key: string]: any;
}

interface CreepMemory {}

interface RoomMemory {}

interface Memory {
  [key: string]: any;
  // Global: StringMap;
  powerCreeps: StringMap;
  rooms: StringMap;
  structures: StringMap;
  creeps: StringMap;
  flags: StringMap;
  spawns: StringMap;

  stats: StringMap;
}
