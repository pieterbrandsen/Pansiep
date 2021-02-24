import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { isUndefined } from "lodash";
import { GetCreep, GetAllCreepNames } from "./helper";
import { FunctionReturnCodes } from "../utils/constants/global";

mockGlobal<Game>(
  "Game",
  {
    cpu: {
      getUsed: () => {
        return 1;
      },
    },
  },
  true
);

describe("Creep helper", () => {
  describe("GetCreep method", () => {
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({ memory: {} });
      Game.creeps = { creep };

      const getCreep = GetCreep("creep");
      expect(getCreep.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(getCreep.response === creep).toBeTruthy();
    });
    it("should return NOT_FOUND", () => {
      Game.creeps = {};

      const getCreep = GetCreep("creep");
      expect(getCreep.code === FunctionReturnCodes.NOT_FOUND).toBeTruthy();
      expect(isUndefined(getCreep.response)).toBeTruthy();
    });
  });

  describe("GetAllCreepNames method", () => {
    const roomName = "roomName";

    it("should return a string[]", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } });
      const creepArray = [
        { creepType: "None", id: "0" },
        { creepType: "None", id: "1" },
        { creepType: "None", id: "2" },
      ];
      Memory.cache.creeps.data = { roomName: creepArray };

      let getAllCreepNames = GetAllCreepNames(roomName);
      expect(getAllCreepNames.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(getAllCreepNames.response).toHaveLength(3);

      Memory.cache.creeps.data = { roomName: [] };
      getAllCreepNames = GetAllCreepNames(roomName);
      expect(getAllCreepNames.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(getAllCreepNames.response).toHaveLength(0);
    });
    it("should return NOT_FOUND", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } }, true);

      const getAllCreepNames = GetAllCreepNames(roomName);
      expect(
        getAllCreepNames.code === FunctionReturnCodes.NOT_FOUND
      ).toBeTruthy();
      expect(isUndefined(getAllCreepNames.response)).toBeTruthy();
    });
  });
});
