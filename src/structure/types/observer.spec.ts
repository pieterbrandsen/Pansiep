import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const observer = mockInstanceOf<StructureObserver>({});

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

describe("ExecuteObserver", () => {
  it("should call all functions", () => {
    StructureActions.Observer(observer);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      observer
    );
  });
});
