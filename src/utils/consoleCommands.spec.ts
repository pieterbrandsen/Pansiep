import { mockGlobal } from "screeps-jest";
import ConsoleCommands from "./consoleCommands";
import { loop as Loop } from "../main";

import Logger from "./logger";

jest.mock("./logger");
jest.mock("../memory/initialization");
jest.mock("../memory/updateCache");
jest.mock("../room/loop");
jest.mock("../memory/garbageCollection");

const roomName = "room";
const creepName = "creep";
const id = "3";

describe("Keep functions usable in console defined", () => {
  it("should have assigned all functions to the heap after the loop", () => {
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined) });
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Memory>("Memory", {}, true);

    expect(global.help).toBeUndefined();
    const assignCommandsToHeap = jest
      .spyOn(ConsoleCommands, "AssignCommandsToHeap")
      .mockImplementation(() => {
        return true;
      });
    Loop();
    expect(ConsoleCommands.AssignCommandsToHeap).toHaveBeenCalled();
    assignCommandsToHeap.mockRestore();
    expect(ConsoleCommands.AssignCommandsToHeap()).toBeTruthy();
  });

  it("should return a string when called without the word 'error'", () => {
    // mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Game>("Game", { rooms: {}, structures: {}, creeps: {} });

    ConsoleCommands.HelpCommand();

    ConsoleCommands.ResetGlobalMemoryCommand();
    ConsoleCommands.ResetRoomMemoryCommand(roomName);
    ConsoleCommands.ResetStructureMemoryCommand(id, roomName);
    ConsoleCommands.ResetCreepMemoryCommand(creepName, roomName);

    ConsoleCommands.DeleteRoomMemoryCommand(roomName);
    ConsoleCommands.DeleteStructureMemoryCommand(id);
    ConsoleCommands.DeleteCreepMemoryCommand(creepName);

    expect(Logger.Error).not.toBeCalled();
  });
});
