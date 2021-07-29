import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const terminal = mockInstanceOf<StructureTerminal>({});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

jest.mock("../helper");

describe("ExecuteTerminal", () => {
  it("should call all functions", () => {
    StructureActions.Terminal(terminal);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      terminal,
      true
    );
    expect(StructureHelper.ControlStorageOfTerminal).toHaveBeenCalledWith(
      terminal
    );
  });
});
