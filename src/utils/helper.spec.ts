import { mockGlobal, mockInstanceOf } from "screeps-jest";
import UtilsHelper from "./helper";

const roomName = "room";
const creepId = "creep";
const creep = mockInstanceOf<Creep>({
  id: creepId,
  name: creepId,
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      rooms: {},
      structures: {},
      creeps: {
        [creepId]: creep,
      },
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

describe("UtilsHelper", () => {
  describe("ExecuteEachTick", () => {
    it("should return true because of forceExecute", () => {
      const result = UtilsHelper.ExecuteEachTick(100, true);
      expect(result).toBe(true);
    });
    it("should return false because of not the right time", () => {
      Game.time = 201;
      const result = UtilsHelper.ExecuteEachTick(100, false);
      expect(result).toBe(false);
    });
    it("should return true because of the right time", () => {
      Game.time = 200;
      const result = UtilsHelper.ExecuteEachTick(100);
      expect(result).toBe(true);
    });
  });
  describe("RehydratedRoomPosition", () => {
    it("should return the room position", () => {
      const position = new RoomPosition(1, 1, roomName);
      const hydratedPosition = UtilsHelper.RehydrateRoomPosition(position);
      expect(hydratedPosition.x).toEqual(position.x);
      expect(hydratedPosition.y).toEqual(position.y);
      expect(hydratedPosition.roomName).toEqual(position.roomName);
    });
  });
  describe("GetObject", () => {
    it("should return the object", () => {
      Game.getObjectById = jest.fn().mockReturnValue(creep);
      const result = UtilsHelper.GetObject(creep.id);
      expect(result).toEqual(creep);
    });
  });
});
