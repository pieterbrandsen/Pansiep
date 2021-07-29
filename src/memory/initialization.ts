import { forEach, isUndefined } from "lodash";
import LoggerHandler from "../utils/logger";
import UpdateCacheHandler from "./updateCache";
import StatsHandler from "./stats";
import ConsoleCommandsHandler from "../utils/consoleCommands";
import GlobalConstants from "../utils/constants/global";
import RoomConstants from "../utils/constants/room";
import StructureConstants from "../utils/constants/structure";
import CreepConstants from "../utils/constants/creep";
import RoomHelper from "../room/helper";
import RoomPlannerHandler from "../room/planner/planner";
import CreepHelper from "../creep/helper";
import WrapperHandler from "../utils/wrapper";

export default class MemoryInitializationHandler {
  public static AreHeapVarsValid = WrapperHandler.FuncWrapper(
    function AreHeapVarsValid(): boolean {
      const gbl = global;
      if (gbl.preProcessingStats) {
        return true;
      }
      return false;
    }
  );

  public static InitializeHeapVars = WrapperHandler.FuncWrapper(
    function InitializeHeapVars(): void {
      StatsHandler.ResetPreProcessingStats();
      ConsoleCommandsHandler.AssignCommandsToHeap();

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Info,
        "memory/initialization:InitializeHeapVars",
        "Initialized heap vars"
      );
    }
  );

  public static AreCustomPrototypesInitialized = WrapperHandler.FuncWrapper(
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

  public static InitializeCustomPrototypes = WrapperHandler.FuncWrapper(
    function InitializeCustomPrototypes(): void {
      forEach(RoomConstants.TrackedIntents, (key: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        Room.prototype.command = ((Room.prototype as unknown) as StringMap<Function>)[
          key
        ];
        WrapperHandler.IntentWrapper(
          Room.prototype,
          key,
          Room.prototype.command
        );
      });
      forEach(StructureConstants.TrackedIntents, (key: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        Structure.prototype.command = ((Structure.prototype as unknown) as StringMap<Function>)[
          key
        ];
        WrapperHandler.IntentWrapper(
          Structure.prototype,
          key,
          Structure.prototype.command
        );
      });
      forEach(CreepConstants.TrackedIntents, (key: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        Creep.prototype.command = ((Creep.prototype as unknown) as StringMap<Function>)[
          key
        ];
        WrapperHandler.IntentWrapper(
          Creep.prototype,
          key,
          Creep.prototype.command
        );
      });

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Info,
        "memory/initialization:InitializeCustomPrototypes",
        "Initialized custom prototypes"
      );
    }
  );

  public static IsGlobalMemoryInitialized = WrapperHandler.FuncWrapper(
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

  public static InitializeGlobalMemory = WrapperHandler.FuncWrapper(
    function InitializeGlobalMemory(): void {
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
        jobs: { nextCheckTick: 0 },
      };

      StatsHandler.ResetStats();
      StatsHandler.ResetPreProcessingStats();
      UpdateCacheHandler.UpdateAll();

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Info,
        "memory/initialization:InitializeGlobalMemory",
        "Initialized Global memory"
      );
    }
  );

  public static InitializeRoomMemory = WrapperHandler.FuncWrapper(
    function InitializeRoomMemory(roomName: string): void {
      Memory.rooms[roomName] = {
        jobs: [],
        spawnQueue: [],
        sourceCount: 0,
      };
      StatsHandler.ResetRoomStats(roomName);
      StatsHandler.ResetPreProcessingRoomStats(roomName);

      const room = RoomHelper.GetRoom(roomName);
      const csSites: ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES);
      forEach(csSites, (site: ConstructionSite) => {
        site.remove();
      });
      const sources: Source[] = RoomHelper.Reader.GetSources(room);
      Memory.rooms[roomName].sourceCount = sources.length;
      RoomPlannerHandler.TryToExecuteRoomPlanner(room, true);

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "memory/initialization:InitializeRoomMemory",
        "Initialized Room memory"
      );
    }
  );

  public static InitializeStructureMemory = WrapperHandler.FuncWrapper(
    function InitializeStructureMemory(
      roomName: string,
      id: string,
      structureType?: StructureConstants,
      addToCache = false
    ): void {
      Memory.structures[id] = { room: roomName };

      if (addToCache) {
        if (isUndefined(Memory.cache.structures.data[roomName]))
          Memory.cache.structures.data[roomName] = [];
        Memory.cache.structures.data[roomName].push({
          id,
          structureType: structureType as StructureConstant,
        });
      }

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "memory/initialization:InitializeStructureMemory",
        "Initialized Structure memory"
      );
    }
  );

  public static InitializeCreepMemory = WrapperHandler.FuncWrapper(
    function InitializeCreepMemory(
      roomName: string,
      name: string,
      creepType?: CreepTypes,
      addToCache = false
    ): void {
      const creep = CreepHelper.GetCreep(name);

      Memory.creeps[name] = {
        commandRoom: roomName,
        type: creepType !== undefined ? creepType : CreepHelper.GetType(creep),
        parts: {},
      };

      if (addToCache) {
        if (isUndefined(Memory.cache.creeps.data[roomName]))
          Memory.cache.creeps.data[roomName] = [];
        Memory.cache.creeps.data[roomName].push({ id: name });
      }

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "memory/initialization:InitializeCreepMemory",
        "Initialized Creep memory"
      );
    }
  );

  public static IsRoomMemoryInitialized = WrapperHandler.FuncWrapper(
    function IsRoomMemoryInitialized(roomName: string): boolean {
      if (
        Memory.rooms &&
        Memory.rooms[roomName] &&
        Memory.cache.rooms.data.includes(roomName)
      ) {
        return true;
      }
      return false;
    }
  );

  public static IsStructureMemoryInitialized = WrapperHandler.FuncWrapper(
    function IsStructureMemoryInitialized(id: Id<Structure>): boolean {
      if (Memory.structures[id]) {
        const strMem = Memory.structures[id];
        if (
          strMem.room &&
          Memory.cache.structures.data[strMem.room]
            .map((s) => s.id)
            .includes(id)
        )
          return true;
      }
      return false;
    }
  );

  public static IsCreepMemoryInitialized = WrapperHandler.FuncWrapper(
    function IsCreepMemoryInitialized(id: string): boolean {
      if (Memory.creeps[id]) {
        const crpMem = Memory.creeps[id];
        if (crpMem.commandRoom) return true;
      }
      return false;
    }
  );
}
