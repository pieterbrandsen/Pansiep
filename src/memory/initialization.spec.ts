import { mockGlobal } from "screeps-jest";
import Initialization from "./initialization";

const roomName = "E40";
const id = "34";

describe("Initialization of memory", () => {
  it("should initialize all required memory paths", () => {
    mockGlobal<Game>("Game", {
      notify: jest.fn(() => undefined),
      rooms: {},
      time: 5000,
      structures: {},
      creeps: {},
    });
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Memory>("Memory", {});

    Initialization.InitializeGlobalMemory();
    expect(Memory).toBeDefined();
    expect(Initialization.InitializeGlobalMemory()).toBeTruthy();

    Initialization.InitializeRoomMemory(roomName);
    expect(Memory.rooms[roomName]).toBeDefined();
    expect(Initialization.InitializeRoomMemory(roomName)).toBeTruthy();

    Initialization.InitializeStructureMemory(id, roomName);
    expect(Memory.structures[id]).toBeDefined();
    expect(Initialization.InitializeStructureMemory(id, roomName)).toBeTruthy();

    Initialization.InitializeCreepMemory(id, roomName);
    expect(Memory.creeps[id]).toBeDefined();
    expect(Initialization.InitializeCreepMemory(id, roomName)).toBeTruthy();
  });

  it("should return correctly if memory is initialized", () => {
    mockGlobal<Memory>("Memory", { powerCreeps: undefined });
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined) });

    expect(Initialization.IsGlobalMemoryInitialized()).toBeFalsy();
    Initialization.InitializeGlobalMemory();
    expect(Initialization.IsGlobalMemoryInitialized()).toBeTruthy();

    expect(Initialization.IsRoomMemoryInitialized(roomName)).toBeFalsy();
    Initialization.InitializeRoomMemory(roomName);
    expect(Initialization.IsRoomMemoryInitialized(roomName)).toBeTruthy();

    expect(Initialization.IsStructureMemoryInitialized(id)).toBeFalsy();
    Initialization.InitializeStructureMemory(id, roomName);
    expect(Initialization.IsStructureMemoryInitialized(id)).toBeTruthy();

    expect(Initialization.IsCreepMemoryInitialized(id)).toBeFalsy();
    Initialization.InitializeCreepMemory(id, roomName);
    expect(Initialization.IsCreepMemoryInitialized(id)).toBeTruthy();
  });

  it("should error when initialization", () => {
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined) });
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    (global as any).Memory = null; // eslint-disable-line @typescript-eslint/no-explicit-any

    expect(Initialization.IsRoomMemoryInitialized(roomName)).toBeFalsy();
    expect(Initialization.IsStructureMemoryInitialized(id)).toBeFalsy();
    expect(Initialization.IsCreepMemoryInitialized(id)).toBeFalsy();

    expect(Initialization.InitializeRoomMemory(roomName)).toBeFalsy();
    expect(Initialization.InitializeStructureMemory(id, roomName)).toBeFalsy();
    expect(Initialization.InitializeCreepMemory(id, roomName)).toBeFalsy();
  });
});
