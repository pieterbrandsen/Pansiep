import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../memory/initialization";
import StatsHandler from "../memory/stats";
import UtilsHelper from "../utils/helper";
import CreepHelper from "./helper";
import CreepManager from "./loop";

const roomName = "room";
const creepName = "creep";
const creep = mockInstanceOf<Creep>({
  name: creepName,
  room: { name: roomName },
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", { creeps: {} });
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      creeps: {
        [creepName]: creep,
      },
    },
    true
  );

  StatsHandler.CreepStatsPreProcessing = jest.fn();
  CreepHelper.ControlCreepHealing = jest.fn();
  CreepHelper.ExecuteJob = jest.fn();
});

describe("CreepManager", () => {
  beforeEach(() => {
    Memory.creeps[creepName] = {
      commandRoom: roomName,
      parts: {},
      type: "none",
    };
    UtilsHelper.GetObject = jest.fn().mockReturnValue(creep);
  });
  it("should run all creeps loop", () => {
    const creepIds = [creepName, creepName, creepName];
    CreepHelper.GetCreep = jest.fn().mockReturnValue(creep);
    CreepHelper.GetCachedCreepIds = jest.fn().mockReturnValue(creepIds);
    MemoryInitializationHandler.IsCreepMemoryInitialized = jest
      .fn()
      .mockReturnValue(true);
    CreepManager.Run(roomName);

    MemoryInitializationHandler.IsCreepMemoryInitialized = jest
      .fn()
      .mockReturnValue(false);
    CreepManager.Run(roomName);
    expect(CreepHelper.GetCreep).toHaveBeenCalledTimes(3);
  });
  it("should run an creep and try execute job", () => {
    Memory.creeps[creepName].jobId = "a" as Id<Job>;

    CreepManager.RunCreep(creepName);
    expect(CreepHelper.ExecuteJob).toHaveBeenCalled();
  });
  it("should not run creep if its not found", () => {
    jest.clearAllMocks();
    CreepHelper.GetCachedCreepIds = jest.fn().mockReturnValue(["1"]);
    CreepHelper.GetCreep = jest.fn().mockReturnValue(undefined);
    MemoryInitializationHandler.IsCreepMemoryInitialized = jest
      .fn()
      .mockReturnValue(true);

    CreepManager.Run(roomName);
    expect(StatsHandler.CreepStatsPreProcessing).toHaveBeenCalledTimes(0);
  });
});
