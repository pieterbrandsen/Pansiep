import { mockGlobal } from "screeps-jest";
import MemoryInitializationHandler from "../memory/initialization";
import ConsoleCommandsHandler from "./consoleCommands";

jest.mock("./logger");
jest.mock("../memory/initialization");
jest.mock("../memory/garbageCollection");
jest.mock("../room/planner/planner");

const roomName = "room";
const creepName = "creep";
const structureId = "structure" as Id<Structure>;

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      time: 1001,
      rooms: {},
      structures: {},
      creeps: {},
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );

  ConsoleCommandsHandler.AssignCommandsToHeap();
});

describe("ConsoleCommands", () => {
  it("should call InitializeGlobalMemory", () => {
    global.resetGlobalMemory();
    expect(
      MemoryInitializationHandler.InitializeGlobalMemory
    ).toHaveBeenCalled();
  });

  it("should call ResetRoomMemoryCommand", () => {
    global.resetRoomMemory(roomName);
    expect(MemoryInitializationHandler.InitializeRoomMemory).toHaveBeenCalled();
  });
  it("should call ResetStructureMemoryCommand", () => {
    global.resetStructureMemory(roomName, structureId);
    expect(
      MemoryInitializationHandler.InitializeStructureMemory
    ).toHaveBeenCalled();
  });
  it("should call ResetCreepMemoryCommand", () => {
    global.resetCreepMemory(roomName, creepName);
    expect(
      MemoryInitializationHandler.InitializeStructureMemory
    ).toHaveBeenCalled();
  });
  it("should call DeleteRoomMemoryCommand", () => {
    global.deleteRoomMemory(roomName);
    expect(
      MemoryInitializationHandler.InitializeStructureMemory
    ).toHaveBeenCalled();
  });
  it("should call DeleteStructureMemoryCommand", () => {
    global.deleteStructureMemory(roomName, structureId);
    expect(
      MemoryInitializationHandler.InitializeStructureMemory
    ).toHaveBeenCalled();
  });
  it("should call DeleteCreepMemoryCommand", () => {
    global.deleteCreepMemory(roomName, creepName);
    expect(
      MemoryInitializationHandler.InitializeStructureMemory
    ).toHaveBeenCalled();
  });
  it("should call HelpCommand", () => {
    global.help();
    expect(
      MemoryInitializationHandler.InitializeStructureMemory
    ).toHaveBeenCalled();
  });
});
