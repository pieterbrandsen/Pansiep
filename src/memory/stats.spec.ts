import { forEach } from "lodash";
import { mockGlobal, mockInstanceOf } from "screeps-jest";
import JobHandler from "../room/jobs/handler";
import GlobalConfig from "../utils/config/global";
import GlobalConstants from "../utils/constants/global";
import MemoryInitializationHandler from "./initialization";
import StatsHandler from "./stats";

jest.mock("../utils/logger");
jest.mock("../room/planner/planner");

const roomName = "room";
const roomName2 = "room2";
const controller = mockInstanceOf<StructureController>({
  progress: 0,
  progressTotal: 0,
  level: 0,
  my: true,
  structureType: "controller",
  room: { name: roomName },
  pos: new RoomPosition(1, 1, roomName),
});
const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  lookForAtArea: jest.fn().mockReturnValue([]),
  controller,
});
const room2 = mockInstanceOf<Room>({
  name: roomName2,
  find: jest.fn().mockReturnValue([]),
  lookForAtArea: jest.fn().mockReturnValue([]),
  controller: undefined,
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
      structures: {},
      creeps: {},
      cpu: {
        bucket: 0,
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
  MemoryInitializationHandler.InitializeGlobalMemory();
  MemoryInitializationHandler.InitializeRoomMemory(roomName);
});

describe("StatsHandler", () => {
  it("should reset pre processing stats", () => {
    StatsHandler.ResetPreProcessingStats();
    expect(global.preProcessingStats).toBeDefined();
  });
  it("should reset global stats", () => {
    StatsHandler.ResetStats();
    expect(Memory.stats).toBeDefined();
  });
  it("should reset room pre processing stats", () => {
    StatsHandler.ResetPreProcessingStats();
    StatsHandler.ResetPreProcessingRoomStats(roomName);
    expect(global.preProcessingStats.rooms[roomName]).toBeDefined();
  });
  it("should reset room stats", () => {
    StatsHandler.ResetStats();
    StatsHandler.ResetRoomStats(roomName);
    expect(Memory.stats.rooms[roomName]).toBeDefined();
  });
  it("should return an averaged value", () => {
    const value = StatsHandler.GetAveragedValue(
      0,
      GlobalConstants.AverageValueOverAmountTicks
    );
    expect(value).toBe(1);
  });
  it("should reset all stats for room before setting them again", () => {
    StatsHandler.ResetStats();
    StatsHandler.ResetRoomStats(roomName);
    StatsHandler.ResetPreProcessingRoomStats(roomName);
    global.preProcessingStats.rooms[roomName].creepCount = 1;
    expect(global.preProcessingStats.rooms[roomName].creepCount).toBe(1);

    StatsHandler.RoomStatsPreProcessing(roomName);
    expect(global.preProcessingStats.rooms[roomName].creepCount).toBe(0);
  });
  describe("RoomStats", () => {
    it("should do nothing because updating stats is not allowed", () => {
      GlobalConfig.UpdateStats = false;
      Memory.rooms[roomName].isNotSeenSince = 1;
      StatsHandler.RoomStats(room);
      expect(Memory.rooms[roomName].isNotSeenSince).toBe(1);
    });
    it("should update room stats", () => {
      GlobalConfig.UpdateStats = true;

      StatsHandler.ResetStats();
      StatsHandler.ResetRoomStats(roomName);
      StatsHandler.ResetRoomStats(roomName2);
      StatsHandler.ResetPreProcessingRoomStats(roomName);
      StatsHandler.ResetPreProcessingRoomStats(roomName2);
      global.preProcessingStats.rooms[roomName].creepCount = 1;

      Memory.stats.rooms[roomName].activeJobs.job = 1;
      Memory.stats.rooms[roomName].creepCountPerJob.job = 1;
      // Memory.stats.rooms[roomName].activeJobs.move2 = 1;
      JobHandler.CreateJob.CreateMoveJob(roomName);

      Memory.stats.rooms[roomName].energyExpenses.spawn.a = 1;
      global.preProcessingStats.rooms[roomName].energyExpenses.spawn.b = 1;

      StatsHandler.RoomStats(room);
      StatsHandler.RoomStats(room2);

      expect(Memory.stats.rooms[roomName].creepCount).toBeLessThan(1);
    });
    it("should assign 0 when values are not accessible", () => {
      StatsHandler.ResetStats();
      StatsHandler.ResetRoomStats(roomName2);
      StatsHandler.ResetPreProcessingRoomStats(roomName2);
      global.preProcessingStats.rooms[roomName2].creepCount = 1;

      StatsHandler.RoomStatsPreProcessing(roomName2);
      expect(
        global.preProcessingStats.rooms[roomName2].creepCount
      ).toBeLessThan(1);
    });
  });
  describe("StructureStatsPreProcessing", () => {
    beforeEach(() => {
      StatsHandler.ResetStats();
      StatsHandler.ResetRoomStats(roomName);
      StatsHandler.ResetPreProcessingRoomStats(roomName);
    });
    it("should do nothing because updating stats is not allowed", () => {
      GlobalConfig.UpdateStats = false;
      global.preProcessingStats.rooms[roomName].structureCount = 1;
      StatsHandler.StructureStatsPreProcessing(controller);
      expect(global.preProcessingStats.rooms[roomName].structureCount).toBe(1);
    });
    it("should update structure stats", () => {
      GlobalConfig.UpdateStats = true;
      global.preProcessingStats.rooms[roomName].structureCount = 1;
      StatsHandler.StructureStatsPreProcessing(controller);
      expect(global.preProcessingStats.rooms[roomName].structureCount).toBe(2);
    });
    it("should hit all switches for structureType", () => {
      GlobalConfig.UpdateStats = true;
      const structureTypes: StructureConstant[] = [
        "storage",
        "terminal",
        "container",
        "link",
      ];
      forEach(structureTypes, (structureType) => {
        StatsHandler.StructureStatsPreProcessing(
          mockInstanceOf<Structure>({
            structureType,
            store: { energy: 100 },
            room,
          })
        );
      });

      expect(
        global.preProcessingStats.rooms[roomName].energyInStorages.storage
      ).toBe(100);
      expect(
        global.preProcessingStats.rooms[roomName].energyInStorages.terminal
      ).toBe(100);
      expect(
        global.preProcessingStats.rooms[roomName].energyInStorages.containers
      ).toBe(100);
    });
  });
  describe("CreepStatsPreProcessing", () => {
    beforeEach(() => {
      StatsHandler.ResetStats();
      StatsHandler.ResetRoomStats(roomName);
      StatsHandler.ResetPreProcessingRoomStats(roomName);
    });
    it("should do nothing because updating stats is not allowed", () => {
      GlobalConfig.UpdateStats = false;
      global.preProcessingStats.rooms[roomName].creepCount = 1;
      StatsHandler.CreepStatsPreProcessing(roomName);
      expect(global.preProcessingStats.rooms[roomName].creepCount).toBe(1);
    });
    it("should execute pre processing stats", () => {
      GlobalConfig.UpdateStats = true;
      StatsHandler.CreepStatsPreProcessing(roomName);
      expect(global.preProcessingStats.rooms[roomName].creepCount).toBe(1);
    });
  });
  describe("GlobalStatsPreProcessing", () => {
    beforeEach(() => {
      StatsHandler.ResetStats();
    });
    it("should do nothing because updating stats is not allowed", () => {
      GlobalConfig.UpdateStats = false;
      global.preProcessingStats.ticksStatsCollecting = 1;
      StatsHandler.GlobalStatsPreProcessing();
      expect(global.preProcessingStats.ticksStatsCollecting).toBe(1);
    });
    it("should execute pre processing stats", () => {
      GlobalConfig.UpdateStats = true;
      global.preProcessingStats.ticksStatsCollecting = 1;
      StatsHandler.GlobalStatsPreProcessing();
      expect(global.preProcessingStats.ticksStatsCollecting).toBe(0);
    });
  });
  describe("GlobalStats", () => {
    it("should do nothing because updating stats is not allowed", () => {
      GlobalConfig.UpdateStats = false;
      Memory.stats.ticksStatsCollecting = 1;

      Memory.stats.funcCalls.a = { callCount: 1, cpuUsed: 1 };
      Memory.stats.intentCalls.a = { callCount: 1, cpuUsed: 1 };
      global.preProcessingStats.funcCalls.b = { callCount: 1, cpuUsed: 1 };
      global.preProcessingStats.intentCalls.b = { callCount: 1, cpuUsed: 1 };

      StatsHandler.GlobalStats();
      expect(Memory.stats.ticksStatsCollecting).toBe(1);
    });
    it("should execute pre processing stats", () => {
      GlobalConfig.UpdateStats = true;
      Memory.stats.ticksStatsCollecting = 1;
      StatsHandler.GlobalStats();
      expect(Memory.stats.ticksStatsCollecting).toBe(2);
    });
  });
});
