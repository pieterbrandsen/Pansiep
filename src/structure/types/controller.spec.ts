import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const controller = mockInstanceOf<StructureController>({});

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

describe("ExecuteController", () => {
  it("should call all functions", () => {
    StructureActions.Controller(controller);
    expect(StructureHelper.ControlUpgradingOfController).toHaveBeenCalledWith(
      controller
    );
  });
});
