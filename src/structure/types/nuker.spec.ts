import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const nuker = mockInstanceOf<StructureNuker>({});

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

describe("ExecuteNuker", () => {
  it("should call all functions", () => {
    StructureActions.Nuker(nuker);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      nuker
    );
  });
});
