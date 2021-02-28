import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { isUndefined } from "lodash";
import {
  GetObjectsFromIDs,
  GetRoom,
  GetRoomIds,
  GetRoomMemoryUsingName,
  IsMyOwnedRoom,
  IsMyReservedRoom,
} from "./helper";
import { FunctionReturnCodes, Username } from "../utils/constants/global";

describe("Room helper", () => {
  beforeEach(() => {
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
  describe("GetRoom method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({ memory: {} });
      Game.rooms = { room };

      const getRoom = GetRoom("room");
      expect(getRoom.code).toBe(FunctionReturnCodes.OK);
      expect(getRoom.response === room).toBeTruthy();
    });
    it("should return NOT_FOUND", () => {
      Game.rooms = {};

      const getRoom = GetRoom("room");
      expect(getRoom.code === FunctionReturnCodes.NOT_FOUND).toBeTruthy();
      expect(isUndefined(getRoom.response)).toBeTruthy();
    });
  });
  describe("IsMyOwnedRoom", () => {
    beforeEach(() => {
      mockGlobal<Memory>("Memory", { rooms: {} });
    });
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({ controller: { my: true } });
      const isMyOwnedRoom = IsMyOwnedRoom(room);
      expect(isMyOwnedRoom.code).toBe(FunctionReturnCodes.OK);
    });
    it("should return NOT_MY_ROOM", () => {
      const room = mockInstanceOf<Room>({ controller: { my: false } });
      const room2 = mockInstanceOf<Room>({ controller: undefined });

      let isMyOwnedRoom = IsMyOwnedRoom(room);
      expect(
        isMyOwnedRoom.code === FunctionReturnCodes.NOT_MY_ROOM
      ).toBeTruthy();

      isMyOwnedRoom = IsMyOwnedRoom(room2);
      expect(
        isMyOwnedRoom.code === FunctionReturnCodes.NOT_MY_ROOM
      ).toBeTruthy();
    });
  });
  describe("GetRoomMemoryUsingName method", () => {
    beforeEach(() => {
      mockGlobal<Memory>("Memory", { rooms: {} });
    });
    it("should return OK", () => {
      const roomMemory = {};
      Memory.rooms = { room: roomMemory };

      const getRoomMemoryUsingName = GetRoomMemoryUsingName("room");
      expect(
        getRoomMemoryUsingName.code === FunctionReturnCodes.OK
      ).toBeTruthy();
      expect(getRoomMemoryUsingName.response === roomMemory).toBeTruthy();
    });
    it("should return NOT_FOUND", () => {
      Memory.rooms = {};
      const getRoomMemoryUsingName = GetRoomMemoryUsingName("room");
      expect(
        getRoomMemoryUsingName.code === FunctionReturnCodes.NOT_FOUND
      ).toBeTruthy();
      expect(isUndefined(getRoomMemoryUsingName.response)).toBeTruthy();
    });
  });

  describe("IsMyReservedRoom method", () => {
    it("should return NOT_FOUND", () => {
      const room = mockInstanceOf<Room>({ controller: undefined });

      const isMyReservedRoom = IsMyReservedRoom(room);
      expect(
        isMyReservedRoom.code === FunctionReturnCodes.NOT_FOUND
      ).toBeTruthy();
      expect(room.controller).not.toBeDefined();
    });
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({
        controller: { reservation: { username: Username } },
      });
      const room2 = mockInstanceOf<Room>({
        controller: { reservation: { username: "user" } },
      });
      const room3 = mockInstanceOf<Room>({
        controller: { reservation: undefined },
      });

      let isMyReservedRoom = IsMyReservedRoom(room);
      expect(isMyReservedRoom.code).toBe(FunctionReturnCodes.OK);

      isMyReservedRoom = IsMyReservedRoom(room2);
      expect(
        isMyReservedRoom.code === FunctionReturnCodes.NOT_MY_ROOM
      ).toBeTruthy();

      isMyReservedRoom = IsMyReservedRoom(room3);
      expect(
        isMyReservedRoom.code === FunctionReturnCodes.NOT_MY_ROOM
      ).toBeTruthy();
    });
  });
  describe("GetRoomIds method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", { cache: { rooms: { data: [] } } });
      const rooms = ["a", "b", "c"];
      Memory.cache.rooms.data = rooms;

      let getRoomIds = GetRoomIds();
      expect(getRoomIds.code).toBe(FunctionReturnCodes.OK);
      expect(getRoomIds.response).toHaveLength(3);

      Memory.cache.rooms.data = [];
      getRoomIds = GetRoomIds();
      expect(getRoomIds.code).toBe(FunctionReturnCodes.OK);
      expect(getRoomIds.response).toHaveLength(0);
    });
  });
  describe("GetObjectsFromIDs method", () => {
    it("should return OK", () => {
      Game.getObjectById = (key: string) => {
        return Game.structures[key] ? Game.structures[key] : null;
      };
      const structure = mockInstanceOf<Structure>();
      const structure2 = mockInstanceOf<Structure>();
      const structure3 = mockInstanceOf<Structure>();
      Game.structures = { structure, structure2, structure3 };

      const getObjectsFromIDs = GetObjectsFromIDs<Structure>([
        "structure",
        "null",
      ]);
      expect(getObjectsFromIDs.code).toBe(FunctionReturnCodes.OK);
    });
  });
});
