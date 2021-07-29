import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const extension = mockInstanceOf<StructureExtension>({});

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

describe("ExecuteExtension", () => {
  it("should call all functions", () => {
    StructureActions.Extension(extension);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      extension
    );
    expect(StructureHelper.KeepStructureFullEnough).toHaveBeenCalledWith(
      extension,
      100,
      RESOURCE_ENERGY
    );
  });
});
