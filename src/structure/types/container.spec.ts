import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const container = mockInstanceOf<StructureContainer>({});

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

describe("ExecuteContainer", () => {
  it("should call all functions", () => {
    StructureActions.Container(container);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      container
    );
    expect(StructureHelper.ControlStorageOfContainer).toHaveBeenCalledWith(
      container
    );
  });
});
