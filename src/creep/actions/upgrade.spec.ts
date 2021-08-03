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
  controller: { my: false, room: { name: roomName } },
});
const controller = mockInstanceOf<StructureController>({
  id: "structure",
  room,
  pos: position,
  controller: {},
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room,
  pos: new RoomPosition(0, 0, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  say: jest.fn(),
  upgrade: jest.fn(),
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

describe("CreepUpgradeAction", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepName);
    creep.upgradeController = jest.fn().mockReturnValue(0);
    UtilsHelper.GetObject = jest.fn().mockReturnValue(controller);
  });
  it("should define work part in parts if its undefined", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.parts[WORK]).toBeUndefined();
    CreepActions.Upgrade(creep, job);
    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.upgrade
    ).toEqual(1);
  });
  it("should not override work part count in parts if its defined", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.parts[WORK] = 1;
    creep.getActiveBodyparts = jest.fn().mockClear();
    CreepActions.Upgrade(creep, job);

    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.upgrade
    ).toEqual(1);
  });
  it("should unassign job", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.type = "pioneer";

    creep.upgradeController = jest.fn().mockReturnValue(-6);
    JobHandler.AssignNewJobForCreep = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    CreepActions.Upgrade(creep, job);
    creepMemory.type = "claim";

    CreepActions.Upgrade(creep, job);
    CreepActions.Upgrade(creep, job);
    expect(creep.upgradeController).toHaveBeenCalledTimes(3);
    expect(job.assignedCreepsNames.length).toBe(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move if not in range", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    creep.upgradeController = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(jest.fn());
    CreepActions.Upgrade(creep, job);
    expect(creep.upgradeController).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toBeCalledWith(creep, job);
  });
  it("should delete job if invalid target and has vision in room", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);

    creep.upgradeController = jest.fn().mockReturnValue(-7);
    CreepActions.Upgrade(creep, job);
    expect(creep.upgradeController).toHaveBeenCalledTimes(1);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move to targetRoom if invalid target and has no vision in room", () => {
    creep.room.controller = mockInstanceOf<StructureController>({
      room: undefined,
      my: false,
      pos: position,
    });
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    CreepActions.Move = jest.fn().mockReturnValue(0);
    creep.upgradeController = jest.fn().mockReturnValue(-7);

    CreepActions.Upgrade(creep, job);
    expect(creep.upgradeController).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toHaveBeenCalledTimes(1);
  });
  it("should default break", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);

    creep.upgradeController = jest.fn().mockReturnValue(99);
    CreepActions.Upgrade(creep, job);
    expect(creep.upgradeController).toHaveBeenCalledTimes(1);
  });
  it("should delete job if controller is undefined or job is finished", () => {
    const job = JobHandler.CreateJob.CreateUpgradeJob(controller);
    job.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    job.energyRequired = 0;

    CreepActions.Upgrade(creep, job);
    expect(creep.upgradeController).toHaveBeenCalledTimes(0);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
});
