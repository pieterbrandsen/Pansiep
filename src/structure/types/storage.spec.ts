import { mockGlobal, mockInstanceOf } from "screeps-jest";
import StructureHelper from "../helper";
import StructureActions from "./actionsGroup";

const storage = mockInstanceOf<StructureStorage>({});

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

describe("ExecuteStorage", () => {
  it("should call all functions", () => {
    StructureActions.Storage(storage);
    expect(StructureHelper.ControlDamagedStructures).toHaveBeenCalledWith(
      storage,
      true
    );
    expect(StructureHelper.ControlStorageOfStorage).toHaveBeenCalledWith(
      storage
    );
  });
});
