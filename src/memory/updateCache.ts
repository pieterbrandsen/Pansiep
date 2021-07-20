import { forEach, forOwn } from "lodash";
import LoggerHandler from "../utils/logger";
import FuncWrapper from "../utils/wrapper";
import JobHandler from "../room/jobs/handler";
import GarbageCollectionHandler from "./garbageCollection";
import MemoryInitializationHandler from "./initialization";
import GlobalConstants from "../utils/constants/global";
import RoomHelper from "../room/helper";
import StructureConstants from "../utils/constants/structure";

type RoomObjTypes = StringMap<StructureCache[] | CreepCache[]>;

export default class UpdateCacheHandler {
  /**
   * Creates move job to move to roomName if job does not already exists
   */
  // private static TryToCreateMoveJob = FuncWrapper(function TryToCreateMoveJob(
  //   jobId: Id<Job>,
  //   roomName: string
  // ): boolean {
  //   if (JobHandler.GetJobById(jobId, roomName) === null) {
  //     JobHandler.CreateJob.CreateMoveJob(jobId, roomName);
  //     return true;
  //   }
  //   return true;
  // });

  /**
   * Returns the complete cache of Structures or Creeps
   */
  // TODO: Remove function return
  private static ReturnCompleteCache = FuncWrapper(function ReturnCompleteCache(
    currentCache: RoomObjTypes,
    newCache: RoomObjTypes,
    roomObject: StringMap<StructureMemory> | StringMap<CreepMemory>
  ): RoomObjTypes {
    const returnCache = newCache;
    Object.keys(currentCache).forEach((key) => {
      // const noVisionJobId = `move-25/25-${key}` as Id<Job>;

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

          if (roomObject[obj.id].isNotSeenSince === undefined) {
            // eslint-disable-next-line no-param-reassign
            roomObject[obj.id].isNotSeenSince = Game.time;

            const firstJobId: Id<Job> | undefined = roomObject[obj.id]
              .jobId as Id<Job>;
            if (firstJobId) {
              JobHandler.UnassignJob(firstJobId, obj.id, key);
            }
            const secondJobId: Id<Job> | undefined = (roomObject[
              obj.id
            ] as CreepMemory).secondJobId as Id<Job>;
            if (secondJobId) {
              JobHandler.UnassignJob(secondJobId, obj.id, key);
            }
          } else if (
            (roomObject[obj.id].isNotSeenSince as number) +
              GlobalConstants.SaveUnloadedObjectForAmountTicks <=
            Game.time
          ) {
            if ((roomObject[obj.id] as StructureMemory).room !== undefined)
              GarbageCollectionHandler.RemoveStructure(obj.id, key);
            else GarbageCollectionHandler.RemoveCreep(obj.id, key);
            newCacheArr.pop();
          }
        } else if (
          roomObject[obj.id] &&
          roomObject[obj.id].isNotSeenSince !== undefined
        ) {
          JobHandler.DeleteJob(JobHandler.CreateJob.GetMoveJobId(key), key);
          // eslint-disable-next-line no-param-reassign
          delete roomObject[obj.id].isNotSeenSince;
        }
      });
    });

    return newCache;
  });

  /**
   * Checks if the room cache needs to be updated, if so updates the cache
   */
  public static UpdateRoomsCache = FuncWrapper(
    function UpdateRoomsCache(): void {
      if (Memory.cache.rooms.nextCheckTick > Game.time) return;

      Memory.cache.rooms.nextCheckTick =
        Game.time + GlobalConstants.CacheNextCheckIncrement.rooms;

      const savedCache = Memory.cache.rooms.data;
      const cache: string[] = [];
      forEach(Object.keys(Game.rooms), (key: string) => {
        if (MemoryInitializationHandler.IsRoomMemoryInitialized(key) === false)
          MemoryInitializationHandler.InitializeRoomMemory(key);

        cache.push(key);
      });

      forEach(savedCache, (key: string) => {
        if (Memory.rooms[key] && !cache.includes(key)) {
          cache.push(key);

          const roomMem: RoomMemory = Memory.rooms[key];
          if (roomMem.isNotSeenSince === undefined) {
            roomMem.isNotSeenSince = Game.time;
          } else if (
            (roomMem.isNotSeenSince as number) +
              GlobalConstants.SaveUnloadedObjectForAmountTicks * 2 <=
            Game.time
          ) {
            GarbageCollectionHandler.RemoveRoom(key);
            cache.pop();
          }
        } else if (
          Memory.rooms[key] &&
          Memory.rooms[key].isNotSeenSince !== undefined
        )
          delete Memory.rooms[key].isNotSeenSince;
      });

      Memory.cache.rooms.data = cache;

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "src/memory/updateCache:UpdateRoomsCache",
        "Updated the Rooms cache"
      );
    }
  );

  /**
   * Checks if the structure cache needs to be updated, if so updates the cache
   */
  private static UpdateStructuresCache = FuncWrapper(
    function UpdateStructuresCache(): void {
      if (Memory.cache.structures.nextCheckTick > Game.time) return;

      Memory.cache.structures.nextCheckTick =
        Game.time + GlobalConstants.CacheNextCheckIncrement.structures;

      const cache: StringMap<StructureCache[]> = {};
      forEach(Game.rooms, (room: Room) => {
        forEach(
          room.find(FIND_STRUCTURES, {
            filter: (str: Structure) => {
              return (
                str.structureType === STRUCTURE_CONTAINER ||
                str.structureType === STRUCTURE_ROAD
              );
            },
          }),
          (str: Structure) => {
            Game.structures[str.id] = str;
          }
        );
      });

      forOwn(Game.structures, (str: Structure, id: string) => {
        let strMem = Memory.structures[id];
        if (
          StructureConstants.CachedStructureTypes.includes(str.structureType)
        ) {
          if (
            MemoryInitializationHandler.IsStructureMemoryInitialized(
              id as Id<Structure>
            ) === false
          ) {
            MemoryInitializationHandler.InitializeStructureMemory(
              id,
              str.room.name
            );
            strMem = Memory.structures[id];
          }

          if (!cache[strMem.room]) cache[strMem.room] = [];
          cache[strMem.room].push({
            id,
            structureType: str.structureType,
          });
        }
      });

      const completeCache = UpdateCacheHandler.ReturnCompleteCache(
        Memory.cache.structures.data,
        cache,
        Memory.structures
      );

      Memory.cache.structures.data = completeCache as StringMap<
        StructureCache[]
      >;

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "src/memory/updateCache:UpdateStructuresCache",
        "Updated the Structures cache"
      );
    }
  );

  /**
   * Checks if the creep cache needs to be updated, if so updates the cache
   */
  private static UpdateCreepsCache = FuncWrapper(
    function UpdateCreepsCache(): void {
      if (Memory.cache.creeps.nextCheckTick > Game.time) return;

      Memory.cache.creeps.nextCheckTick =
        Game.time + GlobalConstants.CacheNextCheckIncrement.creeps;

      const cache: StringMap<CreepCache[]> = {};
      forOwn(Game.creeps, (creep: Creep, name: string) => {
        let creepMemory = Memory.creeps[name];
        if (
          MemoryInitializationHandler.IsCreepMemoryInitialized(name) === false
        ) {
          MemoryInitializationHandler.InitializeCreepMemory(
            name,
            creep.room.name
          );
          creepMemory = Memory.creeps[name];
        }

        if (!cache[creepMemory.commandRoom])
          cache[creepMemory.commandRoom] = [];
        cache[creepMemory.commandRoom].push({ id: name });
      });

      const completeCache = UpdateCacheHandler.ReturnCompleteCache(
        Memory.cache.creeps.data,
        cache,
        Memory.creeps
      );

      Memory.cache.creeps.data = completeCache as StringMap<CreepCache[]>;

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "src/memory/updateCache:UpdateCreepsCache",
        "Updated the Creeps cache"
      );
    }
  );

  /**
   * Checks if the job cache needs to be updated, if so updates the cache
   */
  private static UpdateJobsCache = FuncWrapper(
    function UpdateJobsCache(): void {
      forOwn(Memory.rooms, (mem: RoomMemory, key: string) => {
        const room = RoomHelper.GetRoom(key);
        if (mem.isNotSeenSince === undefined && room !== null) {
          for (let i = 0; i < mem.jobs.length; i += 1) {
            const job = mem.jobs[i];
            if (job.updateJobAtTick <= Game.time) {
              let obj: Structure | ConstructionSite | Creep;
              switch (job.action) {
                case "build":
                  if (job.objId === "undefined" && job.position) {
                    const pos: RoomPosition = job.position;
                    const csSites: ConstructionSite[] = RoomHelper.Reader.GetConstructionSitesInRange(
                      pos,
                      0,
                      room
                    );
                    if (csSites.length > 0) job.objId = csSites[0].id;
                  }
                  obj = Game.getObjectById(job.objId) as ConstructionSite;
                  if (obj) {
                    job.energyRequired =
                      (obj.progressTotal - obj.progress) / BUILD_POWER;
                    job.updateJobAtTick =
                      Game.time + GlobalConstants.CacheNextCheckIncrement.jobs;
                  } else {
                    JobHandler.DeleteJob(job.id, key);
                    UpdateCacheHandler.UpdateStructuresCache();
                  }
                  break;
                default:
                  break;
              }
            }
          }
        }
      });
    }
  );

  /**
   * Updates all important cache lists
   */
  public static UpdateAll = FuncWrapper(function UpdateAll(): void {
    UpdateCacheHandler.UpdateRoomsCache();
    UpdateCacheHandler.UpdateStructuresCache();
    UpdateCacheHandler.UpdateCreepsCache();
    UpdateCacheHandler.UpdateJobsCache();
  });
}
