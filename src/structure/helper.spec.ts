import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { isUndefined } from "lodash";
import { GetStructure, GetAllStructureIds } from "./helper";
import { FunctionReturnCodes } from "../utils/constants/global";

describe("Structure helper", () => {
  describe("GetStructure method", () => {
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
      const structure = mockInstanceOf<Structure>({ memory: {} });
      Game.structures = { structure };

      const getStructure = GetStructure("structure");
      expect(getStructure.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(getStructure.response === structure).toBeTruthy();
    });
    it("should return NOT_FOUND", () => {
      Game.structures = {};

      const getStructure = GetStructure("structure");
      expect(getStructure.code === FunctionReturnCodes.NOT_FOUND).toBeTruthy();
      expect(isUndefined(getStructure.response)).toBeTruthy();
    });
  });

  describe("GetAllStructureIds method", () => {
    const roomName = "roomName";

    it("should return a string[]", () => {
      mockGlobal<Memory>("Memory", { cache: { structures: { data: {} } } });
      const structures = [
        { structureType: STRUCTURE_LINK, id: "0" },
        { structureType: STRUCTURE_LINK, id: "1" },
        { structureType: STRUCTURE_CONTROLLER, id: "2" },
      ];
      Memory.cache.structures.data = { roomName: structures };

      let getAllStructureNames = GetAllStructureIds(roomName);
      expect(getAllStructureNames.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(getAllStructureNames.response).toHaveLength(3);

      Memory.cache.structures.data = { roomName: [] };
      getAllStructureNames = GetAllStructureIds(roomName);
      expect(getAllStructureNames.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(getAllStructureNames.response).toHaveLength(0);
    });
    it("should return NOT_FOUND", () => {
      mockGlobal<Memory>(
        "Memory",
        { cache: { structures: { data: {} } } },
        true
      );

      const getAllStructureNames = GetAllStructureIds(roomName);
      expect(
        getAllStructureNames.code === FunctionReturnCodes.NOT_FOUND
      ).toBeTruthy();
    });
  });
});
