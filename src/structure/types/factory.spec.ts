import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const factory = mockInstanceOf<StructureFactory>({});

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

describe("ExecuteFactory", () => {
  it("should call all functions", () => {
    StructureActions.Factory(factory);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      factory
    );
  });
});
