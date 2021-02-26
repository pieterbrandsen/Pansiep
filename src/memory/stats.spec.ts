import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { FunctionReturnCodes } from "../utils/constants/global";
import {
  CreepStatsPreProcessing,
  GetAveragedValue,
  GlobalStats,
  GlobalStatsPreProcessing,
  ResetPreProcessingRoomStats,
  ResetPreProcessingStats,
  ResetRoomStats,
  ResetStats,
  RoomStats,
  RoomStatsPreProcessing,
  StructureStatsPreProcessing,
} from "./stats";

import { SetUpdateStatsVar } from "../utils/config/global";

beforeAll(() => {
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: () => {
          return 1;
        },
      },
    },
    true
  );
});

describe("Stats", () => {
  describe("ResetPreProcessingStats method", () => {
    it("should return OK", () => {
      const resetPreProcessingStats = ResetPreProcessingStats();
      expect(global.preProcessingStats).toBeTruthy();
      expect(
        resetPreProcessingStats.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
  });
  describe("ResetStats method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", {});
      const resetStats = ResetStats();
      expect(Memory.stats).toBeTruthy();
      expect(resetStats.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
  describe("ResetPreProcessingRoomStats method", () => {
    it("should return OK", () => {
      ResetPreProcessingStats();
      const resetPreProcessingRoomStats = ResetPreProcessingRoomStats(
        "roomName"
      );
      expect(global.preProcessingStats.rooms.roomName).toBeTruthy();
      expect(
        resetPreProcessingRoomStats.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
  });
  describe("ResetRoomStats method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", {});
      ResetStats();
      const resetRoomStats = ResetRoomStats("roomName");
      expect(Memory.stats.rooms.roomName).toBeTruthy();
      expect(resetRoomStats.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
  describe("GetAveragedValue method", () => {
    it("should return OK", () => {
      let getAveragedValue = GetAveragedValue(100, 100);
      expect(getAveragedValue.code === FunctionReturnCodes.OK).toBeTruthy();

      getAveragedValue = GetAveragedValue(100, undefined);
      expect(getAveragedValue.code === FunctionReturnCodes.OK).toBeTruthy();

      getAveragedValue = GetAveragedValue(undefined, undefined);
      expect(getAveragedValue.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
  describe("RoomStatsPreProcessing method", () => {
    const room = mockInstanceOf<Room>({ name: "roomName" });
    beforeEach(() => {
      mockGlobal<Memory>("Memory", {});
      ResetStats();
      ResetPreProcessingStats();

      Game.rooms = { roomName: room };
    });
    it("should return OK", () => {
      SetUpdateStatsVar(true);
      const roomStatsPreProcessing = RoomStatsPreProcessing(room);
      expect(
        roomStatsPreProcessing.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      SetUpdateStatsVar(false);
      const roomStatsPreProcessing = RoomStatsPreProcessing(room);
      expect(
        roomStatsPreProcessing.code ===
          FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("RoomStats method", () => {
    const room = mockInstanceOf<Room>({ name: "roomName" });
    beforeEach(() => {
      mockGlobal<Memory>("Memory", {});
      ResetStats();
      ResetPreProcessingStats();

      Game.rooms = { roomName: room };
    });
    it("should return OK", () => {
      SetUpdateStatsVar(true);
      let roomStats = RoomStats(room);
      expect(roomStats.code === FunctionReturnCodes.OK).toBeTruthy();

      roomStats = RoomStats(room);
      expect(roomStats.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      SetUpdateStatsVar(false);
      const roomStats = RoomStats(room);
      expect(
        roomStats.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });

  describe("StructureStatsPreProcessing method", () => {
    const structure = mockInstanceOf<Structure>({ room: { name: "roomName" } });
    beforeEach(() => {
      mockGlobal<Memory>("Memory", {});
      ResetStats();
      ResetPreProcessingStats();

      ResetPreProcessingRoomStats("roomName");
    });
    it("should return OK", () => {
      SetUpdateStatsVar(true);
      const structureStatsPreProcessing = StructureStatsPreProcessing(
        structure
      );
      expect(
        structureStatsPreProcessing.code === FunctionReturnCodes.OK
      ).toBeTruthy();
      expect(
        global.preProcessingStats.rooms[structure.room.name].structureCount
      ).toBe(1);
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      SetUpdateStatsVar(false);
      const structureStatsPreProcessing = StructureStatsPreProcessing(
        structure
      );
      expect(
        structureStatsPreProcessing.code ===
          FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("CreepStatsPreProcessing method", () => {
    const creep = mockInstanceOf<Creep>({ room: { name: "roomName" } });
    beforeEach(() => {
      mockGlobal<Memory>("Memory", {});
      ResetStats();
      ResetPreProcessingStats();

      ResetPreProcessingRoomStats("roomName");
    });
    it("should return OK", () => {
      SetUpdateStatsVar(true);
      const creepStatsPreProcessing = CreepStatsPreProcessing(creep);
      expect(
        creepStatsPreProcessing.code === FunctionReturnCodes.OK
      ).toBeTruthy();
      expect(global.preProcessingStats.rooms[creep.room.name].creepCount).toBe(
        1
      );
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      SetUpdateStatsVar(false);
      const creepStatsPreProcessing = CreepStatsPreProcessing(creep);
      expect(
        creepStatsPreProcessing.code ===
          FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("GlobalStatsPreProcessing method", () => {
    it("should return OK", () => {
      SetUpdateStatsVar(true);
      const globalStatsPreProcessing = GlobalStatsPreProcessing();
      expect(
        globalStatsPreProcessing.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      SetUpdateStatsVar(false);
      const globalStatsPreProcessing = GlobalStatsPreProcessing();
      expect(
        globalStatsPreProcessing.code ===
          FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("GlobalStats method", () => {
    beforeEach(() => {
      mockGlobal<Memory>("Memory", {});
      ResetStats();
      ResetPreProcessingStats();
    });
    it("should return OK", () => {
      SetUpdateStatsVar(true);
      let globalStats = GlobalStats();
      expect(globalStats.code === FunctionReturnCodes.OK).toBeTruthy();

      global.preProcessingStats.funcCalls.a = { callCount: 1, cpuUsed: 1 };
      Memory.stats.funcCalls.a = { callCount: 1, cpuUsed: 1 };
      global.preProcessingStats.intentCalls.a = { callCount: 1, cpuUsed: 1 };
      Memory.stats.intentCalls.a = { callCount: 1, cpuUsed: 1 };
      globalStats = GlobalStats();

      Memory.stats.intentCalls = {};
      Memory.stats.funcCalls = {};
      globalStats = GlobalStats();

      global.preProcessingStats.intentCalls = {};
      global.preProcessingStats.funcCalls = {};
      globalStats = GlobalStats();

      expect(globalStats.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      SetUpdateStatsVar(false);
      const globalStats = GlobalStats();
      expect(
        globalStats.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
});
