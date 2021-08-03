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
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room: { name: roomName },
  pos: new RoomPosition(0, 0, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  say: jest.fn(),
  repair: jest.fn(),
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

describe("CreepRepairAction", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepName);
    creep.repair = jest.fn().mockReturnValue(0);
    UtilsHelper.GetObject = jest.fn().mockReturnValue(structure);
  });
  it("should define work part in parts if its undefined", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.parts[WORK]).toBeUndefined();
    CreepActions.Repair(creep, job);
    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.repair
    ).toEqual(1);
  });
  it("should not override work part count in parts if its defined", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.parts[WORK] = 1;
    creep.getActiveBodyparts = jest.fn().mockClear();
    CreepActions.Repair(creep, job);

    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.repair
    ).toEqual(1);
  });
  it("should unassign job if an new one was found", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.type = "pioneer";

    creep.repair = jest.fn().mockReturnValue(-6);
    JobHandler.AssignNewJobForCreep = jest.fn().mockReturnValue(true);
    CreepActions.Repair(creep, job);
    creepMemory.type = "heal";
    CreepActions.Repair(creep, job);
    expect(creep.repair).toHaveBeenCalledTimes(2);
    expect(job.assignedCreepsNames.length).toBe(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move if not in range", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    job.assignedCreepsNames.push(creepName);

    creep.repair = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(jest.fn());
    CreepActions.Repair(creep, job);
    expect(creep.repair).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toBeCalledWith(creep, job);
  });
  it("should delete job if invalid target and has vision in room", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);

    creep.repair = jest.fn().mockReturnValue(-7);
    CreepActions.Repair(creep, job);
    expect(creep.repair).toHaveBeenCalledTimes(1);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move to targetRoom if invalid target and has no vision in room", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(
      mockInstanceOf<Structure>({
        room: undefined,
        hits: 0,
        hitsMax: 1,
        pos: position,
        structureType: "constructedWall",
      })
    );
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    CreepActions.Move = jest.fn().mockReturnValue(0);
    creep.repair = jest.fn().mockReturnValue(-7);

    CreepActions.Repair(creep, job);
    expect(creep.repair).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toHaveBeenCalledTimes(1);
  });
  it("should default break", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);

    creep.repair = jest.fn().mockReturnValue(99);
    CreepActions.Repair(creep, job);
    expect(creep.repair).toHaveBeenCalledTimes(1);
  });
  it("should delete job if structure is not damaged anymore", () => {
    const job = JobHandler.CreateJob.CreateRepairJob(structure);
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    structure.hits = structure.hitsMax;

    CreepActions.Repair(creep, job);
    expect(creep.repair).toHaveBeenCalledTimes(0);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
});
