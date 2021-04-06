import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { FunctionReturnCodes } from "../utils/constants/global";
import {
  AreCustomPrototypesInitialized,
  AreHeapVarsValid,
  InitializeCreepMemory,
  InitializeCustomPrototypes,
  InitializeGlobalMemory,
  InitializeHeapVars,
  InitializeRoomMemory,
  InitializeStructureMemory,
  IsCreepMemoryInitialized,
  IsGlobalMemoryInitialized,
  IsRoomMemoryInitialized,
  IsStructureMemoryInitialized,
} from "./initialization";

jest.mock("./updateCache");

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

describe("Initialize memory", () => {
  describe("AreHeapVarsValid method", () => {
    it("should return OK", () => {
      (global.preProcessingStats as unknown) = jest.fn();
      global.help = jest.fn();
      global.resetGlobalMemory = jest.fn();
      global.resetRoomMemory = jest.fn();
      global.resetStructureMemory = jest.fn();
      global.resetCreepMemory = jest.fn();
      global.deleteRoomMemory = jest.fn();
      global.deleteStructureMemory = jest.fn();
      global.deleteCreepMemory = jest.fn();

      const areHeapVarsValid = AreHeapVarsValid();
      expect(areHeapVarsValid.code).toBe(FunctionReturnCodes.OK);
    });
    it("should return NO_CONTENT", () => {
      (global.help as unknown) = undefined;
      const areHeapVarsValid = AreHeapVarsValid();
      expect(
        areHeapVarsValid.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();
    });
  });
  describe("InitializeHeapVars method", () => {
    it("should return OK", () => {
      const initializeHeapVars = InitializeHeapVars();
      expect(initializeHeapVars.code).toBe(FunctionReturnCodes.OK);
    });
  });
  describe("AreCustomPrototypesInitialized method", () => {
    it("should return OK", () => {
      Room.prototype.command = jest.fn();
      Structure.prototype.command = jest.fn();
      Creep.prototype.command = jest.fn();

      const areCustomPrototypesInitialized = AreCustomPrototypesInitialized();
      expect(
        areCustomPrototypesInitialized.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return NO_CONTENT", () => {
      (Room.prototype.command as unknown) = undefined;
      const areCustomPrototypesInitialized = AreCustomPrototypesInitialized();
      expect(
        areCustomPrototypesInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();
    });
  });
  describe("InitializeCustomPrototypes method", () => {
    it("should return OK", () => {
      const initializeCustomPrototypes = InitializeCustomPrototypes();
      expect(
        initializeCustomPrototypes.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
  });
  describe("IsGlobalMemoryInitialized method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", {});

      InitializeGlobalMemory();
      const isGlobalMemoryInitialized = IsGlobalMemoryInitialized();
      expect(
        isGlobalMemoryInitialized.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return NO_CONTENT", () => {
      (Memory.powerCreeps as unknown) = undefined;
      const isGlobalMemoryInitialized = IsGlobalMemoryInitialized();
      expect(
        isGlobalMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();
    });
  });
  describe("InitializeRoomMemory method", () => {
    beforeEach(() => {
      Memory.rooms = {};
    });
    it("should return OK", () => {
      const initializeRoomMemory = InitializeRoomMemory("roomName");
      expect(initializeRoomMemory.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.rooms.roomName).not.toBeUndefined();
    });
  });
  describe("InitializeStructureMemory method", () => {
    beforeEach(() => {
      Memory.structures = {};
    });
    it("should return OK", () => {
      const initializeStructureMemory = InitializeStructureMemory(
        "id",
        "roomName"
      );
      expect(
        initializeStructureMemory.code === FunctionReturnCodes.OK
      ).toBeTruthy();
      expect(Memory.structures.id).not.toBeUndefined();
    });
  });
  describe("InitializeCreepMemory method", () => {
    beforeEach(() => {
      Memory.creeps = {};
    });
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn().mockReturnValue(0),
      });
      Game.creeps = { id: creep };
      const initializeCreepMemory = InitializeCreepMemory("id", "roomName");
      expect(
        initializeCreepMemory.code === FunctionReturnCodes.OK
      ).toBeTruthy();
      expect(Memory.creeps.id).not.toBeUndefined();
    });
  });
  describe("IsRoomMemoryInitialized method", () => {
    beforeEach(() => {
      InitializeGlobalMemory();
    });
    it("should return OK", () => {
      InitializeRoomMemory("id");
      Memory.cache.rooms.data.push("id");
      const isRoomMemoryInitialized = IsRoomMemoryInitialized("id");
      expect(
        isRoomMemoryInitialized.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return NO_CONTENT", () => {
      const isRoomMemoryInitialized = IsRoomMemoryInitialized("id");
      expect(
        isRoomMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();
    });
  });
  describe("IsStructureMemoryInitialized method", () => {
    beforeEach(() => {
      InitializeGlobalMemory();
    });
    it("should return OK", () => {
      InitializeStructureMemory("id", "roomName");
      Memory.cache.structures.data.roomName = [
        { id: "id", structureType: STRUCTURE_CONTROLLER },
      ];
      const isStructureMemoryInitialized = IsStructureMemoryInitialized(
        "id" as Id<Structure>
      );
      expect(
        isStructureMemoryInitialized.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return NO_CONTENT", () => {
      let isStructureMemoryInitialized = IsStructureMemoryInitialized(
        "id" as Id<Structure>
      );
      expect(
        isStructureMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();

      InitializeStructureMemory("id", "roomName");
      (Memory.structures.id.room as unknown) = undefined;
      isStructureMemoryInitialized = IsStructureMemoryInitialized(
        "id" as Id<Structure>
      );
      expect(
        isStructureMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();
    });
  });
  describe("IsCreepMemoryInitialized method", () => {
    beforeEach(() => {
      InitializeGlobalMemory();
    });
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn().mockReturnValue(0),
      });
      Game.creeps = { id: creep };
      InitializeCreepMemory("id", "roomName");
      Memory.cache.creeps.data.roomName = [{ id: "id" }];
      const isCreepMemoryInitialized = IsCreepMemoryInitialized("id");
      expect(
        isCreepMemoryInitialized.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return NO_CONTENT", () => {
      let isCreepMemoryInitialized = IsCreepMemoryInitialized("id");
      expect(
        isCreepMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();

      InitializeCreepMemory("id", "roomName");
      (Memory.creeps.id.commandRoom as unknown) = undefined;
      isCreepMemoryInitialized = IsCreepMemoryInitialized("id");
      expect(
        isCreepMemoryInitialized.code === FunctionReturnCodes.NO_CONTENT
      ).toBeTruthy();
    });
  });
});
