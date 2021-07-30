import { forEach } from "lodash";
import { mockInstanceOf, mockGlobal } from "screeps-jest";
import CreepHelper from "../../creep/helper";

import MemoryInitializationHandler from "../../memory/initialization";
import StructureHelper from "../../structure/helper";
import UtilsHelper from "../../utils/helper";
import JobHandler from "./handler";

jest.mock("../../utils/logger");
jest.mock("../planner/planner");

const roomName = "room0";
const creepId = "creep0";
const creepId2 = "creep0";
const structureId = "structure0" as Id<Structure>;
const structureType = STRUCTURE_TOWER;
const jobPos = new RoomPosition(25, 25, roomName);
const jobPos2 = new RoomPosition(24, 25, roomName);
const jobPos3 = new RoomPosition(23, 25, roomName);
const resourceType = RESOURCE_ENERGY;

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  controller: {
    my: true,
    level: 1,
  },
  id: 1,
  lookForAtArea: jest.fn().mockReturnValue([]),
});
const structure = mockInstanceOf<Structure>({
  id: structureId,
  pos: jobPos,
  room,
  structureType,
  hitsMax: 1,
  hits: 1,
});
const structure2 = mockInstanceOf<Structure>({
  id: structureId,
  pos: jobPos,
  room,
  structureType: STRUCTURE_ROAD,
  hitsMax: 1,
  hits: 1,
});
const creep = mockInstanceOf<Creep>({
  id: creepId,
  name: creepId,
  store: {
    getUsedCapacity: jest.fn().mockReturnValue(1),
    getCapacity: jest.fn().mockReturnValue(0),
  },
  memory: {
    jobId: undefined,
    secondJobId: undefined,
  },
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  room,
  pos: jobPos,
});
const creep2 = mockInstanceOf<Creep>({
  id: creepId2,
  name: creepId2,
  memory: {
    jobId: undefined,
    secondJobId: undefined,
  },
  store: {
    getUsedCapacity: jest.fn().mockReturnValue(0),
    getCapacity: jest.fn().mockReturnValue(1),
  },
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  room,
  pos: jobPos,
});
const controller = mockInstanceOf<StructureController>({
  id: structureId,
  pos: jobPos,
  room,
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      time: 1001,
      rooms: {
        [roomName]: room,
      },
      structures: {
        [structureId]: structure,
      },
      creeps: {
        [creepId]: creep,
        [creepId2]: creep2,
      },
      cpu: {
        getUsed: () => {
          return 1;
        },
      },
      getObjectById: jest.fn().mockReturnValue(structure),
    },
    true
  );
});

describe("JobHandler", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepId);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepId2);
  });

  describe("GetAllJobs", () => {
    it("Should return an complete empty array of jobs", () => {
      const jobs = JobHandler.GetAllJobs(roomName);
      expect(jobs).toEqual([]);
    });
    it("Should return an array with 3 jobs", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, false);
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      const jobs = JobHandler.GetAllJobs(roomName);
      expect(jobs.length).toBe(3);
      expect(jobs.filter((j) => j.hasPriority === true).length).toBe(2);
      expect(jobs.filter((j) => j.hasPriority === false).length).toBe(1);
    });
    it("Should return an array of only move jobs", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, false);
      JobHandler.CreateJob.CreateHealJob(creep);
      const jobs = JobHandler.GetAllJobs(roomName, ["move"]);
      expect(jobs.length).toBe(2);
    });
  });
  describe("GetAvailableJobs", () => {
    it("should return all available jobs for creeps", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      JobHandler.CreateJob.CreateHealJob(creep);
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      job.maxCreeps = 0;

      const jobs = JobHandler.GetAvailableJobs(roomName, true);
      expect(jobs.length).toBe(2);
      expect(jobs[0].hasPriority).toBe(true);
      expect(jobs[1].hasPriority).toBe(false);

      const moveJobs = JobHandler.GetAvailableJobs(roomName, true, ["move"]);
      expect(moveJobs.length).toBe(1);
    });
    it("should return all available jobs for structures", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      JobHandler.CreateJob.CreateHealJob(creep);
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos, true);
      job.maxStructures = 0;

      const jobs = JobHandler.GetAvailableJobs(roomName, false);
      expect(jobs.length).toBe(2);
      expect(jobs[0].hasPriority).toBe(true);
      expect(jobs[1].hasPriority).toBe(false);

      const moveJobs = JobHandler.GetAvailableJobs(roomName, false, ["move"]);
      expect(moveJobs.length).toBe(1);
    });
  });
  describe("GetClosestJob", () => {
    it("should return the closest job", () => {
      const position = new RoomPosition(1, 1, roomName);
      position.getRangeTo = jest.fn().mockReturnValue(1);
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
      job.position = position;
      const job2 = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos2);
      job2.position = position;
      const job3 = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos3);
      job3.position = position;

        UtilsHelper.RehydrateRoomPosition = jest.fn().mockReturnValue(position)
      const jobs = JobHandler.GetAllJobs(roomName);
      const closestJob = JobHandler.GetClosestJob(jobs, jobPos2);
      expect(closestJob).not.toBe(null);
      if (closestJob === null) return;
      expect(closestJob.id).toBe(job2.id);
    });
    it("should not return an job back if no jobs has an position defined", () => {
      JobHandler.CreateJob.CreateAttackJob(roomName,creep.id);
      const jobs = JobHandler.GetAllJobs(roomName);

      const closestJob = JobHandler.GetClosestJob(jobs, jobPos2);
      expect(jobs.length).toBe(1);
      expect(jobs[0].position).toBeUndefined();
      expect(closestJob).toBe(null);
    })
  });
  describe("SwitchCreepSavedJobIds", () => {
    it("should switch job ids", () => {
      const creepMemory = CreepHelper.GetCreepMemory(creepId);
      creepMemory.jobId = creepId as Id<Job>;
      JobHandler.SwitchCreepSavedJobIds(creepMemory, false);
      expect(creepMemory.jobId).toBe(undefined);
      expect(creepMemory.secondJobId).toBe(creepId);
    });
    it("should switch job ids using default parameter", () => {
      const creepMemory = CreepHelper.GetCreepMemory(creepId);
      creepMemory.jobId = creepId as Id<Job>;
      JobHandler.SwitchCreepSavedJobIds(creepMemory);
      expect(creepMemory.jobId).toBe(undefined);
      expect(creepMemory.secondJobId).toBe(creepId);
    });
    it("should switch job ids back", () => {
      const creepMemory = CreepHelper.GetCreepMemory(creepId);
      creepMemory.secondJobId = creepId as Id<Job>;
      JobHandler.SwitchCreepSavedJobIds(creepMemory, true);
      expect(creepMemory.jobId).toBe(creepId);
      expect(creepMemory.secondJobId).toBe(undefined);
    });
  });
  describe("AssignNewJobForStructure", () => {
    it("should return false because of no jobs available", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName);
      const gotJob = JobHandler.AssignNewJobForStructure(structure);
      expect(gotJob).toBe(null);
    });
    it("should assign the closest available job to the structure", () => {
      const job = JobHandler.CreateJob.CreateHealJob(creep);
      const gotJob = JobHandler.AssignNewJobForStructure(structure);
      const structureJobId = StructureHelper.GetStructureMemory(structure.id)
        .jobId;
      expect(structureJobId).toBe(job.id);
      expect(gotJob).not.toBe(null);
    });
    it("should only return move jobs", () => {
      JobHandler.CreateJob.CreateHealJob(creep);
      const moveJob = JobHandler.CreateJob.CreateMoveJob(roomName);
      const gotJob = JobHandler.AssignNewJobForStructure(structure, ["move"]);
      const structureJobId = StructureHelper.GetStructureMemory(structure.id)
        .jobId;
      expect(structureJobId).toBe(moveJob.id);
      expect(gotJob).not.toBe(null);
    });
    it("should return false because wrong structure type", () => {
      JobHandler.CreateJob.CreateHealJob(creep);
      const gotJob = JobHandler.AssignNewJobForStructure(structure2);
      expect(gotJob).toBe(null);
    });
    it("should have found an attack job", () => {
      const position = new RoomPosition(1, 1, roomName);
      position.getRangeTo = jest.fn().mockReturnValue(1);
      const job = JobHandler.CreateJob.CreateAttackJob(
        creep.room.name,
        creep.id
      );
      job.position = position;      
      UtilsHelper.RehydrateRoomPosition = jest.fn().mockReturnValue(position);

      const gotJob = JobHandler.AssignNewJobForStructure(structure);
      const structureJobId = StructureHelper.GetStructureMemory(structure.id)
        .jobId;
      expect(structureJobId).toBe(job.id);
      expect(gotJob).not.toBe(null);
      expect(gotJob).toBe(job);
    });
    it("should not return an job back if no jobs has an position defined", () => {
      JobHandler.CreateJob.CreateAttackJob(roomName,creep.id);
      const jobs = JobHandler.GetAllJobs(roomName);

      const closestJob = JobHandler.AssignNewJobForStructure(structure,["attack"]);
      expect(jobs.length).toBe(1);
      expect(jobs[0].position).toBeUndefined();
      expect(closestJob).toBe(null);
    })
  });
  describe("AssignNewJobForCreep", () => {
    it("should return false because of no jobs available", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName);
      const gotJob = JobHandler.AssignNewJobForCreep(creep);
      expect(gotJob).toBe(null);
    });
    it("should assign the closest available job to the creep", () => {
      const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
      const gotJob = JobHandler.AssignNewJobForCreep(creep);
      const creepJobId = CreepHelper.GetCreepMemory(creep.id).jobId;
      expect(creepJobId).toBe(job.id);
      expect(job.action).toBe("claim");
      expect(gotJob).not.toBe(null);
    });
    it("should only return move jobs", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      const gotJob = JobHandler.AssignNewJobForCreep(creep, ["move"]);
      const creepJobId = CreepHelper.GetCreepMemory(creep.id).jobId;
      expect(creepJobId).toBe(job.id);
      expect(gotJob).not.toBe(null);
    });
    it("should use forced job", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName);
      const job2 = JobHandler.CreateJob.CreateHealJob(creep);
      const gotJob = JobHandler.AssignNewJobForCreep(creep, ["move"], job2);
      const creepJobId = CreepHelper.GetCreepMemory(creep.id).jobId;
      expect(creepJobId).toBe(job2.id);
      expect(gotJob).not.toBe(null);
    });
    it("should switch secondJobId back to jobId", () => {
      const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
      const creepMemory = CreepHelper.GetCreepMemory(creep.id);
      creepMemory.secondJobId = job.id;
      creepMemory.jobId = undefined;

      const gotJob = JobHandler.AssignNewJobForCreep(creep);
      expect(creepMemory.jobId).toBe(job.id);
      expect(gotJob).not.toBe(null);
    });
    it("should check all creep types", () => {
      const position = new RoomPosition(1, 1, roomName);
      position.getRangeTo = jest.fn().mockReturnValue(1);
      let job = JobHandler.CreateJob.CreateAttackJob(room.name, controller.id)
      job.position= position;

      job = JobHandler.CreateJob.CreateTransferJob(
        structure,
        0,
        resourceType,
        "transfer"
        );
        job.position= position;
      job = JobHandler.CreateJob.CreateTransferJob(
        structure,
        0,
        resourceType,
        "transfer"
      );
      job.position= position;

      job = JobHandler.CreateJob.CreateTransferJob(
        structure,
        0,
        resourceType,
        "transfer"
      );
      job.position= position;
      job = JobHandler.CreateJob.CreateTransferJob(
        structure,
        0,
        resourceType,
        "transfer"
      );
      job.position= position;

      job = JobHandler.CreateJob.CreateRepairJob(structure);
      job.position= position;
      job = JobHandler.CreateJob.CreateRepairJob(structure);
      job.position= position;

      const creep1Memory = CreepHelper.GetCreepMemory(creep.id);
      const creep2Memory = CreepHelper.GetCreepMemory(creep.id);
      const creepTypes: CreepTypes[] = [
        "attack",
        "pioneer",
        "transferring",
        "work",
      ];
      UtilsHelper.RehydrateRoomPosition = jest.fn().mockReturnValue(position);
      forEach(creepTypes, (creepType) => {
        creep1Memory.type = creepType;
        creep2Memory.type = creepType;
        const jobCreep1 = JobHandler.AssignNewJobForCreep(creep);
        const jobCreep2 = JobHandler.AssignNewJobForCreep(creep2);
        expect(jobCreep1).not.toBe(null);
        expect(jobCreep2).not.toBe(null);
      });
      creep1Memory.type = "none";
      const nullJob = JobHandler.AssignNewJobForCreep(creep);
      expect(nullJob).toBe(null);
    });
    it("should remove secondJobId because its the same as jobId", () => {
      const job = JobHandler.CreateJob.CreateRepairJob(structure);
      const creepMemory = CreepHelper.GetCreepMemory(creep.id);
      creepMemory.jobId = job.id;
      creepMemory.secondJobId = job.id;
      const assignedJob = JobHandler.AssignNewJobForCreep(creep);
      expect(assignedJob).not.toBe(null);
      if (assignedJob === null) return;

      expect(job.id).toBe(assignedJob.id);
    });
    it("should find new job because current secondJobId is no longer available", () => {
      JobHandler.CreateJob.CreateMoveJob(roomName);
      const creepMemory = CreepHelper.GetCreepMemory(creep.id);
      creepMemory.secondJobId = "deadJob" as Id<Job>;
      const newJob = JobHandler.AssignNewJobForCreep(creep, ["move"]);
      expect(newJob).not.toBe(null);
      if (newJob === null) return;

      creepMemory.secondJobId = creepMemory.jobId;
      creepMemory.jobId = undefined;
      const newJob2 = JobHandler.AssignNewJobForCreep(creep, ["move"]);
      expect(newJob2).not.toBe(creepMemory.secondJobId);
    });
    it("should not return an job back if no jobs has an position defined", () => {
      JobHandler.CreateJob.CreateAttackJob(roomName,creep.id);
      const jobs = JobHandler.GetAllJobs(roomName);

      const closestJob = JobHandler.AssignNewJobForCreep(creep,["attack"]);
      expect(jobs.length).toBe(1);
      expect(jobs[0].position).toBeUndefined();
      expect(closestJob).toBe(null);
    })
  });
  describe("GetJob", () => {
    it("should return null because of no jobs", () => {
      const job = JobHandler.GetJob(creep.memory.jobId as Id<Job>, roomName);
      expect(job).toBe(null);
    });
    it("should return creeps job", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
      const gotJob = JobHandler.GetJob(job.id, roomName);
      expect(gotJob).toBe(job);
    });
  });
  describe("OverwriteJobList", () => {
    it("should overwrite job list", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
      JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
      JobHandler.OverwriteJobList(roomName, [job]);
      const jobs = JobHandler.GetAllJobs(roomName);
      expect(jobs.length).toBe(1);
    });
  });
  describe("UnassignJob", () => {
    it("should unassign job for structure", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      JobHandler.AssignNewJobForStructure(structure, ["move"]);
      const unassignJob = JobHandler.UnassignJob(
        job.id,
        structure.id,
        roomName
      );
      expect(unassignJob).toBe(true);
    });
    it("should unassign job for creep", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName);
      const creepMemory = CreepHelper.GetCreepMemory(creep.id);
      creepMemory.jobId = job.id;
      creepMemory.secondJobId = job.id;
      job.assignedCreepsNames.push(creep.name);
      let unassignJob = JobHandler.UnassignJob(job.id, creep.id, roomName);
      expect(unassignJob).toBe(true);

      creepMemory.jobId = job.id;
      job.assignedCreepsNames.push(creep.name);
      unassignJob = JobHandler.UnassignJob(job.id, creep.id, roomName);
      expect(unassignJob).toBe(true);

      creepMemory.secondJobId = job.id;
      job.assignedCreepsNames.push(creep.name);
      unassignJob = JobHandler.UnassignJob(job.id, creep.id, roomName);
      expect(unassignJob).toBe(true);
    });
    it("should return false", () => {
      const unassignJob = JobHandler.UnassignJob(
        "job1" as Id<Job>,
        structure.id,
        roomName
      );
      expect(unassignJob).toBe(false);
    });
  });
  describe("DeleteJob", () => {
    it("should delete job from memory", () => {
      let job = JobHandler.CreateJob.CreateMoveJob(roomName);
      const creepMemory = CreepHelper.GetCreepMemory(creep.id);
      creepMemory.jobId = job.id;
      creepMemory.secondJobId = job.id;
      job.assignedCreepsNames.push(creep.name);
      JobHandler.AssignNewJobForStructure(structure, ["move"]);

      JobHandler.DeleteJob(roomName, job.id);
      const jobs = JobHandler.GetAllJobs(roomName);
      expect(jobs.length).toBe(0);

      job = JobHandler.CreateJob.CreateMoveJob(roomName);
      creepMemory.jobId = job.id;
      creepMemory.secondJobId = undefined;
      job.assignedCreepsNames.push(creep.name);
      JobHandler.DeleteJob(roomName, job.id);

      job = JobHandler.CreateJob.CreateMoveJob(roomName);
      creepMemory.jobId = undefined;
      creepMemory.secondJobId = job.id;
      job.assignedCreepsNames.push(creep.name);
      JobHandler.DeleteJob(roomName, job.id);
    });
  });
  describe("SetJob", () => {
    it("should set new job", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
      JobHandler.SetJob(job, true);
      const jobs = JobHandler.GetAllJobs(roomName);
      expect(jobs.length).toBe(2);
      expect(jobs[0].id).toBe(job.id);
      expect(jobs[1].id).toBe(job.id);
    });
    it("should update job", () => {
      const job = JobHandler.CreateJob.CreateMoveJob(roomName, jobPos);
      job.action = "attack";
      JobHandler.SetJob(job, false);
      const jobs = JobHandler.GetAllJobs(roomName);
      expect(jobs.length).toBe(1);
      expect(jobs[0].action).toBe("attack");
    });
  });
});
