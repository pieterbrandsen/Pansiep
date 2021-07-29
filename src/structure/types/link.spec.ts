import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const link = mockInstanceOf<StructureLink>({});

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

describe("ExecuteLink", () => {
  it("should call all functions", () => {
    StructureActions.Link(link);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(link);
    expect(StructureHelper.ControlStorageOfLink).toHaveBeenCalledWith(link);
  });
});
