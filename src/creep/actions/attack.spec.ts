import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
import UtilsHelper from "../../utils/helper";
import CreepActions from "./actionsGroup";

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
const creepWithoutVision = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room: undefined,
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

jest.mock("../../utils/logger");

describe("CreepAttackAction", () => {
  beforeEach(() => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creep);
    creep.attack = jest.fn().mockReturnValue(0);
  });
  it("should say something when successfully attacked", () => {
    const job = JobHandler.CreateJob.CreateAttackJob(roomName, creep.id);
    creep.say = jest.fn().mockReturnValue(0);

    CreepActions.Attack(creep, job);
    expect(creep.say).toHaveBeenCalled();
  });
  it("should move to target when not in range", () => {
    const job = JobHandler.CreateJob.CreateAttackJob(roomName, creep.id);
    creep.attack = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Attack(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
  });
  it("should delete to target when not in range and has vision on targetRoom", () => {
    const job = JobHandler.CreateJob.CreateAttackJob(roomName, creep.id);
    creep.attack = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);

    CreepActions.Attack(creep, job);
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
  });
  it("should move to targetRoom when not in range and has no vision in targetRoom", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creepWithoutVision);
    const job = JobHandler.CreateJob.CreateAttackJob(roomName, creep.id);
    job.roomName = "otherRoom";
    creep.attack = jest.fn().mockReturnValue(-7);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Attack(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
  });
  it("should do nothing", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creep);
    const job = JobHandler.CreateJob.CreateAttackJob(roomName, creep.id);
    creep.attack = jest.fn().mockReturnValue(99);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Attack(creep, job);
    expect(creep.attack).toHaveBeenCalled();
  });
});
