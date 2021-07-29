import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../memory/initialization";
import RoomHelper from "./helper";
import GarbageCollectionHandler from "../memory/garbageCollection";
import GlobalConstants from "../utils/constants/global";

const roomName = "room";
const undefinedRoomName = "room2";

const controller = mockInstanceOf<StructureController>({
  id: "controller",
  room: { name: roomName },
  my: false,
});
const room = mockInstanceOf<Room>({
  name: roomName,
  controller,
  find: jest.fn().mockReturnValue([]),
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      rooms: {
        [roomName]: room,
      },
    },
    true
  );

  MemoryInitializationHandler.InitializeGlobalMemory();
});

jest.mock("../utils/logger");

describe("RoomHelper", () => {
  describe("GetRoom", () => {
    it("should return the room", () => {
      expect(RoomHelper.GetRoom(roomName)).toBe(room);
    });
    it("should return undefined because the room does not exist", () => {
      expect(RoomHelper.GetRoom(undefinedRoomName)).toBe(undefined);
    });
  });
  describe("IsMyOwnedRoom", () => {
    it("should return true", () => {
      room.controller = controller;
      room.controller.my = true;
      expect(RoomHelper.IsMyOwnedRoom(room)).toBe(true);
    });
    it("should return false", () => {
      room.controller = controller;
      room.controller.my = false;
      expect(RoomHelper.IsMyOwnedRoom(room)).toBe(false);

      room.controller = undefined;
      expect(RoomHelper.IsMyOwnedRoom(room)).toBe(false);
    });
  });
  describe("GetRoomMemory", () => {
    it("should return memory from the room", () => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      expect(RoomHelper.GetRoomMemory(roomName)).toBe(Memory.rooms[roomName]);
      GarbageCollectionHandler.RemoveRoom(roomName);
    });
    it("should return undefined because the value in memory does not exist", () => {
      expect(RoomHelper.GetRoomMemory(undefinedRoomName)).toBe(undefined);
    });
  });
  describe("GetRoomStatsMemory", () => {
    it("should return stats memory from the room", () => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      expect(RoomHelper.GetRoomStatsMemory(roomName)).toBe(
        Memory.stats.rooms[roomName]
      );
      GarbageCollectionHandler.RemoveRoom(roomName);
    });
    it("should return undefined because the value in memory does not exist", () => {
      expect(RoomHelper.GetRoomMemory(undefinedRoomName)).toBe(undefined);
    });
  });
  describe("IsMyReservedRoom", () => {
    it("should return true", () => {
      room.controller = controller;
      room.controller.reservation = {
        username: GlobalConstants.Username,
        ticksToEnd: 0,
      };
      expect(RoomHelper.IsMyReservedRoom(room)).toBe(true);
    });
    it("should return false", () => {
      room.controller = controller;
      room.controller.reservation = undefined;

      expect(RoomHelper.IsMyReservedRoom(room)).toBe(false);

      room.controller.reservation = { username: "notMe", ticksToEnd: 0 };
      expect(RoomHelper.IsMyReservedRoom(room)).toBe(false);

      room.controller = undefined;
      expect(RoomHelper.IsMyReservedRoom(room)).toBe(false);
    });
  });
  describe("GetRoomIds", () => {
    beforeEach(() => {
      Game.rooms = {};
      MemoryInitializationHandler.InitializeGlobalMemory();
    });
    it("should return all roomIds from the cache", () => {
      const roomNames: string[] = ["a", "b", "c"];
      Memory.cache.rooms.data = roomNames;
      expect(RoomHelper.GetRoomIds()).toBe(roomNames);
    });
    it("should return nothing because there are no rooms in the memory", () => {
      expect(RoomHelper.GetRoomIds().length).toBe(0);
    });
  });
  describe("GetObjectsFromIDs", () => {
    it("should return an array of objects", () => {
      const ids = ["0", "1", "2", "3"];
      Game.getObjectById = jest
        .fn()
        .mockReturnValueOnce(ids[0])
        .mockReturnValueOnce(ids[1])
        .mockReturnValueOnce(ids[2])
        .mockReturnValueOnce(null);
      expect(RoomHelper.GetObjectsFromIDs(ids).length).toBe(ids.length - 1);
    });
  });
});
