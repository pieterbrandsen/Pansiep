import { mockGlobal } from "screeps-jest";
import { loop } from "./main";
import Initialization from "./memory/initialization";

jest.mock("memory/initialization");

describe("Main loop", () => {
  it("should initialize Global memory when its undefined", () => {
    mockGlobal<Game>("Game", {});
    mockGlobal<Memory>("Memory", {}, true);

    loop();
    expect(Initialization.IsGlobalMemoryInitialized).toBeCalled();
    expect(Initialization.InitializeGlobalMemory).toBeCalled();
  });

  it("should do nothing when Global memory is already defined", () => {
    mockGlobal<Game>("Game", {});
    mockGlobal<Memory>("Memory", {}, true);
    Initialization.IsGlobalMemoryInitialized = jest.fn(() => true);

    loop();
    expect(Initialization.IsGlobalMemoryInitialized).toBeCalled();
    expect(Memory.powerCreeps).toBeUndefined();
  });
});
