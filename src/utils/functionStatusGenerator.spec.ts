import { mockGlobal } from "screeps-jest";
import FunctionReturnHelper from "./functionStatusGenerator";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      time: 1001,
      rooms: {},
      structures: {},
      creeps: {},
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

describe("FunctionStatusGenerator", () => {
  it("should return an object with an code and response in it", () => {
    const response = FunctionReturnHelper(200, "test");
    expect(response.code).toEqual(200);
    expect(response.response).toEqual("test");
  });
});
