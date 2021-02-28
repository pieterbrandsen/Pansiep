import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { isUndefined } from "lodash";
import { GetCreep, GetAllCreepIds } from "./helper";
import { FunctionReturnCodes } from "../utils/constants/global";

describe("Creep helper", () => {
  describe("GetCreep method", () => {
    beforeEach(() => {
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
    });
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({ memory: {} });
      Game.creeps = { creep };

      const getCreep = GetCreep("creep");
      expect(getCreep.code).toBe(FunctionReturnCodes.OK);
      expect(getCreep.response === creep).toBeTruthy();
    });
    it("should return NOT_FOUND", () => {
      Game.creeps = {};

      const getCreep = GetCreep("creep");
      expect(getCreep.code === FunctionReturnCodes.NOT_FOUND).toBeTruthy();
      expect(isUndefined(getCreep.response)).toBeTruthy();
    });
  });

  describe("GetAllCreepIds method", () => {
    const roomName = "roomName";

    it("should return a string[]", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } });
      const creeps = [
        { creepType: "None", id: "0" },
        { creepType: "None", id: "1" },
        { creepType: "None", id: "2" },
      ];
      Memory.cache.creeps.data = { roomName: creeps };

      let getAllCreepIds = GetAllCreepIds(roomName);
      expect(getAllCreepIds.code).toBe(FunctionReturnCodes.OK);
      expect(getAllCreepIds.response).toHaveLength(3);

      Memory.cache.creeps.data = { roomName: [] };
      getAllCreepIds = GetAllCreepIds(roomName);
      expect(getAllCreepIds.code).toBe(FunctionReturnCodes.OK);
      expect(getAllCreepIds.response).toHaveLength(0);
    });
    it("should return NOT_FOUND", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } }, true);

      const getAllCreepIds = GetAllCreepIds(roomName);
      expect(
        getAllCreepIds.code === FunctionReturnCodes.NOT_FOUND
      ).toBeTruthy();
    });
  });
});
