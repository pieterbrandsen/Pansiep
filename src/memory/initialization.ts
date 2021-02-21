import { Log } from "../utils/logger";
import { Update } from "./updateCache";
import { ResetStats, ResetPreProcessingStats } from "./stats";
import { FuncWrapper } from "../utils/wrapper";
import { AssignCommandsToHeap } from "../utils/consoleCommands";
import { FunctionReturnCodes, LogTypes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

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
      "Initialized Heap vars"
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
  Memory.rooms[roomName] = {};

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
  id: string,
  roomName: string
): FunctionReturn {
  Memory.creeps[id] = { commandRoom: roomName };

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
  function IsStructureMemoryInitialized(id: string): FunctionReturn {
    if (Memory.structures && Memory.structures[id]) {
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
    if (Memory.creeps && Memory.creeps[id]) {
      const crpMem = Memory.creeps[id];
      if (crpMem.commandRoom)
        return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
);
