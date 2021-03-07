import { forEach, isUndefined } from "lodash";
import { Log } from "../utils/logger";
import { Update } from "./updateCache";
import { ResetStats, ResetPreProcessingStats } from "./stats";
import { FuncWrapper, IntentWrapper } from "../utils/wrapper";
import { AssignCommandsToHeap } from "../utils/consoleCommands";
import { FunctionReturnCodes, LogTypes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { TrackedIntents as TrackedRoomIntents } from "../utils/constants/room";
import { TrackedIntents as TrackedStructureIntents } from "../utils/constants/structure";
import { TrackedIntents as TrackedCreepIntents } from "../utils/constants/creep";
import { GetCreep, GetType as GetCreepType } from "../creep/helper";
import { AssignNewJobForCreep } from "../room/jobs";

export const AreHeapVarsValid = FuncWrapper(
  function AreHeapVarsValid(): FunctionReturn {
    const gbl = global;
    if (
      gbl.preProcessingStats &&
      gbl.help &&
      gbl.resetGlobalMemory &&
      gbl.resetRoomMemory &&
      gbl.resetStructureMemory &&
      gbl.resetCreepMemory &&
      gbl.deleteRoomMemory &&
      gbl.deleteStructureMemory &&
      gbl.deleteCreepMemory
    ) {
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);

export const InitializeHeapVars = FuncWrapper(
  function InitializeHeapVars(): FunctionReturn {
    ResetPreProcessingStats();
    AssignCommandsToHeap();

    Log(
      LogTypes.Info,
      "memory/initialization:InitializeHeapVars",
      "Initialized heap vars"
    );
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const AreCustomPrototypesInitialized = FuncWrapper(
  function AreCustomPrototypesInitialized(): FunctionReturn {
    if (
      Room.prototype.command &&
      Structure.prototype.command &&
      Creep.prototype.command
    ) {
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);

export const InitializeCustomPrototypes = FuncWrapper(
  function InitializeCustomPrototypes(): FunctionReturn {
    forEach(TrackedRoomIntents, (key: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      Room.prototype.command = ((Room.prototype as unknown) as StringMap<Function>)[
        key
      ];
      IntentWrapper(Room.prototype, key, Room.prototype.command);
    });
    forEach(TrackedStructureIntents, (key: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      Structure.prototype.command = ((Structure.prototype as unknown) as StringMap<Function>)[
        key
      ];
      IntentWrapper(Structure.prototype, key, Structure.prototype.command);
    });
    forEach(TrackedCreepIntents, (key: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      Creep.prototype.command = ((Creep.prototype as unknown) as StringMap<Function>)[
        key
      ];
      IntentWrapper(Creep.prototype, key, Creep.prototype.command);
    });

    Log(
      LogTypes.Info,
      "memory/initialization:InitializeCustomPrototypes",
      "Initialized custom prototypes"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const IsGlobalMemoryInitialized = FuncWrapper(
  function IsGlobalMemoryInitialized(): FunctionReturn {
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
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);

export const InitializeGlobalMemory = FuncWrapper(
  function InitializeGlobalMemory(): FunctionReturn {
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

    ResetStats();
    Update();

    Log(
      LogTypes.Info,
      "memory/initialization:InitializeGlobalMemory",
      "Initialized Global memory"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const InitializeRoomMemory = FuncWrapper(function InitializeRoomMemory(
  roomName: string
): FunctionReturn {
  Memory.rooms[roomName] = { jobs: [], spawnQueue: [] };

  Log(
    LogTypes.Debug,
    "memory/initialization:InitializeRoomMemory",
    "Initialized Room memory"
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const InitializeStructureMemory = FuncWrapper(
  function InitializeStructureMemory(
    id: string,
    roomName: string
  ): FunctionReturn {
    Memory.structures[id] = { room: roomName };

    Log(
      LogTypes.Debug,
      "memory/initialization:InitializeStructureMemory",
      "Initialized Structure memory"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const InitializeCreepMemory = FuncWrapper(function InitializeCreepMemory(
  name: string,
  roomName: string,
  creepType?: CreepTypes,
  addToCache = false
): FunctionReturn {
  const creep = GetCreep(name).response;

  Memory.creeps[name] = {
    commandRoom: roomName,
    type: creepType || GetCreepType(creep).response,
  };

  if (addToCache) {
    if (isUndefined(Memory.cache.creeps.data[roomName]))
      Memory.cache.creeps.data[roomName] = [];
    Memory.cache.creeps.data[roomName].push({ id: name });
  }

  AssignNewJobForCreep(name);

  Log(
    LogTypes.Debug,
    "memory/initialization:InitializeCreepMemory",
    "Initialized Creep memory"
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const IsRoomMemoryInitialized = FuncWrapper(
  function IsRoomMemoryInitialized(id: string): FunctionReturn {
    if (
      Memory.rooms &&
      Memory.rooms[id] &&
      Memory.cache.rooms.data.includes(id)
    ) {
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);

export const IsStructureMemoryInitialized = FuncWrapper(
  function IsStructureMemoryInitialized(id: Id<Structure>): FunctionReturn {
    if (Memory.structures[id]) {
      const strMem = Memory.structures[id];
      if (
        strMem.room &&
        Memory.cache.structures.data[strMem.room].map((s) => s.id).includes(id)
      )
        return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);

export const IsCreepMemoryInitialized = FuncWrapper(
  function IsCreepMemoryInitialized(id: string): FunctionReturn {
    if (Memory.creeps[id]) {
      const crpMem = Memory.creeps[id];
      if (crpMem.commandRoom)
        return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);
