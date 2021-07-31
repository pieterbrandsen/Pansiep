import { mockInstanceOf, mockGlobal } from "screeps-jest";
import { forEach } from "lodash";
import MemoryInitializationHandler from "../memory/initialization";
import JobHandler from "../room/jobs/handler";
import CreepHelper from "./helper";
import CreepActions from "./actions/actionsGroup";

const roomName = "room";
const creepName = "creep";

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  controller: undefined,
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room: { name: roomName },
  pos: new RoomPosition(0, 0, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", { creeps: {} });
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      rooms: { [roomName]: room },
      creeps: {
        [creepName]: creep,
      },
    },
    true
  );
  MemoryInitializationHandler.InitializeGlobalMemory();
});

jest.mock("../utils/logger");
jest.mock("./actions/actionsGroup");

describe("CreepHelper", () => {
  describe("GetCreep", () => {
    it("should return creep", () => {
      Game.creeps = { creep };
      const result = CreepHelper.GetCreep(creepName);
      expect(result).toBe(creep);
    });
    it("should return undefined", () => {
      Game.creeps = {};
      const result = CreepHelper.GetCreep(creepName);
      expect(result).toBe(undefined);
    });
  });
  describe("GetCreepMemory", () => {
    it("should return creep memory", () => {
      Memory.creeps[creepName] = {
        commandRoom: roomName,
        parts: {},
        type: "none",
      };
      const result = CreepHelper.GetCreepMemory(creepName);
      expect(result).toBe(Memory.creeps[creepName]);
    });
    it("should return undefined", () => {
      Memory.creeps = {};
      const result = CreepHelper.GetCreepMemory(creepName);
      expect(result).toBe(undefined);
    });
  });
  describe("IsCreepDamaged", () => {
    it("should return true", () => {
      creep.hits = 0;
      creep.hitsMax = 1;
      Game.creeps[creepName] = creep;
      const result = CreepHelper.IsCreepDamaged(creep);
      expect(result).toBe(true);
    });
    it("should return false", () => {
      creep.hits = 1;
      creep.hitsMax = 1;
      Game.creeps[creepName] = creep;
      const result = CreepHelper.IsCreepDamaged(creep);
      expect(result).toBe(false);
    });
  });
  describe("ExecuteJob", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
    });
    it("should delete jobId because its not found", () => {
      Memory.creeps[creepName] = {
        commandRoom: roomName,
        parts: {},
        type: "none",
        jobId: "none" as Id<Job>,
      };
      const creepMemory: CreepMemory = CreepHelper.GetCreepMemory(creepName);
      CreepHelper.ExecuteJob(creep, creepMemory);

      expect(Memory.creeps[creepName].jobId).toBe(undefined);
    });
    it("should call all CreepActions types", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      Memory.creeps[creepName] = {
        commandRoom: roomName,
        parts: {},
        type: "none",
        jobId: job.id,
      };
      const creepMemory: CreepMemory = CreepHelper.GetCreepMemory(creepName);

      const jobActions: JobActionTypes[] = [
        "attack",
        "build",
        "claim",
        "dismantle",
        "harvest",
        "heal",
        "move",
        "repair",
        "transfer",
        "upgrade",
        "withdraw",
        "nothing" as JobActionTypes,
      ];
      forEach(jobActions, (action) => {
        job.action = action;
        CreepHelper.ExecuteJob(creep, creepMemory);
      });
      expect(CreepActions.Attack).toHaveBeenCalledTimes(1);
      expect(CreepActions.Build).toHaveBeenCalledTimes(1);
      expect(CreepActions.Claim).toHaveBeenCalledTimes(1);
      expect(CreepActions.Dismantle).toHaveBeenCalledTimes(1);
      expect(CreepActions.Harvest).toHaveBeenCalledTimes(1);
      expect(CreepActions.Heal).toHaveBeenCalledTimes(1);
      expect(CreepActions.Move).toHaveBeenCalledTimes(1);
      expect(CreepActions.Repair).toHaveBeenCalledTimes(1);
      expect(CreepActions.Transfer).toHaveBeenCalledTimes(1);
      expect(CreepActions.Upgrade).toHaveBeenCalledTimes(1);
      expect(CreepActions.Withdraw).toHaveBeenCalledTimes(1);
    });
  });
  describe("GetAllCreepsMemory", () => {
    it("should return the memory of creeps that don't have an isNotSeenSince field", () => {
      Memory.creeps = {
        creep: {
          commandRoom: roomName,
          parts: {},
          type: "none",
          isNotSeenSince: 0,
        },
        creep2: { commandRoom: roomName, parts: {}, type: "none" },
        creep3: { commandRoom: roomName, parts: {}, type: "attack" },
        creep4: { commandRoom: "otherRoom", parts: {}, type: "attack" },
      };
      const result = CreepHelper.GetAllCreepsMemory(roomName);
      expect(result.length).toEqual(2);
    });
    it("should return the memory of creeps that don't have an isNotSeenSince field and have chosen type", () => {
      Memory.creeps = {
        creep: {
          commandRoom: roomName,
          parts: {},
          type: "none",
          isNotSeenSince: 0,
        },
        creep2: { commandRoom: roomName, parts: {}, type: "none" },
        creep3: { commandRoom: roomName, parts: {}, type: "attack" },
      };
      const result = CreepHelper.GetAllCreepsMemory(roomName, ["attack"]);
      expect(result.length).toEqual(1);
      expect(result[0].isNotSeenSince).toBeUndefined();
    });
  });
  describe("GetCachedCreepIds", () => {
    it("should return all creep ids out the creep room cache", () => {
      const creepIds: string[] = ["creep1", "creep2"];
      Memory.cache.creeps.data[roomName] = [
        { id: creepIds[0] },
        { id: creepIds[1] },
      ];
      const result = CreepHelper.GetCachedCreepIds(roomName);
      expect(result).toEqual(creepIds);
    });
  });
  describe("GetType", () => {
    it("should return expected creep type", () => {
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === CLAIM ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("claim");
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === HEAL ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("heal");
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === ATTACK ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("attack");
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === RANGED_ATTACK ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("attack");
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === WORK ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("work");
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === CARRY ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("transferring");
      creep.getActiveBodyparts = jest
        .fn()
        .mockImplementation((type) => (type === MOVE ? 1 : 0));
      expect(CreepHelper.GetType(creep)).toBe("move");
      creep.getActiveBodyparts = jest.fn().mockImplementation(() => 0);
      expect(CreepHelper.GetType(creep)).toBe("none");
    });
  });
  describe("ControlCreepHealing", () => {
    beforeEach(() => {
      MemoryInitializationHandler.InitializeRoomMemory(roomName);
    });
    it("should create an job", () => {
      creep.hits = 0;
      creep.hitsMax = 1;
      CreepHelper.ControlCreepHealing(creep);
      expect(Memory.rooms[roomName].jobs[0].action).toBe("heal");
    });
    it("should do nothing if creep is not damaged", () => {
      creep.hits = 1;
      creep.hitsMax = 1;
      CreepHelper.ControlCreepHealing(creep);
      expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    });
    it("should do nothing if job is already created", () => {
      JobHandler.CreateJob.CreateHealJob(creep);
      creep.hits = 0;
      creep.hitsMax = 1;
      CreepHelper.ControlCreepHealing(creep);
      expect(Memory.rooms[roomName].jobs.length).toEqual(1);
      expect(Memory.rooms[roomName].jobs[0].action).toBe("heal");
    });
  });
});
