import { mockGlobal, mockInstanceOf } from "screeps-jest";
import {
  ReturnCompleteCache,
  Update,
  UpdateCreepsCache,
  UpdateRoomsCache,
  UpdateStructuresCache,
} from "./updateCache";
import { FunctionReturnCodes } from "../utils/constants/global";

jest.mock("./garbageCollection");

beforeAll(() => {
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: () => {
          return 1;
        },
      },
      time: 1001,
      rooms: {},
      structures: {},
      creeps: {},
    },
    true
  );
  mockGlobal<Memory>(
    "Memory",
    {
      creeps: {},
      structures: {},
      rooms: {},
      cache: {
        rooms: { data: [] },
        creeps: { data: {} },
        structures: { data: {} },
      },
    },
    true
  );
});

describe("Update cache", () => {
  describe("ReturnCompleteCache method", () => {
    it("should return OK and an object", () => {
      const creepCurrentCache = {
        roomName: [
          { id: "id1", creepType: "None" },
          { id: "id2", creepType: "None" },
        ],
        roomName2: [{ id: "id", creepType: "None" }],
      };
      const creepNewCache = {
        roomName2: [{ id: "id", creepType: "None" }],
      };
      const creepRoomObject = {
        id: { commandRoom: "roomName2", isNotSeenSince: 600 },
        id1: { commandRoom: "roomName", isNotSeenSince: 200 },
        id2: { commandRoom: "roomName", isNotSeenSince: 600 },
      };
      Memory.creeps.id1 = { commandRoom: "roomName" };

      let returnCompleteCache = ReturnCompleteCache(
        creepCurrentCache,
        creepNewCache,
        creepRoomObject
      );
      expect(returnCompleteCache.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(typeof returnCompleteCache.response).toBe("object");

      // Structure
      const structureCurrentCache = {
        roomName: [
          { id: "id", structureType: STRUCTURE_LAB },
          { id: "id1", structureType: STRUCTURE_LAB },
          { id: "id2", structureType: STRUCTURE_LAB },
        ],
      };
      const structureNewCache = {
        roomName: [
          { id: "id", structureType: STRUCTURE_LAB },
          { id: "id3", structureType: STRUCTURE_LAB },
        ],
      };
      const structureRoomObject = {
        id: { room: "roomName" },
        id1: { room: "roomName" },
        id2: { room: "roomName", isNotSeenSince: 400 },
        id3: { room: "roomName", isNotSeenSince: 600 },
      };

      returnCompleteCache = ReturnCompleteCache(
        structureCurrentCache,
        structureNewCache,
        structureRoomObject
      );
      expect(returnCompleteCache.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(typeof returnCompleteCache.response).toBe("object");
    });
  });
  describe("UpdateRoomsCache method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({});
      const room3 = mockInstanceOf<Room>({});
      const room5 = mockInstanceOf<Room>({});
      Game.rooms = { room, room3,room5 };
      Memory.cache.rooms.nextCheckTick = 0;
      Memory.cache.rooms.data = ["room", "room2", "room3", "room4","room5","room6"];
      Memory.rooms.room = { isNotSeenSince: 600 };
      Memory.rooms.room2 = { isNotSeenSince: -500 };
      Memory.rooms.room4 = {};
      Memory.rooms.room5 = {};
      Memory.rooms.room6 = {isNotSeenSince: 900};

      const updateRoomsCache = UpdateRoomsCache();
      expect(updateRoomsCache.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      Memory.cache.rooms.nextCheckTick = 1500;
      const updateRoomsCache = UpdateRoomsCache();
      expect(
        updateRoomsCache.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("UpdateStructuresCache method", () => {
    it("should return OK", () => {
      const structure = mockInstanceOf<Structure>({
        structureType: STRUCTURE_LAB,
        room: { name: "room" },
      });
      const structure2 = mockInstanceOf<Structure>({
        structureType: STRUCTURE_LAB,
        room: { name: "room" },
      });
      const structure3 = mockInstanceOf<Structure>({
        structureType: STRUCTURE_LAB,
        room: { name: "room2" },
      });
      const structure4 = mockInstanceOf<Structure>({
        structureType: STRUCTURE_CONTAINER,
        room: { name: "room2" },
      });
      Game.structures = { structure, structure2, structure3,structure4 };
      Memory.structures.structure = { room: "room" };
      Memory.structures.structure2 = { room: "room" };
      Memory.cache.structures.data = {
        room: [
          { id: "structure", structureType: STRUCTURE_LAB },
          { id: "structure2", structureType: STRUCTURE_LAB },
        ],
        room2: [{ id: "structure3", structureType: STRUCTURE_LAB }],
      };

      Memory.cache.structures.nextCheckTick = 10;
      const updateStructuresCache = UpdateStructuresCache();
      expect(
        updateStructuresCache.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      Memory.cache.structures.nextCheckTick = 1500;
      const updateStructuresCache = UpdateStructuresCache();
      expect(
        updateStructuresCache.code ===
          FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("UpdateCreepsCache method", () => {
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({ room: { name: "room" } });
      const creep2 = mockInstanceOf<Creep>({ room: { name: "room" } });
      const creep3 = mockInstanceOf<Creep>({ room: { name: "room2" } });
      Game.creeps = { creep, creep2, creep3 };
      Memory.creeps.creep = { commandRoom: "room" };
      Memory.creeps.creep3 = { commandRoom: "room2" };
      Memory.cache.creeps.data = {
        room: [
          { id: "id", creepType: "None" },
          { id: "id2", creepType: "None" },
        ],
        room2: [{ id: "id3", creepType: "None" }],
      };

      Memory.cache.creeps.nextCheckTick = 10;
      const updateCreepsCache = UpdateCreepsCache();
      expect(updateCreepsCache.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      Memory.cache.creeps.nextCheckTick = 1500;
      const updateCreepsCache = UpdateCreepsCache();
      expect(
        updateCreepsCache.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("Update method", () => {
    it("should return OK", () => {
      const update = Update();
      expect(update.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
});
