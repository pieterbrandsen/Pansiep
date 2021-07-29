import { mockGlobal } from "screeps-jest";
import { loop } from "./main";
import StatsHandler from "./memory/stats";
import UpdateCacheHandler from "./memory/updateCache";
import RoomManager from "./room/loop";
import MemoryInitializationHandler from "./memory/initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      rooms: {},
      structures: {},
      creeps: {},
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );

  jest.spyOn(UpdateCacheHandler, "UpdateAll").mockReturnValue();
  jest.spyOn(StatsHandler, "GlobalStatsPreProcessing").mockReturnValue();
  jest.spyOn(RoomManager, "Run").mockReturnValue();
  jest.spyOn(StatsHandler, "GlobalStats").mockReturnValue();
});

jest.mock("./memory/initialization");
jest.mock("./utils/logger");

describe("MainLoop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MemoryInitializationHandler.AreHeapVarsValid = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.IsGlobalMemoryInitialized = jest
      .fn()
      .mockReturnValue(true);
  });
  it("should initialize custom properties and fail", () => {
    MemoryInitializationHandler.AreCustomPrototypesInitialized = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(false);
    loop();
    expect(
      MemoryInitializationHandler.AreCustomPrototypesInitialized
    ).toHaveBeenCalledTimes(2);
    expect(MemoryInitializationHandler.AreHeapVarsValid).toHaveBeenCalledTimes(
      0
    );
  });
  it("should initialize custom properties and succeed", () => {
    MemoryInitializationHandler.AreCustomPrototypesInitialized = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    MemoryInitializationHandler.AreHeapVarsValid = jest
      .fn()
      .mockReturnValue(true);
    loop();

    expect(
      MemoryInitializationHandler.AreCustomPrototypesInitialized
    ).toHaveBeenCalledTimes(2);
    expect(MemoryInitializationHandler.AreHeapVarsValid).toHaveBeenCalledTimes(
      1
    );
  });
  it("should initialize heap vars and fail", () => {
    MemoryInitializationHandler.AreCustomPrototypesInitialized = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.AreHeapVarsValid = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(false);
    loop();
    expect(MemoryInitializationHandler.AreHeapVarsValid).toHaveBeenCalledTimes(
      2
    );
    expect(
      MemoryInitializationHandler.IsGlobalMemoryInitialized
    ).toHaveBeenCalledTimes(0);
  });
  it("should initialize heap vars and succeed", () => {
    MemoryInitializationHandler.AreCustomPrototypesInitialized = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.IsGlobalMemoryInitialized = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.AreHeapVarsValid = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    loop();

    expect(MemoryInitializationHandler.AreHeapVarsValid).toHaveBeenCalledTimes(
      2
    );
    expect(
      MemoryInitializationHandler.IsGlobalMemoryInitialized
    ).toHaveBeenCalledTimes(1);
  });
  it("should initialize global memory and fail", () => {
    MemoryInitializationHandler.AreCustomPrototypesInitialized = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.AreHeapVarsValid = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.IsGlobalMemoryInitialized = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(false);
    loop();
    expect(
      MemoryInitializationHandler.IsGlobalMemoryInitialized
    ).toHaveBeenCalledTimes(2);
  });
  it("should initialize global memory and succeed", () => {
    MemoryInitializationHandler.AreCustomPrototypesInitialized = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.AreHeapVarsValid = jest
      .fn()
      .mockReturnValue(true);
    MemoryInitializationHandler.IsGlobalMemoryInitialized = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    loop();

    expect(
      MemoryInitializationHandler.IsGlobalMemoryInitialized
    ).toHaveBeenCalledTimes(2);
    expect(UpdateCacheHandler.UpdateAll).toHaveBeenCalledTimes(1);
  });
});
