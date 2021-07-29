import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const road = mockInstanceOf<StructureRoad>({});

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

describe("ExecuteRoad", () => {
  it("should call all functions", () => {
    StructureActions.Road(road);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(road);
  });
});
