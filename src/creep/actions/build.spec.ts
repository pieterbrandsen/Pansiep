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
const csSite = mockInstanceOf<ConstructionSite>({
  pos: position,
  structureType: "container",
  room,
});
const csSiteWithoutVision = mockInstanceOf<ConstructionSite>({
  pos: position,
  structureType: "container",
  room: undefined,
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room: { name: roomName },
  pos: new RoomPosition(0, 0, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
  say: jest.fn(),
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

describe("CreepBuildAction", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepName);
    creep.build = jest.fn().mockReturnValue(0);
    UtilsHelper.GetObject = jest.fn().mockReturnValue(csSite);
  });
  it("should define work part in parts if its undefined", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.parts[WORK]).toBeUndefined();
    CreepActions.Build(creep, buildJob);
    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.build
    ).toEqual(5);
  });
  it("should not override work part count in parts if its defined", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.parts[WORK] = 1;
    creep.getActiveBodyparts = jest.fn().mockClear();
    CreepActions.Build(creep, buildJob);

    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.build
    ).toEqual(5);
  });
  it("should unassign job if an new one was found", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    buildJob.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.type = "pioneer";

    creep.build = jest.fn().mockReturnValue(-6);
    JobHandler.AssignNewJobForCreep = jest.fn().mockReturnValue(true);
    CreepActions.Build(creep, buildJob);
    expect(creep.build).toHaveBeenCalledTimes(1);
    expect(buildJob.assignedCreepsNames.length).toBe(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should do nothing with job if not an new one was found", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    buildJob.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.type = "claim";

    creep.build = jest.fn().mockReturnValue(-6);
    JobHandler.AssignNewJobForCreep = jest.fn().mockReturnValue(false);
    CreepActions.Build(creep, buildJob);
    expect(creep.build).toHaveBeenCalledTimes(1);
    expect(buildJob.assignedCreepsNames.length).toBe(1);
  });
  it("should move if not in range", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    buildJob.assignedCreepsNames.push(creepName);

    creep.build = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(jest.fn());
    CreepActions.Build(creep, buildJob);
    expect(creep.build).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toBeCalledWith(creep, buildJob);
  });
  it("should delete job if invalid target and has vision in room", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    buildJob.assignedCreepsNames.push(creepName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);

    creep.build = jest.fn().mockReturnValue(-7);
    CreepActions.Build(creep, buildJob);
    expect(creep.build).toHaveBeenCalledTimes(1);
    expect(Memory.rooms[roomName].jobs.length).toEqual(0);
    expect(creepMemory.jobId).toBeUndefined();
  });
  it("should move to targetRoom if invalid target and has no vision in room", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(csSiteWithoutVision);
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );
    CreepActions.Move = jest.fn().mockReturnValue(0);
    creep.build = jest.fn().mockReturnValue(-7);

    CreepActions.Build(creep, buildJob);
    expect(creep.build).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toHaveBeenCalledTimes(1);
  });
  it("should default break", () => {
    const buildJob = JobHandler.CreateJob.CreateBuildJob(
      room,
      position,
      "container"
    );

    creep.build = jest.fn().mockReturnValue(99);
    CreepActions.Build(creep, buildJob);
    expect(creep.build).toHaveBeenCalledTimes(1);
  });
});
