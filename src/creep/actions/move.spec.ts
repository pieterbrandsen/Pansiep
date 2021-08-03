import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import JobHandler from "../../room/jobs/handler";
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
  moveTo: jest.fn(),
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

describe("CreepMoveAction", () => {
  beforeEach(() => {
    creep.moveTo = jest.fn().mockReturnValue(0);
  });
  it("should move", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);

    CreepActions.Move(creep, job);
    expect(creep.moveTo).toHaveBeenCalled();
  });
  it("should delete to target when not in range and has vision on targetRoom", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    creep.moveTo = jest.fn().mockReturnValue(-2);
    JobHandler.UnassignJob = jest.fn().mockReturnValue(0);

    CreepActions.Move(creep, job);
    expect(JobHandler.UnassignJob).toHaveBeenCalled();
  });
  it("should do nothing", () => {
    const job = JobHandler.CreateJob.CreateMoveJob(roomName);
    job.position = undefined;
    creep.moveTo = jest.fn().mockReturnValue(99);
    CreepActions.Move(creep, job);
    expect(creep.moveTo).toHaveBeenCalled();
  });
});
