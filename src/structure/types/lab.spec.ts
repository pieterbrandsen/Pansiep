import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const lab = mockInstanceOf<StructureLab>({});

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

describe("ExecuteLab", () => {
  it("should call all functions", () => {
    StructureActions.Lab(lab);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(lab);
    expect(StructureHelper.KeepStructureFullEnough).toHaveBeenCalledWith(
      lab,
      100,
      RESOURCE_ENERGY
    );
  });
});
