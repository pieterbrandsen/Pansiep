import { forEach, forOwn, isUndefined } from "lodash";
import { Log } from "../utils/logger";
import {
  InitializeCreepMemory,
  InitializeRoomMemory,
  InitializeStructureMemory,
  IsCreepMemoryInitialized,
  IsRoomMemoryInitialized,
  IsStructureMemoryInitialized,
} from "./initialization";
import {
  CacheNextCheckIncrement,
  FunctionReturnCodes,
  LogTypes,
  SaveUnloadedObjectForAmountTicks,
} from "../utils/constants/global";
import { CachedStructureTypes } from "../utils/constants/structure";
import { FuncWrapper } from "../utils/wrapper";
import { RemoveCreep, RemoveRoom, RemoveStructure } from "./garbageCollection";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { DeleteJobById, UpdateJobById, GetJobById } from "../room/jobs";
import { GetConstructionSitesInRange } from "../room/reading";
import { GetRoom } from "../room/helper";

export const CreateMoveJob = FuncWrapper(function CreateMoveJob(
  jobId: Id<Job>,
  roomName: string
): FunctionReturn {
  const job: Job = {
    id: jobId,
    action: "move",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: 1,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName,
    objId: "UNDEFINED" as Id<Structure>,
    hasPriority: false,
    position: { x: 25, y: 25 },
  };
  UpdateJobById(jobId, job, roomName);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const TryToCreateMoveJob = FuncWrapper(function TryToCreateMoveJob(
  jobId: Id<Job>,
  roomName: string
) {
  if (GetJobById(jobId, roomName).code === FunctionReturnCodes.NOT_FOUND) {
    CreateMoveJob(jobId, roomName);
    return FunctionReturnHelper(FunctionReturnCodes.CREATED);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

type RoomObjTypes = StringMap<StructureCache[] | CreepCache[]>;
export const ReturnCompleteCache = FuncWrapper(function ReturnCompleteCache(
  currentCache: RoomObjTypes,
  newCache: RoomObjTypes,
  roomObject: StringMap<StructureMemory> | StringMap<CreepMemory>
): FunctionReturn {
  const returnCache = newCache;
  Object.keys(currentCache).forEach((key) => {
    const noVisionJobId = `move-25/25-${key}` as Id<Job>;

    if (!returnCache[key]) returnCache[key] = [];
    const newCacheArr = returnCache[key];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEach(currentCache[key], (obj: any) => {
      if (
        obj &&
        roomObject[obj.id] &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !newCacheArr.some((c: any) => c.id === obj.id)
      ) {
        newCacheArr.push(obj);

        if (isUndefined(roomObject[obj.id].isNotSeenSince))
          // eslint-disable-next-line no-param-reassign
          roomObject[obj.id].isNotSeenSince = Game.time;
        else if (
          (roomObject[obj.id].isNotSeenSince as number) +
            SaveUnloadedObjectForAmountTicks <=
          Game.time
        ) {
          if ((roomObject[obj.id] as StructureMemory).room !== undefined)
            RemoveStructure(obj.id, key);
          else RemoveCreep(obj.id, key);
          newCacheArr.pop();
        }
      } else if (
        roomObject[obj.id] &&
        roomObject[obj.id].isNotSeenSince !== undefined
      ) {
        DeleteJobById(noVisionJobId, key);
        // eslint-disable-next-line no-param-reassign
        delete roomObject[obj.id].isNotSeenSince;
      }
    });
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, newCache);
});

export const UpdateRoomsCache = FuncWrapper(
  function UpdateRoomsCache(): FunctionReturn {
    if (Memory.cache.rooms.nextCheckTick > Game.time)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    Memory.cache.rooms.nextCheckTick =
      Game.time + CacheNextCheckIncrement.rooms;

    const savedCache = Memory.cache.rooms.data;
    const cache: string[] = [];
    forEach(Object.keys(Game.rooms), (key: string) => {
      if (IsRoomMemoryInitialized(key).code !== FunctionReturnCodes.OK)
        InitializeRoomMemory(key);

      cache.push(key);
    });

    forEach(savedCache, (key: string) => {
      if (Memory.rooms[key] && !cache.includes(key)) {
        cache.push(key);

        const roomMem: RoomMemory = Memory.rooms[key];
        if (isUndefined(roomMem.isNotSeenSince)) {
          roomMem.isNotSeenSince = Game.time;
        } else if (
          (roomMem.isNotSeenSince as number) +
            SaveUnloadedObjectForAmountTicks * 2 <=
          Game.time
        ) {
          RemoveRoom(key);
          cache.pop();
        }
      } else if (
        Memory.rooms[key] &&
        Memory.rooms[key].isNotSeenSince !== undefined
      )
        delete Memory.rooms[key].isNotSeenSince;
    });

    Memory.cache.rooms.data = cache;

    Log(
      LogTypes.Debug,
      "src/memory/updateCache:UpdateRoomsCache",
      "Updated the Rooms cache"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const UpdateStructuresCache = FuncWrapper(
  function UpdateStructuresCache(): FunctionReturn {
    if (Memory.cache.structures.nextCheckTick > Game.time)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    Memory.cache.structures.nextCheckTick =
      Game.time + CacheNextCheckIncrement.structures;

    const cache: StringMap<StructureCache[]> = {};
    forEach(Game.rooms, (room: Room) => {
      forEach(
        room.find(FIND_STRUCTURES, {
          filter: { structureType: STRUCTURE_CONTAINER },
        }),
        (str: Structure) => {
          Game.structures[str.id] = str;
        }
      );
    });

    forOwn(Game.structures, (str: Structure, id: string) => {
      let strMem = Memory.structures[id];
      if (CachedStructureTypes.includes(str.structureType)) {
        if (
          IsStructureMemoryInitialized(id as Id<Structure>).code !==
          FunctionReturnCodes.OK
        ) {
          InitializeStructureMemory(id, str.room.name);
          strMem = Memory.structures[id];
        }

        if (!cache[strMem.room]) cache[strMem.room] = [];
        cache[strMem.room].push({
          id,
          structureType: str.structureType,
        });
      }
    });

    const returnCompleteCache = ReturnCompleteCache(
      Memory.cache.structures.data,
      cache,
      Memory.structures
    );

    Memory.cache.structures.data = returnCompleteCache.response as StringMap<
      StructureCache[]
    >;

    Log(
      LogTypes.Debug,
      "src/memory/updateCache:UpdateStructuresCache",
      "Updated the Structures cache"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const UpdateCreepsCache = FuncWrapper(
  function UpdateCreepsCache(): FunctionReturn {
    if (Memory.cache.creeps.nextCheckTick > Game.time)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    Memory.cache.creeps.nextCheckTick =
      Game.time + CacheNextCheckIncrement.creeps;

    const cache: StringMap<CreepCache[]> = {};
    forOwn(Game.creeps, (creep: Creep, name: string) => {
      let creepMemory = Memory.creeps[name];
      if (IsCreepMemoryInitialized(name).code !== FunctionReturnCodes.OK) {
        InitializeCreepMemory(name, creep.room.name);
        creepMemory = Memory.creeps[name];
      }

      if (!cache[creepMemory.commandRoom]) cache[creepMemory.commandRoom] = [];
      cache[creepMemory.commandRoom].push({ id: name });
    });

    const returnCompleteCache = ReturnCompleteCache(
      Memory.cache.creeps.data,
      cache,
      Memory.creeps
    );

    Memory.cache.creeps.data = returnCompleteCache.response as StringMap<
      CreepCache[]
    >;

    Log(
      LogTypes.Debug,
      "src/memory/updateCache:UpdateCreepsCache",
      "Updated the Creeps cache"
    );

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const UpdateJobsCache = FuncWrapper(
  function UpdateJobsCache(): FunctionReturn {
    forOwn(Memory.rooms, (mem: RoomMemory, key: string) => {
      const getRoom = GetRoom(key);
      if (
        isUndefined(mem.isNotSeenSince) &&
        getRoom.code === FunctionReturnCodes.OK
      ) {
        const room: Room = getRoom.response;
        for (let i = 0; i < mem.jobs.length; i += 1) {
          const job = mem.jobs[i];
          if (job.updateJobAtTick <= Game.time) {
            let obj: Structure | ConstructionSite | Creep;
            switch (job.action) {
              case "build":
                if (job.objId === "undefined" && job.position) {
                  const pos: RoomPosition = new RoomPosition(
                    job.position.x,
                    job.position.y,
                    key
                  );
                  const csSites: ConstructionSite[] = GetConstructionSitesInRange(
                    pos,
                    0,
                    room
                  ).response;
                  if (csSites.length > 0) job.objId = csSites[0].id;
                }
                obj = Game.getObjectById(job.objId) as ConstructionSite;
                if (obj) {
                  job.energyRequired =
                    (obj.progressTotal - obj.progress) / BUILD_POWER;
                  job.updateJobAtTick =
                    Game.time + CacheNextCheckIncrement.jobs;
                  UpdateJobById(job.id, job, key);
                } else {
                  DeleteJobById(job.id, key);
                  UpdateStructuresCache();
                }
                break;
              default:
                break;
            }
          }
        }
      }
    });
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const Update = FuncWrapper(function Update() {
  UpdateRoomsCache();
  UpdateStructuresCache();
  UpdateCreepsCache();
  UpdateJobsCache();

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
