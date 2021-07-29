import { forEach } from "lodash";
import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CreepHelper from "../../creep/helper";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const roomName = "room";
const spawnId = "spawn" as Id<Structure>;
const position = new RoomPosition(0, 0, roomName);

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  controller: undefined,
  energyAvailable: 100,
  energyCapacityAvailable: 100,
});
const spawn = mockInstanceOf<StructureSpawn>({
  id: spawnId,
  room,
  structureType: STRUCTURE_SPAWN,
  pos: position,
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      rooms: { [roomName]: room },
      structures: { [spawnId]: spawn },
    },
    true
  );
  MemoryInitializationHandler.InitializeHeapVars();
  MemoryInitializationHandler.InitializeGlobalMemory();
  jest
    .spyOn(MemoryInitializationHandler, "InitializeCreepMemory")
    .mockReturnValue();
});

jest.mock("../../room/planner/planner");
jest.mock("../../utils/logger");

describe("SpawnHandler", () => {
  describe("ExecuteSpawn", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, spawnId);
      jest.spyOn(StructureHelper, "KeepStructureFullEnough").mockReturnValue();
      jest.spyOn(StructureHelper, "ControlDamagedStructures").mockReturnValue();
    });
    it("should call all main functions", () => {
      spawn.spawning = mockInstanceOf<Spawning>({ spawning: true });
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
        spawn,
        true
      );
      expect(StructureHelper.KeepStructureFullEnough).toHaveBeenCalledWith(
        spawn,
        100,
        RESOURCE_ENERGY,
        "transfer",
        true
      );
    });
  });
  describe("SpawnCreep", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, spawnId);
      jest.spyOn(StructureHelper, "KeepStructureFullEnough").mockReturnValue();
      jest.spyOn(StructureHelper, "ControlDamagedStructures").mockReturnValue();
      spawn.spawning = null;
    });
    it("should use spawnQueue to spawn creep because length is longer than 0", () => {
      Memory.rooms[roomName].spawnQueue.push("none");
      spawn.spawnCreep = jest.fn().mockReturnValue(-1);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(spawn.spawnCreep).toHaveBeenCalled();
      expect(Memory.rooms[roomName].spawnQueue.length).toBe(1);
    });
    it("should spawn an creep without spawnQueue", () => {
      room.energyCapacityAvailable *= 10;
      spawn.spawnCreep = jest.fn().mockReturnValue(-1);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(spawn.spawnCreep).toHaveBeenCalled();
      expect(Memory.rooms[roomName].spawnQueue.length).toBe(0);
      room.energyCapacityAvailable /= 10;

      spawn.spawnCreep = jest.fn().mockClear();
      CreepHelper.GetAllCreepsMemory = jest
        .fn()
        .mockReturnValue([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
        ]);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(spawn.spawnCreep).not.toHaveBeenCalled();

      spawn.spawnCreep = jest.fn().mockClear().mockReturnValue(0);
      CreepHelper.GetAllCreepsMemory = jest
        .fn()
        .mockClear()
        .mockReturnValueOnce([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
        ])
        .mockReturnValue([]);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(spawn.spawnCreep).toHaveBeenCalled();
    });
  });
  describe("GetBodyParts", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, spawnId);
      jest.spyOn(StructureHelper, "KeepStructureFullEnough").mockReturnValue();
      jest.spyOn(StructureHelper, "ControlDamagedStructures").mockReturnValue();
      spawn.spawning = null;
    });
    it("should call all creepType switch statements", () => {
      spawn.spawnCreep = jest.fn().mockReturnValue(0);
      const creepTypes: CreepTypes[] = [
        "attack",
        "claim",
        "heal",
        "move",
        "transferring",
        "pioneer",
        "work",
        "none",
      ];

      forEach(creepTypes, (creepType: CreepTypes) => {
        Memory.rooms[roomName].spawnQueue.push(creepType);
        StructureActions.SpawnHandler.ExecuteSpawn(spawn);
        expect(Memory.rooms[roomName].spawnQueue.length).toBe(0);
      });
      expect(spawn.spawnCreep).toHaveBeenCalledTimes(creepTypes.length);
    });
  });
  describe("GetNextCreepType", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, spawnId);
      jest.spyOn(StructureHelper, "KeepStructureFullEnough").mockReturnValue();
      jest.spyOn(StructureHelper, "ControlDamagedStructures").mockReturnValue();
      spawn.spawning = null;
    });
    it("should call all jobTypes switch statements", () => {
      spawn.spawnCreep = jest.fn().mockReturnValue(0);
      room.energyCapacityAvailable = 1000;
      room.energyAvailable = 1000;

      const job = JobHandler.CreateJob.CreateMoveJob(roomName, position, true);
      const jobTypes: JobActionTypes[] = [
        "move",
        "transfer",
        "harvest",
        "attack",
        "claim",
        "heal",
        "a" as JobActionTypes,
      ];
      forEach(jobTypes, (jobType: JobActionTypes) => {
        job.action = jobType;
        StructureActions.SpawnHandler.ExecuteSpawn(spawn);
        expect(job.action).toBe(jobType);
      });
      expect(spawn.spawnCreep).toHaveBeenCalledTimes(jobTypes.length - 1);
    });
  });
  describe("GetJobActionsWithCreepNeed", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
      MemoryInitializationHandler.InitializeStructureMemory(roomName, spawnId);
      jest.spyOn(StructureHelper, "KeepStructureFullEnough").mockReturnValue();
      jest.spyOn(StructureHelper, "ControlDamagedStructures").mockReturnValue();
      spawn.spawning = null;
    });
    it("should create 2 jobs before spawning and get first one", () => {
      spawn.spawnCreep = jest.fn().mockReturnValue(0);
      room.energyCapacityAvailable = 1000;
      room.energyAvailable = 1000;

      JobHandler.CreateJob.CreateMoveJob(roomName, position, true);
      JobHandler.CreateJob.CreateMoveJob(roomName, position, true);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(spawn.spawnCreep).toHaveBeenCalledTimes(2);
    });
    it("should have too much creeps on one creep type", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName, position, true);
      spawn.spawnCreep = jest.fn().mockReturnValue(0);
      CreepHelper.GetAllCreepsMemory = jest
        .fn()
        .mockReturnValue([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
      StructureActions.SpawnHandler.ExecuteSpawn(spawn);
      expect(spawn.spawnCreep).toHaveBeenCalledTimes(0);
    });
  });
});
