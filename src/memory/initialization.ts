import { forEach, isUndefined } from "lodash";
import { Log } from "../utils/logger";
import { FuncWrapper, IntentWrapper } from "../utils/wrapper";
import { AssignCommandsToHeap } from "../utils/consoleCommands";
import { LogTypes } from "../utils/constants/global";
import { TrackedIntents as TrackedRoomIntents } from "../utils/constants/room";
import { TrackedIntents as TrackedStructureIntents } from "../utils/constants/structure";
import { TrackedIntents as TrackedCreepIntents } from "../utils/constants/creep";
import { GetCreep, GetType as GetCreepType } from "../creep/helper";
import { GetRoom } from "../room/helper";
import { TryToExecuteRoomPlanner } from "../room/planner/planner";
import { GetSources } from "../room/reading";
import { UpdateCacheHandler } from "./updateCache";
import StatsHandler from "./stats";

export default class MemoryInitializationHandler {
  public static AreHeapVarsValid = FuncWrapper(
    function AreHeapVarsValid(): boolean {
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
        return true;
      }
      return false;
    }
  );
  
  public static InitializeHeapVars = FuncWrapper(
    function InitializeHeapVars(): boolean {
      StatsHandler.ResetPreProcessingStats();
      AssignCommandsToHeap();
  
      Log(
        LogTypes.Info,
        "memory/initialization:InitializeHeapVars",
        "Initialized heap vars"
      );
      return true;
    }
  );
  
  public static AreCustomPrototypesInitialized = FuncWrapper(
    function AreCustomPrototypesInitialized(): boolean {
      if (
        Room.prototype.command &&
        Structure.prototype.command &&
        Creep.prototype.command
      ) {
        return true;
      }
      return false;
    }
  );
  
  public static InitializeCustomPrototypes = FuncWrapper(
    function InitializeCustomPrototypes(): boolean {
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
  
      return true;
    }
  );
  
  public static IsGlobalMemoryInitialized = FuncWrapper(
    function IsGlobalMemoryInitialized(): boolean {
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
  );
  
  public static InitializeGlobalMemory = FuncWrapper(
    function InitializeGlobalMemory(): boolean {
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
  
      StatsHandler.ResetStats();
      UpdateCacheHandler.UpdateAll();
  
      Log(
        LogTypes.Info,
        "memory/initialization:InitializeGlobalMemory",
        "Initialized Global memory"
      );
  
      return true;
    }
  );
  
  public static InitializeRoomMemory = FuncWrapper(function InitializeRoomMemory(
    roomName: string
  ): boolean {
    Memory.rooms[roomName] = {
      jobs: [],
      spawnQueue: [],
      sourceCount: 0,
    };
    const room = GetRoom(roomName);

    const csSites: ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
    forEach(csSites, (site: ConstructionSite) => {
      site.remove();
    });
    const sources: Source[] | undefined = GetSources(room).response;
    Memory.rooms[roomName].sourceCount = sources ? sources.length : 0;
    TryToExecuteRoomPlanner(room, true);
  
    Log(
      LogTypes.Debug,
      "memory/initialization:InitializeRoomMemory",
      "Initialized Room memory"
    );
  
    return true;
  });
  
  public static InitializeStructureMemory = FuncWrapper(
    function InitializeStructureMemory(
      id: string,
      roomName: string
    ): boolean {
      Memory.structures[id] = { room: roomName };
  
      Log(
        LogTypes.Debug,
        "memory/initialization:InitializeStructureMemory",
        "Initialized Structure memory"
      );
  
      return true;
    }
  );
  
  public static InitializeCreepMemory = FuncWrapper(function InitializeCreepMemory(
    name: string,
    roomName: string,
    creepType?: CreepTypes,
    addToCache = false
  ): boolean {
    const creep = GetCreep(name).response;
  
    Memory.creeps[name] = {
      commandRoom: roomName,
      type: creepType || GetCreepType(creep).response,
      parts: {},
    };
  
    if (addToCache) {
      if (isUndefined(Memory.cache.creeps.data[roomName]))
        Memory.cache.creeps.data[roomName] = [];
      Memory.cache.creeps.data[roomName].push({ id: name });
    }
  
    Log(
      LogTypes.Debug,
      "memory/initialization:InitializeCreepMemory",
      "Initialized Creep memory"
    );
  
    return true;
  });
  
  public static IsRoomMemoryInitialized = FuncWrapper(
    function IsRoomMemoryInitialized(id: string): boolean {
      if (
        Memory.rooms &&
        Memory.rooms[id] &&
        Memory.cache.rooms.data.includes(id)
      ) {
        return true;
      }
      return false;
    }
  );
  
  public static IsStructureMemoryInitialized = FuncWrapper(
    function IsStructureMemoryInitialized(id: Id<Structure>): boolean {
      if (Memory.structures[id]) {
        const strMem = Memory.structures[id];
        if (
          strMem.room &&
          Memory.cache.structures.data[strMem.room].map((s) => s.id).includes(id)
        )
          return true;
      }
      return false;
    }
  );
  
  public static IsCreepMemoryInitialized = FuncWrapper(
    function IsCreepMemoryInitialized(id: string): boolean {
      if (Memory.creeps[id]) {
        const crpMem = Memory.creeps[id];
        if (crpMem.commandRoom)
          return true;
      }
      return false;
    }
  );
  
}

