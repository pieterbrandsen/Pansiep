import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../memory/initialization";
import StatsHandler from "../memory/stats";
import UtilsHelper from "../utils/helper";
import StructureHelper from "./helper";
import StructureManager from "./loop";

const roomName = "room";
const structure = mockInstanceOf<Structure>({});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      getObjectById: jest.fn().mockReturnValue(structure),
    },
    true
  );

  StatsHandler.StructureStatsPreProcessing = jest.fn();
  StructureHelper.ExecuteStructure = jest.fn();
});

describe("StructureManager", () => {
  beforeEach(() => {
    UtilsHelper.GetObject = jest.fn().mockReturnValue(structure);
  });
  it("should run all structure loop", () => {
    const structureIds = ["1", "2", "3"];
    StructureHelper.GetAllStructureIds = jest
      .fn()
      .mockReturnValue(structureIds);
    MemoryInitializationHandler.IsStructureMemoryInitialized = jest
      .fn()
      .mockReturnValue(true);
    StructureManager.Run(roomName);

    MemoryInitializationHandler.IsStructureMemoryInitialized = jest
      .fn()
      .mockReturnValue(false);
    StructureManager.Run(roomName);
    expect(UtilsHelper.GetObject).toHaveBeenCalledTimes(3);
  });
  it("should run an structure", () => {
    StructureManager.RunStructure("a" as Id<Structure>);
    expect(UtilsHelper.GetObject).toHaveBeenCalledWith("a");
  });
  it("should not run structure if its not found", () => {
    jest.clearAllMocks();
    StructureHelper.GetAllStructureIds = jest.fn().mockReturnValue(["1"]);
    StructureHelper.GetStructure = jest.fn().mockReturnValue(undefined);
    MemoryInitializationHandler.IsStructureMemoryInitialized = jest
      .fn()
      .mockReturnValue(true);

    StructureManager.Run(roomName);
    expect(StatsHandler.StructureStatsPreProcessing).toHaveBeenCalledTimes(0);
  });
});
