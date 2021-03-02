import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RemoveCreep, RemoveRoom, RemoveStructure } from "./garbageCollection";
import { InitializeGlobalMemory } from "./initialization";

JSON.stringify = jest.fn(() => {
  return "stringify";
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      time: 1001,
      rooms: {},
      structure: {},
      creeps: {},
      cpu: {
        getUsed: () => {
          return 1;
        },
      },
    },
    true
  );
});

describe("Garbage collection", () => {
  describe("RemoveCreep method", () => {
    it("should return OK", () => {
      // This room
      const room = mockInstanceOf<Room>({ name: "room" });
      const creep = mockInstanceOf<Creep>({
        id: "a" as Id<Creep>,
        room,
      });
      const creep2 = mockInstanceOf<Creep>({
        id: "b" as Id<Creep>,
        room,
      });

      // Other room
      const room2 = mockInstanceOf<Room>({ name: "room2" });
      const creep3 = mockInstanceOf<Creep>({
        id: "c" as Id<Creep>,
        room: room2,
      });

      Game.rooms = { room, room2 };
      Game.creeps = { creep, creep2, creep3 };
      InitializeGlobalMemory();

      // Assertions
      let removeCreep = RemoveCreep(creep.id, room.name);
      expect(removeCreep.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.creeps[creep.id]).toBeUndefined();

      removeCreep = RemoveCreep(creep2.id, room.name);
      expect(removeCreep.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.creeps[creep2.id]).toBeUndefined();

      removeCreep = RemoveCreep(creep3.id, room2.name);
      expect(removeCreep.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.creeps[creep3.id]).toBeUndefined();
    });
  });
  describe("RemoveStructure method", () => {
    it("should return OK", () => {
      // This room
      const room = mockInstanceOf<Room>({ name: "room" });
      const lab = mockInstanceOf<Structure>({
        id: "a" as Id<Structure>,
        room,
        structureType: STRUCTURE_LAB,
      });
      const link = mockInstanceOf<Structure>({
        id: "b" as Id<Structure>,
        room,
        structureType: STRUCTURE_LINK,
      });

      // Other room
      const room2 = mockInstanceOf<Room>({ name: "room2" });
      const lab2 = mockInstanceOf<Structure>({
        id: "c" as Id<Structure>,
        room: room2,
        structureType: STRUCTURE_LAB,
      });

      Game.rooms = { room, room2 };
      Game.structures = { lab, link, lab2 };
      InitializeGlobalMemory();

      // Assertions
      let removeStructure = RemoveStructure(lab.id, room.name);
      expect(removeStructure.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.structures[lab.id]).toBeUndefined();

      removeStructure = RemoveStructure(link.id, room.name);
      expect(removeStructure.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.structures[link.id]).toBeUndefined();

      removeStructure = RemoveStructure(lab2.id, room2.name);
      expect(removeStructure.code).toBe(FunctionReturnCodes.OK);
      expect(Memory.structures[lab2.id]).toBeUndefined();
    });
  });
  describe("RemoveRoom method", () => {
    it("should return OK", () => {
      // This room
      const room = mockInstanceOf<Room>({ name: "room" });
      const lab = mockInstanceOf<Structure>({
        room,
        structureType: STRUCTURE_LAB,
      });
      const link = mockInstanceOf<Structure>({
        room,
        structureType: STRUCTURE_LINK,
      });
      const creep = mockInstanceOf<Creep>({ room });
      const creep2 = mockInstanceOf<Creep>({ room });

      // Other room
      const room2 = mockInstanceOf<Room>({ name: "room2" });
      const lab2 = mockInstanceOf<Structure>({
        room: room2,
        structureType: STRUCTURE_LAB,
      });
      const creep3 = mockInstanceOf<Creep>({ room: room2 });

      Game.rooms = { room, room2 };
      Game.structures = { lab, link, lab2 };
      Game.creeps = { creep, creep2, creep3 };
      InitializeGlobalMemory();

      // Assertions
      let removeRoom = RemoveRoom(room.name);
      expect(removeRoom.code).toBe(FunctionReturnCodes.OK);
      expect(Object.keys(Memory.rooms)).toHaveLength(1);
      expect(Object.keys(Memory.structures)).toHaveLength(1);
      expect(Object.keys(Memory.creeps)).toHaveLength(1);

      removeRoom = RemoveRoom(room2.name);
      expect(removeRoom.code).toBe(FunctionReturnCodes.OK);
      expect(Object.keys(Memory.rooms)).toHaveLength(0);
      expect(Object.keys(Memory.structures)).toHaveLength(0);
      expect(Object.keys(Memory.creeps)).toHaveLength(0);
    });
  });
});
