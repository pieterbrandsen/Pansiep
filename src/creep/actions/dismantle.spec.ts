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
  pos: position,
  structureType: "container",
  room,
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
  UtilsHelper.GetObject = jest.fn().mockReturnValue(structure);
});

jest.mock("../../utils/logger");

describe("CreepDismantleAction", () => {
  beforeEach(() => {
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(roomName, creepName);
    creep.dismantle = jest.fn().mockReturnValue(0);
    UtilsHelper.GetObject = jest.fn().mockReturnValue(structure);
  });
  it("should define work part in parts if its undefined", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    expect(creepMemory.parts[WORK]).toBeUndefined();
    CreepActions.Dismantle(creep, job);
    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyIncome.dismantle
    ).toEqual(0.25);
  });
  it("should not override work part count in parts if its defined", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    const creepMemory = CreepHelper.GetCreepMemory(creepName);
    creepMemory.parts[WORK] = 1;
    creep.getActiveBodyparts = jest.fn().mockClear();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyIncome.dismantle
    ).toEqual(0);
    CreepActions.Dismantle(creep, job);

    expect(creepMemory.parts[WORK]).toBeDefined();
    expect(
      global.preProcessingStats.rooms[creep.room.name].energyIncome.dismantle
    ).toEqual(0.25);
  });
  it("should move if not in range", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.dismantle = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(jest.fn());

    CreepActions.Dismantle(creep, job);
    expect(creep.dismantle).toHaveBeenCalledTimes(1);
    expect(CreepActions.Move).toBeCalledWith(creep, job);
  });
  it("should delete job when not in range and has vision on targetRoom", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.dismantle = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);

    CreepActions.Dismantle(creep, job);
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
  });
  it("should move to targetRoom when not in range and has no vision in targetRoom", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(
      mockInstanceOf<Structure>({ room: undefined, id: "str" })
    );
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.dismantle = jest.fn().mockReturnValue(-7);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Dismantle(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
  });
  it("should default break", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);

    creep.dismantle = jest.fn().mockReturnValue(99);
    CreepActions.Dismantle(creep, job);
    expect(creep.dismantle).toHaveBeenCalledTimes(1);
  });
});
