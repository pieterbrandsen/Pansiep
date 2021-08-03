import { mockInstanceOf, mockGlobal } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import CreepHelper from "../helper";
import CreepActions from "./actionsGroup";

const roomName = "room";
const creepName = "creep";

const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockReturnValue([]),
  lookForAtArea: jest.fn().mockReturnValue([]),
  controller: undefined,
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room: { name: roomName },
  pos: new RoomPosition(0, 0, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  say: jest.fn(),
  store: {},
});
const source = mockInstanceOf<Source>({
  id: "source",
  room,
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

describe("CreepHarvestAction", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepName);
    UtilsHelper.GetObject = jest.fn().mockReturnValue(source);
    creep.harvest = jest.fn().mockReturnValue(0);
    creep.store.getFreeCapacity = jest.fn().mockReturnValue(1);
  });
  it("should define work part in parts if its undefined", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.parts[WORK]).toBeUndefined();
    CreepActions.Harvest(creep, job);
    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyIncome.harvest
    ).toEqual(2);
  });
  it("should not override work part count in parts if its defined", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.parts[WORK] = 1;
    creep.getActiveBodyparts = jest.fn().mockClear();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyIncome.harvest
    ).toEqual(0);
    CreepActions.Harvest(creep, job);

    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyIncome.harvest
    ).toEqual(2);
  });
  it("should move if not in range", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.harvest = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(jest.fn());

    CreepActions.Harvest(creep, job);
    expect(creep.harvest).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toBeCalledWith(creep, job);
  });
  it("should delete job when not in range and has vision on targetRoom", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.harvest = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);

    CreepActions.Harvest(creep, job);
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
  });
  it("should move to targetRoom when not in range and has no vision in targetRoom", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(
      mockInstanceOf<Source>({ room: undefined, id: "src" })
    );
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.harvest = jest.fn().mockReturnValue(-7);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Harvest(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
  });
  it("should default break", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);

    creep.harvest = jest.fn().mockReturnValue(99);
    CreepActions.Harvest(creep, job);
    expect(creep.harvest).toHaveBeenCalledTimes(1);
  });
  it("assign an transferSource job if free capacity is 0", () => {
    creep.store.getFreeCapacity = jest.fn().mockReturnValue(0);
    const transferSource = JobHandler.CreateJob.CreateMoveJob(roomName);
    transferSource.action = "transferSource";
    const harvestJob = JobHandler.CreateJob.CreateMoveJob(roomName);

    CreepActions.Harvest(creep, harvestJob);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.jobId).toBe(transferSource.id);
    expect(creepMemory.secondJobId).toBe(harvestJob.id);
  });
  it("should unassign harvest job if no transferSource job was found", () => {
    creep.store.getFreeCapacity = jest.fn().mockReturnValue(0);
    const harvestJob = JobHandler.CreateJob.CreateMoveJob(roomName);

    CreepActions.Harvest(creep, harvestJob);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.jobId).toBeUndefined();
  });
});
