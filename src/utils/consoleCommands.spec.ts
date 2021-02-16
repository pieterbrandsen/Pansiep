import { mockGlobal } from "screeps-jest";
import ConsoleCommands from "./consoleCommands";
import { loop as Loop } from "../main";

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
    ConsoleCommands.AssignCommandsToHeap();
    expect(global.help).toBeDefined();
  });

  it("should return a string when called", () => {
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Memory>("Memory", {}, true);

    expect(ConsoleCommands.HelpCommand()).toBeDefined();
  });
});
