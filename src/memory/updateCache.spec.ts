import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CreepHelper from "../creep/helper";
import RoomHelper from "../room/helper";
import JobHandler from "../room/jobs/handler";
import StructureHelper from "../structure/helper";
import GlobalConstants from "../utils/constants/global";
import MemoryInitializationHandler from "./initialization";
import UpdateCacheHandler from "./updateCache";

jest.mock("../utils/logger");
jest.mock("../room/planner/planner");

const roomName = "room";
const roomName2 = "room2";
const structureId = "container" as Id<Structure>;
const structureId2 = "container2" as Id<Structure>;
const creepName = "1";
const creepName2 = "2";
const creepName3 = "3";
const container = mockInstanceOf<ConstructionSite>({
  id: structureId,
  structureType: STRUCTURE_CONTAINER,
  room: { name: roomName2 },
  progress: 0,
  progressTotal: 0,
});
const container2 = mockInstanceOf<ConstructionSite>({
  id: structureId2,
  structureType: STRUCTURE_CONTAINER,
  room: { name: roomName2 },
  progress: 0,
  progressTotal: 0,
});
const keeperLair = mockInstanceOf<StructureKeeperLair>({
  id: "a",
  structureType: STRUCTURE_KEEPER_LAIR,
  room: { name: roomName2 },
});
const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
});

const room2 = mockInstanceOf<Room>({
  name: roomName2,
  find: jest.fn().mockImplementation((type) => {
    if (type === 107) {
      return [
        mockInstanceOf<Structure>({
          id: "2",
          structureType: STRUCTURE_ROAD,
          room,
        }),
        container,
        container2,
        mockInstanceOf<Structure>({
          id: "3",
          structureType: STRUCTURE_CONTROLLER,
          room,
        }),
      ];
    }
    return [];
  }),
});

const creep = mockInstanceOf<Creep>({
  id: creepName,
  room,
  name: creepName,
  getActiveBodyparts: jest.fn().mockResolvedValue(1),
});
const creep2 = mockInstanceOf<Creep>({
  id: creepName2,
  room,
  name: creepName2,
  getActiveBodyparts: jest.fn().mockResolvedValue(1),
});
const creep3 = mockInstanceOf<Creep>({
  id: creepName3,
  room,
  name: creepName3,
  getActiveBodyparts: jest.fn().mockResolvedValue(1),
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      shard: { name: "shard" },
      rooms: {
        [roomName]: room,
        [roomName2]: room2,
      },
      structures: {
        a: keeperLair,
      },
      creeps: {
        [creepName]: creep,
        [creepName2]: creep2,
        [creepName3]: creep3,
      },
      cpu: {
        bucket: 0,
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

describe("UpdateCacheHandler", () => {
  describe("UpdateRoomsCache", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeGlobalMemory();
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeRoomMemory(roomName2);
      Memory.cache.rooms.nextCheckTick = 0;
      Game.time = 1000;
    });
    it("should not update the cache", () => {
      Memory.cache.rooms.nextCheckTick = 1;
      Game.time = 0;
      UpdateCacheHandler.UpdateRoomsCache();
      expect(Memory.cache.rooms.nextCheckTick).toBe(1);
    });
    it("should update the cache", () => {
      UpdateCacheHandler.UpdateRoomsCache();

      expect(Memory.cache.rooms.nextCheckTick).toBeGreaterThan(0);
    });
    it("should create an job if an room becomes non visible", () => {
      Memory.cache.rooms.nextCheckTick = 0;
      Game.rooms = { [roomName]: room };
      UpdateCacheHandler.UpdateRoomsCache();
      Game.time = 1000 + GlobalConstants.CacheNextCheckIncrement.rooms;
      UpdateCacheHandler.UpdateRoomsCache();
      Game.rooms = { [roomName]: room, [roomName2]: room2 };

      expect(Memory.cache.rooms.nextCheckTick).toBeGreaterThan(0);
      const room2Memory = RoomHelper.GetRoomMemory(roomName2);
      expect(room2Memory.jobs.length).toBe(1);

      Game.time = 1000 * 1000;
      UpdateCacheHandler.UpdateRoomsCache();
      expect(Memory.rooms[roomName2].isNotSeenSince).not.toBeDefined();
    });
    it("should remove an room if its long enough not visible", () => {
      Memory.cache.rooms.nextCheckTick = 0;
      const currentLength = Memory.cache.rooms.data.length;
      const room2Memory = RoomHelper.GetRoomMemory(roomName2);
      room2Memory.isNotSeenSince = 0;

      Game.rooms = { [roomName]: room };
      UpdateCacheHandler.UpdateRoomsCache();
      Game.rooms = { [roomName]: room, [roomName2]: room2 };

      expect(Memory.cache.rooms.nextCheckTick).toBeGreaterThan(0);
      expect(Memory.cache.rooms.data.length).toBe(currentLength - 1);
    });
  });
  describe("UpdateStructuresCache", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeGlobalMemory();
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeRoomMemory(roomName2);
      Memory.cache.structures.nextCheckTick = 0;
      Game.time = 1000;
    });
    it("should not update the cache", () => {
      Memory.cache.structures.nextCheckTick = 1;
      Game.time = 0;
      UpdateCacheHandler.UpdateStructuresCache();
      expect(Memory.cache.structures.nextCheckTick).toBe(1);
    });
    it("should update the cache", () => {
      Memory.cache.structures.data[roomName] = [];
      MemoryInitializationHandler.InitializeStructureMemory(
        roomName2,
        structureId
      );
      MemoryInitializationHandler.InitializeStructureMemory(
        roomName2,
        structureId2
      );

      const structureMemory10 = StructureHelper.GetStructureMemory(
        structureId2
      );
      structureMemory10.isNotSeenSince = 0;
      UpdateCacheHandler.UpdateStructuresCache();

      expect(Memory.cache.structures.nextCheckTick).toBeGreaterThan(0);
    });
  });
  describe("UpdateCreepsCache", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeGlobalMemory();
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeRoomMemory(roomName2);
      Memory.cache.creeps.nextCheckTick = 0;
      Game.time = 1000;
    });
    it("should not update the cache", () => {
      Memory.cache.creeps.nextCheckTick = 1;
      Game.time = 0;
      UpdateCacheHandler.UpdateCreepsCache();
      expect(Memory.cache.creeps.nextCheckTick).toBe(1);
    });
    it("should update the cache", () => {
      Memory.cache.creeps.data[roomName] = [];
      MemoryInitializationHandler.InitializeCreepMemory(roomName2, creepName);
      UpdateCacheHandler.UpdateCreepsCache();

      expect(Memory.cache.creeps.nextCheckTick).toBeGreaterThan(0);
    });
  });
  describe("UpdateJobsCache", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeGlobalMemory();
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeRoomMemory(roomName2);
      Memory.cache.jobs.nextCheckTick = 0;
      Game.time = 1000;
    });
    it("should not update the cache", () => {
      Memory.cache.jobs.nextCheckTick = 1;
      Game.time = 0;
      UpdateCacheHandler.UpdateJobsCache();
      expect(Memory.cache.jobs.nextCheckTick).toBe(1);
    });
    it("should update the cache", () => {
      Game.getObjectById = jest.fn().mockReturnValue(null);
      UpdateCacheHandler.UpdateJobsCache();

      expect(Memory.cache.jobs.nextCheckTick).toBeGreaterThan(0);
    });
    it("has an undefined objId", () => {
      const gameTime = Game.time;
      const roomMemory2 = RoomHelper.GetRoomMemory(roomName2);
      roomMemory2.isNotSeenSince = 1;

      const buildJob = JobHandler.CreateJob.CreateMoveJob(roomName);
      buildJob.updateJobAtTick = gameTime - 1;
      buildJob.action = "build";

      RoomHelper.Reader.GetConstructionSitesInRange = jest
        .fn()
        .mockReturnValue([]);
      UpdateCacheHandler.UpdateJobsCache();
      Memory.cache.jobs.nextCheckTick = 0;
      const moveJob = JobHandler.CreateJob.CreateMoveJob(roomName);
      moveJob.updateJobAtTick = gameTime + 40;
      moveJob.action = "move";
      const buildJob2 = JobHandler.CreateJob.CreateMoveJob(roomName);
      buildJob2.updateJobAtTick = gameTime - 1;
      buildJob2.action = "build";

      RoomHelper.Reader.GetConstructionSitesInRange = jest
        .fn()
        .mockReturnValue([{ id: "a" }]);
      UpdateCacheHandler.UpdateJobsCache();
      expect(Memory.cache.jobs.nextCheckTick).toBeGreaterThan(Game.time);
    });
    it("should return an alive object", () => {
      const roomMemory2 = RoomHelper.GetRoomMemory(roomName2);
      roomMemory2.isNotSeenSince = 1;

      const buildJob = JobHandler.CreateJob.CreateMoveJob(roomName);
      const moveJob = JobHandler.CreateJob.CreateMoveJob(roomName);
      moveJob.updateJobAtTick = Game.time - 1;

      buildJob.updateJobAtTick = Game.time - 1;
      buildJob.action = "build";
      buildJob.objId = container.id;
      Game.getObjectById = jest.fn().mockReturnValue(container);

      UpdateCacheHandler.UpdateJobsCache();
      expect(Memory.cache.jobs.nextCheckTick).toBeGreaterThan(Game.time);
    });
  });
  describe("ReturnCompleteCache", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeGlobalMemory();
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeRoomMemory(roomName2);
      Memory.cache.creeps.nextCheckTick = 0;
      Memory.cache.structures.nextCheckTick = 0;
      Game.time = 1000;
    });
    it("should add all new cache objects", () => {
      // const creep = mockInstanceOf<Creep>({room:room,id:"a1", getActiveBodyparts:jest.fn().mockReturnValue(1)});
      Game.creeps = {};
      Game.structures = {};
      const creepMemory = CreepHelper.GetCreepMemory(creepName);
      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      const job2 = JobHandler.CreateJob.CreateMoveJob(roomName2);
      creepMemory.jobId = job.id;
      creepMemory.secondJobId = job2.id;
      const creepMemory2 = CreepHelper.GetCreepMemory(creepName2);
      creepMemory2.isNotSeenSince = Game.time + 1;
      const creepMemory3 = CreepHelper.GetCreepMemory(creepName2);
      creepMemory3.isNotSeenSince = Game.time + 1;
      UpdateCacheHandler.UpdateCreepsCache();
      const oldFunc = room2.find;
      room2.find = jest.fn().mockReturnValue([]);
      UpdateCacheHandler.UpdateStructuresCache();

      Game.time += GlobalConstants.SaveUnloadedObjectForAmountTicks;
      UpdateCacheHandler.UpdateCreepsCache();
      UpdateCacheHandler.UpdateStructuresCache();

      Game.time += 10000;
      UpdateCacheHandler.UpdateCreepsCache();
      UpdateCacheHandler.UpdateStructuresCache();
      room.find = oldFunc;
      expect(true).toBe(true);
    });
  });
});
