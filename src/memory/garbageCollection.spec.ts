import { mockInstanceOf, mockGlobal } from "screeps-jest";
import CreepHelper from "../creep/helper";
import JobHandler from "../room/jobs/handler";
import StructureHelper from "../structure/helper";
import GarbageCollectionHandler from "./garbageCollection";
import MemoryInitializationHandler from "./initialization";

jest.mock("../utils/logger");
jest.mock("../room/planner/planner");

const roomName = "room";
const roomName2 = "room2";
const structureId = "structure" as Id<Structure>;
const structureId2 = "structure2" as Id<Structure>;
const creepName = "creep";
const creepName2 = "creep2";
const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
});
const room2 = mockInstanceOf<Room>({
  name: roomName2,
  find: jest.fn().mockReturnValue([]),
});
const structure = mockInstanceOf<Structure>({
  id: structureId,
  room,
  structureType: "container",
  pos: new RoomPosition(1, 1, roomName),
});
const structure2 = mockInstanceOf<Structure>({
  id: structureId2,
  room: room2,
  structureType: "container",
  pos: new RoomPosition(1, 1, roomName),
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room,
  pos: new RoomPosition(1, 1, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
});
const creep2 = mockInstanceOf<Creep>({
  id: creepName2,
  name: creepName2,
  room: room2,
  pos: new RoomPosition(1, 1, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      rooms: {
        [roomName]: room,
        [roomName2]: room2,
      },
      structures: {
        [structureId]: structure,
        [structureId2]: structure2,
      },
      creeps: {
        [creepName]: creep,
        [creepName2]: creep2,
      },
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

describe("GarbageCollectionHandler", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeRoomMemory(roomName2);

    MemoryInitializationHandler.InitializeCreepMemory(
      roomName,
      creepName,
      "pioneer"
    );
    MemoryInitializationHandler.InitializeCreepMemory(
      roomName2,
      creepName2,
      "pioneer"
    );
    MemoryInitializationHandler.InitializeStructureMemory(
      roomName,
      structureId
    );
    MemoryInitializationHandler.InitializeStructureMemory(
      roomName2,
      structureId2
    );
  });
  describe("RemoveCreep", () => {
    it("should remove the creep from the room", () => {
      // MemoryInitializationHandler.InitializeCreepMemory(roomName,creepName, "pioneer");
      const creepMemory = CreepHelper.GetCreepMemory(creepName);
      expect(creepMemory).not.toBeUndefined();

      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      const assignedJob = JobHandler.AssignNewJobForCreep(creep, ["move"]);
      expect(assignedJob).not.toBeNull();
      if (assignedJob === null) return;
      expect(job.id).toBe(assignedJob.id);

      GarbageCollectionHandler.RemoveCreep(roomName, creepName);

      expect(job.assignedCreepsNames.length).toBe(0);
      expect(Memory.creeps[creepName]).toBeUndefined();
    });
  });
  describe("RemoveStructure", () => {
    it("should remove the structure from the memory", () => {
      // MemoryInitializationHandler.InitializeStructureMemory(roomName,structureId);
      const structureMemory = StructureHelper.GetStructureMemory(structureId);
      expect(structureMemory).not.toBeUndefined();

      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      const assignedJob = JobHandler.AssignNewJobForStructure(structure, [
        "move",
      ]);
      expect(assignedJob).not.toBeNull();
      if (assignedJob === null) return;
      expect(job.id).toBe(assignedJob.id);

      GarbageCollectionHandler.RemoveStructure(roomName, structureId);

      expect(job.assignedStructuresIds.length).toBe(0);
      expect(Memory.structures[structureId]).toBeUndefined();
    });
  });
  describe("RemoveRoom", () => {
    it("should remove the room from the memory", () => {
      GarbageCollectionHandler.RemoveRoom(roomName);
      expect(Memory.rooms[roomName]).toBeUndefined();
      expect(Memory.stats.rooms[roomName]).toBeUndefined();
    });
    it("should remove creeps and structures with the roomName as commandRoom", () => {
      const creepMemory = CreepHelper.GetCreepMemory(creepName);
      const creepMemory2 = CreepHelper.GetCreepMemory(creepName2);
      expect(creepMemory.commandRoom).toBe(roomName);
      expect(creepMemory2.commandRoom).toBe(roomName2);

      const structureMemory = StructureHelper.GetStructureMemory(structureId);
      const structureMemory2 = StructureHelper.GetStructureMemory(structureId2);
      expect(structureMemory.room).toBe(roomName);
      expect(structureMemory2.room).toBe(roomName2);

      GarbageCollectionHandler.RemoveRoom(roomName);
      expect(Memory.rooms[roomName]).toBeUndefined();
      expect(Memory.rooms[roomName2]).not.toBeUndefined();
      expect(Memory.stats.rooms[roomName]).toBeUndefined();

      expect(Memory.creeps[creepName]).toBeUndefined();
      expect(Memory.creeps[creepName2]).not.toBeUndefined();
      expect(Memory.structures[structureId]).toBeUndefined();
      expect(Memory.structures[structureId2]).not.toBeUndefined();
    });
  });
});
