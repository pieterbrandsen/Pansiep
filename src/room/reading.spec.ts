import { mockInstanceOf, mockGlobal } from "screeps-jest";
import { first } from "lodash";
import {
  GetStructuresInRange,
  GetTerrain,
  GetTerrainInRange,
  GetStructures,
  GetDangerousStructures,
  FindExits,
  GetAccessibleSurroundingRoomNames,
  GetSources,
  HasPositionEnergyStructures,
  IsPositionDefended,
  GetMineral,
  HasMineralStructure,
} from "./reading";
import { FunctionReturnCodes } from "../utils/constants/global";

JSON.stringify = jest.fn(() => {
  return "stringify";
});

jest.mock("./visuals");

describe("Room readings", () => {
  beforeEach(() => {
    mockGlobal<Game>(
      "Game",
      {
        cpu: {
          getUsed: () => {
            return 1;
          },
        },
        getObjectById: jest.fn().mockReturnValue({}),
        structures: {},
        map: { describeExits: jest.fn().mockReturnValue(["room2", "room3"]) },
      },
      true
    );
  });
  describe("GetTerrain method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({
        getTerrain: jest.fn().mockReturnValue({}),
        name: "room",
      });
      const getTerrain = GetTerrain(room);
      expect(getTerrain.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrain.response).toBeDefined();
    });
  });
  describe("GetStructuresInRange method", () => {
    it("should return OK", () => {
      const controller = mockInstanceOf<Structure>({
        pos: new RoomPosition(24, 25, "room"),
        structureType: STRUCTURE_CONTROLLER,
      });
      const lab = mockInstanceOf<Structure>({
        pos: new RoomPosition(23, 25, "room"),
        structureType: STRUCTURE_LAB,
      });
      const room = mockInstanceOf<Room>({
        lookForAtArea: jest
          .fn()
          .mockReturnValueOnce([])
          .mockReturnValueOnce([{ structure: controller }])
          .mockReturnValueOnce([{ structure: lab }, { structure: controller }])
          .mockReturnValue([{ structure: controller }, { structure: lab }]),
        name: "room",
      });

      let getStructuresInRange = GetStructuresInRange(
        new RoomPosition(25, 25, room.name),
        0,
        room
      );
      expect(getStructuresInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getStructuresInRange.response).toHaveLength(0);

      getStructuresInRange = GetStructuresInRange(
        new RoomPosition(25, 25, room.name),
        1,
        room
      );
      expect(getStructuresInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getStructuresInRange.response).toHaveLength(1);
      expect(
        (first(getStructuresInRange.response) as Structure).structureType
      ).toBe(STRUCTURE_CONTROLLER);

      getStructuresInRange = GetStructuresInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room,
        [STRUCTURE_LAB]
      );
      expect(getStructuresInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getStructuresInRange.response).toHaveLength(1);
      expect(
        (first(getStructuresInRange.response) as Structure).structureType
      ).toBe(STRUCTURE_LAB);

      getStructuresInRange = GetStructuresInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room,
        [STRUCTURE_CONTROLLER]
      );
      expect(getStructuresInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getStructuresInRange.response).toHaveLength(1);
      expect(
        (first(getStructuresInRange.response) as Structure).structureType
      ).toBe(STRUCTURE_CONTROLLER);

      getStructuresInRange = GetStructuresInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room
      );
      expect(getStructuresInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getStructuresInRange.response).toHaveLength(2);

      getStructuresInRange = GetStructuresInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room,
        [STRUCTURE_CONTROLLER, STRUCTURE_LAB]
      );
      expect(getStructuresInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getStructuresInRange.response).toHaveLength(2);
    });
  });
  describe("GetTerrainInRange method", () => {
    it("should return OK", () => {
      const plain = mockInstanceOf({ x: 24, y: 25, terrain: "plain" });
      const swamp = mockInstanceOf({ x: 24, y: 25, terrain: "swamp" });
      const wall = mockInstanceOf({ x: 23, y: 25, terrain: "wall" });
      const room = mockInstanceOf<Room>({
        lookForAtArea: jest
          .fn()
          .mockReturnValueOnce([])
          .mockReturnValueOnce([plain])
          .mockReturnValueOnce([wall, plain])
          .mockReturnValue([plain, swamp, wall]),
        name: "room",
      });

      let getTerrainInRange = GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        0,
        room
      );
      expect(getTerrainInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrainInRange.response).toHaveLength(0);

      getTerrainInRange = GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        1,
        room
      );
      expect(getTerrainInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrainInRange.response).toHaveLength(1);

      getTerrainInRange = GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room,
        ["wall"]
      );
      expect(getTerrainInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrainInRange.response).toHaveLength(1);

      getTerrainInRange = GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room,
        ["plain"]
      );
      expect(getTerrainInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrainInRange.response).toHaveLength(1);

      getTerrainInRange = GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room
      );
      expect(getTerrainInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrainInRange.response).toHaveLength(3);

      getTerrainInRange = GetTerrainInRange(
        new RoomPosition(25, 25, room.name),
        2,
        room,
        ["plain", "swamp", "wall"]
      );
      expect(getTerrainInRange.code).toBe(FunctionReturnCodes.OK);
      expect(getTerrainInRange.response).toHaveLength(3);
    });
  });
  describe("GetStructures method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({
        name: "room",
      });
      mockGlobal<Memory>("Memory", {
        cache: {
          structures: {
            data: {
              room: [
                { structureType: STRUCTURE_LINK, id: "id" },
                { structureType: STRUCTURE_LINK, id: "id2" },
              ],
            },
          },
        },
      });
      const getStructures = GetStructures(room.name);
      expect(getStructures.code).toBe(FunctionReturnCodes.OK);
      expect(getStructures.response).toHaveLength(2);
    });
  });
  describe("GetDangerousStructures method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", {
        cache: {
          structures: {
            data: {
              enemyRoom: [
                { structureType: STRUCTURE_LINK, id: "id" },
                { structureType: STRUCTURE_TOWER, id: "id2" },
              ],
            },
          },
        },
      });

      const getDangerousStructures = GetDangerousStructures("enemyRoom");
      expect(getDangerousStructures.code).toBe(FunctionReturnCodes.OK);
    });
  });
  describe("FindExits method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest
          .fn()
          .mockReturnValue([
            new RoomPosition(25, 25, "room"),
            new RoomPosition(25, 24, "room"),
          ]),
      });
      const findExits = FindExits(room);
      expect(findExits.code).toBe(FunctionReturnCodes.OK);
      expect(findExits.response).toHaveLength(2);
    });
  });
  describe("GetAccessibleSurroundingRoomNames method", () => {
    it("should return OK", () => {
      const getAccessibleSurroundingRoomNames = GetAccessibleSurroundingRoomNames(
        "room"
      );
      expect(getAccessibleSurroundingRoomNames.code).toBe(
        FunctionReturnCodes.OK
      );
      expect(getAccessibleSurroundingRoomNames.response).toHaveLength(2);
    });
  });
  describe("IsPositionDefended method", () => {
    it("should return OK and true", () => {
      const structure = mockInstanceOf<Structure>({
        structureType: STRUCTURE_TOWER,
        pos: new RoomPosition(25, 25, "room"),
      });
      structure.pos.getRangeTo = jest.fn().mockReturnValue(0);
      const room = mockInstanceOf<Room>({
        name: "room",
        lookForAtArea: jest.fn((lookType: string) => {
          if (lookType === LOOK_STRUCTURES) {
            return [{ structure }];
          }
          return [{ x: 24, y: 25, terrain: "plain" }];
        }),
      });

      const isPositionDefended = IsPositionDefended(
        new RoomPosition(25, 25, room.name),
        room
      );
      expect(isPositionDefended.code).toBe(FunctionReturnCodes.OK);
      expect(isPositionDefended.response).toBeTruthy();
    });
    it("should return OK and false", () => {
      const structure = mockInstanceOf<Structure>({
        structureType: STRUCTURE_TOWER,
        pos: new RoomPosition(24, 25, "room"),
      });
      structure.pos.getRangeTo = jest.fn().mockReturnValue(1);
      const room = mockInstanceOf<Room>({
        name: "room",
        lookForAtArea: jest.fn((lookType: string) => {
          if (lookType === LOOK_STRUCTURES) {
            return [{ structure }];
          }
          return [{ x: 24, y: 25, terrain: "plain" }];
        }),
      });
      const isPositionDefended = IsPositionDefended(
        new RoomPosition(25, 25, room.name),
        room
      );
      expect(isPositionDefended.code).toBe(FunctionReturnCodes.OK);
      expect(isPositionDefended.response).not.toBeTruthy();
    });
  });
  describe("GetMineral method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest.fn().mockReturnValue([{}]),
      });
      const getMineral = GetMineral(room);
      expect(getMineral.code).toBe(FunctionReturnCodes.OK);
      expect(getMineral.response).toBeDefined();
    });
    it("should return NO_CONTENT", () => {
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest.fn().mockReturnValue([]),
      });
      const getMineral = GetMineral(room);
      expect(getMineral.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });
  });
  describe("HasMineralStructure method", () => {
    it("should return OK", () => {
      const mineral = mockInstanceOf<Mineral>({
        pos: new RoomPosition(25, 25, "room"),
      });
      const extractor = mockInstanceOf<Structure>({
        structureType: STRUCTURE_EXTRACTOR,
      });
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest.fn().mockReturnValue([mineral]),
        lookForAtArea: jest.fn().mockReturnValue([{ structure: extractor }]),
      });

      const hasMineralStructure = HasMineralStructure(room);
      expect(hasMineralStructure.code).toBe(FunctionReturnCodes.OK);
      expect(hasMineralStructure.response).toBe(extractor);
    });
    it("should return NOT_FOUND", () => {
      const mineral = mockInstanceOf<Mineral>({
        pos: new RoomPosition(25, 25, "room"),
      });
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest.fn().mockReturnValue([mineral]),
        lookForAtArea: jest.fn().mockReturnValue([]),
      });

      const hasMineralStructure = HasMineralStructure(room);
      expect(hasMineralStructure.code).toBe(FunctionReturnCodes.NOT_FOUND);
    });
  });
  describe("GetSources method", () => {
    it("should return OK", () => {
      const source = mockInstanceOf<Source>();
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest.fn().mockReturnValue([source]),
      });
      const getSources = GetSources(room);
      expect(getSources.code).toBe(FunctionReturnCodes.OK);
      expect(getSources.response).toHaveLength(1);
    });
    it("should return NO_CONTENT", () => {
      const room = mockInstanceOf<Room>({
        name: "room",
        find: jest.fn().mockReturnValue([]),
      });
      const getSources = GetSources(room);
      expect(getSources.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });
  });
  describe("HasPositionEnergyStructures method", () => {
    it("should return OK", () => {
      const link = mockInstanceOf<Structure>({
        pos: new RoomPosition(24, 25, "room"),
        structureType: STRUCTURE_LINK,
        store: { energy: 200 },
      });
      const container = mockInstanceOf<Structure>({
        pos: new RoomPosition(23, 25, "room"),
        structureType: STRUCTURE_CONTAINER,
        store: { energy: 500 },
      });
      const room = mockInstanceOf<Room>({
        name: "room",
        lookForAtArea: jest
          .fn()
          .mockReturnValue([{ structure: link }, { structure: container }]),
      });
      let hasPositionEnergyStructures = HasPositionEnergyStructures(
        room,
        new RoomPosition(25, 25, room.name)
      );
      expect(hasPositionEnergyStructures.code).toBe(FunctionReturnCodes.OK);

      const room2 = mockInstanceOf<Room>({
        name: "room",
        lookForAtArea: jest.fn().mockReturnValue([{ structure: container }]),
      });
      hasPositionEnergyStructures = HasPositionEnergyStructures(
        room2,
        new RoomPosition(25, 25, room.name)
      );
      expect(hasPositionEnergyStructures.code).toBe(FunctionReturnCodes.OK);

      const room3 = mockInstanceOf<Room>({
        name: "room",
        lookForAtArea: jest.fn().mockReturnValue([]),
      });
      hasPositionEnergyStructures = HasPositionEnergyStructures(
        room3,
        new RoomPosition(25, 25, room.name)
      );
      expect(hasPositionEnergyStructures.code).toBe(
        FunctionReturnCodes.NO_CONTENT
      );
    });
    it("should return NO_CONTENT", () => {
      const room = mockInstanceOf<Room>({
        name: "room",
        lookForAtArea: jest.fn().mockReturnValue([]),
      });
      const hasPositionEnergyStructures = HasPositionEnergyStructures(
        room,
        new RoomPosition(25, 25, room.name)
      );
      expect(hasPositionEnergyStructures.code).toBe(
        FunctionReturnCodes.NO_CONTENT
      );
    });
  });
});
