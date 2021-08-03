import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import CreepHelper from "../helper";
import CreepActions from "./actionsGroup";

const roomName = "room";
const creepName = "creep";
const position = new RoomPosition(0, 0, roomName);

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  lookForAtArea: jest.fn().mockReturnValue([]),
  controller: undefined,
});
const structure = mockInstanceOf<Structure>({
  id: "structure",
  room,
  pos: position,
  structureType: STRUCTURE_CONTAINER,
  hitsMax: 1,
  hits: 0,
  store: {
    getUsedCapacity: jest.fn().mockReturnValue(100),
    getFreeCapacity: jest.fn().mockReturnValue(100),
  },
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room: { name: roomName },
  pos: new RoomPosition(0, 0, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  say: jest.fn(),
  transfer: jest.fn(),
  store: {
    getUsedCapacity: jest.fn().mockReturnValue(100),
    getFreeCapacity: jest.fn().mockReturnValue(100),
  },
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

jest.mock("../../utils/logger");

describe("CreepTransferAction", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepName);
    creep.transfer = jest.fn().mockReturnValue(0);
    UtilsHelper.GetObject = jest.fn().mockReturnValue(structure);
  });
  it("should say something when successfully transfer resources", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    creep.transfer = jest.fn().mockReturnValue(0);

    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalled();
  });
  it("should unassign job if an new one was found", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.type = "pioneer";

    creep.transfer = jest.fn().mockReturnValue(-6);
    JobHandler.AssignNewJobForCreep = jest.fn().mockReturnValue(true);
    CreepActions.Transfer(creep, job);
    creepMemory.type = "heal";
    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(2);
    expect(job.assignedCreepsNames.length).toBe(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move if not in range", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    job.assignedCreepsNames.push(creepName);

    creep.transfer = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(jest.fn());
    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toBeCalledWith(creep, job);
  });
  it("should delete job if invalid target and has vision in room", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);

    creep.transfer = jest.fn().mockReturnValue(-7);
    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(1);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move to targetRoom if invalid target and has no vision in room", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(
      mockInstanceOf<Structure>({
        room: undefined,
        pos: position,
        structureType: "constructedWall",
        store: {
          getUsedCapacity: jest.fn().mockReturnValue(100),
          getFreeCapacity: jest.fn().mockReturnValue(100),
        },
      })
    );
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    CreepActions.Move = jest.fn().mockReturnValue(0);
    creep.transfer = jest.fn().mockReturnValue(-7);

    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toHaveBeenCalledTimes(1);
  });
  it("should delete job if target is full", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    const creepMemory = CreepHelper.GetCreepMemory(creepName);

    creep.transfer = jest.fn().mockReturnValue(-8);
    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(1);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should default break", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );

    creep.transfer = jest.fn().mockReturnValue(99);
    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(1);
  });
  it("should not transfer when target got enough energy", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    job.energyRequired = -1;

    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(0);
  });
  it("should unassign job when creep has no resources and find an income job", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    JobHandler.AssignNewJobForCreep = jest.fn().mockReturnValue(true);
    JobHandler.UnassignJob = jest.fn().mockReturnValue(true);
    creep.store.getUsedCapacity = jest.fn().mockReturnValue(0);

    CreepActions.Transfer(creep, job);

    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.type = "work";
    CreepActions.Transfer(creep, job);
    expect(creep.transfer).toHaveBeenCalledTimes(0);
    expect(JobHandler.AssignNewJobForCreep).toHaveBeenCalledTimes(2);
    expect(JobHandler.UnassignJob).toHaveBeenCalledTimes(2);
  });
  it("should unassign current transferSource job when creep has no resources and set secondJobId to jobId", () => {
    const job = JobHandler.CreateJob.CreateTransferJob(
      structure,
      100,
      "G",
      "transfer"
    );
    job.action = "transferSource";
    JobHandler.UnassignJob = jest.fn().mockReturnValue(true);
    creep.store.getUsedCapacity = jest.fn().mockReturnValue(0);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    const jobId = "job" as Id<Job>;
    creepMemory.secondJobId = jobId;

    CreepActions.Transfer(creep, job);
    expect(creepMemory.jobId).toBe(jobId);
    expect(creep.transfer).toHaveBeenCalledTimes(0);
    expect(JobHandler.UnassignJob).toHaveBeenCalledTimes(1);
  });
});
