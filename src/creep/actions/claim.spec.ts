import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import CreepActions from "./actionsGroup";

const roomName = "room";
const creepName = "creep";
const position = new RoomPosition(0, 0, roomName);

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
const noVisionController = mockInstanceOf<StructureController>({
  room: undefined,
  id: "noVisionController",
  pos: position,
});
const controller = mockInstanceOf<StructureController>({
  room,
  id: "controller",
  pos: position,
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
      notify: jest.fn(),
    },
    true
  );
  MemoryInitializationHandler.InitializeGlobalMemory();
});

jest.mock("../../utils/logger");

describe("CreepClaimAction", () => {
  beforeEach(() => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(controller);
    creep.claimController = jest.fn().mockReturnValue(0);
  });
  it("should say something when successfully claimed controller", () => {
    const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
    creep.say = jest.fn().mockReturnValue(0);

    CreepActions.Claim(creep, job);
    expect(creep.say).toHaveBeenCalled();
  });
  it("should move to controller when not in range", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(controller);
    const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
    creep.claimController = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Claim(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
  });
  it("should delete job when target is invalid and room has vision", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(controller);
    const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
    creep.claimController = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Claim(creep, job);
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
    expect(CreepActions.Move).not.toHaveBeenCalled();
  });
  it("should move to targetRoom when not in range and there is no vision in targetRoom", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(noVisionController);
    const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
    job.roomName = "otherRoom";
    creep.claimController = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Claim(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
    expect(JobHandler.DeleteJob).not.toHaveBeenCalled();
  });
  it("should notify owner and delete job when gcl is not enough", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(controller);
    const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
    creep.claimController = jest.fn().mockReturnValue(-15);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);

    CreepActions.Claim(creep, job);
    expect(Game.notify).toHaveBeenCalled();
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
  });
  it("should do nothing", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creep);
    const job = JobHandler.CreateJob.CreateClaimJob(room, controller);
    creep.claimController = jest.fn().mockReturnValue(99);

    CreepActions.Claim(creep, job);
    expect(creep.claimController).toHaveBeenCalled();
  });
});
