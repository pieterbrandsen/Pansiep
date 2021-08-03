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
  hits: 0,
  hitsMax: 1,
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

describe("CreepHealAction", () => {
  beforeEach(() => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creep);
    creep.heal = jest.fn().mockReturnValue(0);
    creep.hits = 0;
    creep.hitsMax = 1;
  });
  it("should say something when successfully healed creep", () => {
    const job = JobHandler.CreateJob.CreateHealJob(creep);
    creep.say = jest.fn().mockReturnValue(0);

    CreepActions.Heal(creep, job);
    expect(creep.say).toHaveBeenCalled();
  });
  it("should move to creep when not in range", () => {
    const job = JobHandler.CreateJob.CreateHealJob(creep);
    creep.heal = jest.fn().mockReturnValue(-9);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Heal(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
  });
  it("should delete job when target is invalid and room has vision", () => {
    const job = JobHandler.CreateJob.CreateHealJob(creep);
    creep.heal = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Heal(creep, job);
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
    expect(CreepActions.Move).not.toHaveBeenCalled();
  });
  it("should move to targetRoom when not in range and there is no vision in targetRoom", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(
      mockInstanceOf<Creep>({ room: undefined, hits: 0, hitsMax: 1 })
    );
    const job = JobHandler.CreateJob.CreateHealJob(creep);
    creep.heal = jest.fn().mockReturnValue(-7);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);
    CreepActions.Move = jest.fn().mockReturnValue(0);

    CreepActions.Heal(creep, job);
    expect(CreepActions.Move).toHaveBeenCalled();
    expect(JobHandler.DeleteJob).not.toHaveBeenCalled();
  });
  it("should do nothing", () => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creep);
    const job = JobHandler.CreateJob.CreateHealJob(creep);
    creep.heal = jest.fn().mockReturnValue(99);

    CreepActions.Heal(creep, job);
    expect(creep.heal).toHaveBeenCalled();
  });
  it("should delete job when healing is supposed to stop at max health", () => {
    creep.hits = creep.hitsMax;
    const job = JobHandler.CreateJob.CreateHealJob(creep);
    creep.heal = jest.fn().mockReturnValue(99);
    JobHandler.DeleteJob = jest.fn().mockReturnValue(0);

    CreepActions.Heal(creep, job);
    expect(JobHandler.DeleteJob).toHaveBeenCalled();
  });
});
