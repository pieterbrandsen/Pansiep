import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { isUndefined } from "lodash";
import { GetCreep, GetAllCreepIds, GetType } from "./helper";
import { FunctionReturnCodes } from "../utils/constants/global";
import {
  ResetPreProcessingRoomStats,
  ResetPreProcessingStats,
} from "../memory/stats";

beforeAll(() => {
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
  ResetPreProcessingStats();
});

describe("Creep helper", () => {
  describe("GetCreep method", () => {
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({
        memory: {},
        room: { name: "room" },
      });
      ResetPreProcessingRoomStats(creep.room.name);
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
      const creeps = [{ id: "0" }, { id: "1" }, { id: "2" }];
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
  describe("GetType", () => {
    it("should return OK and 'claim'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 3;
          }
          if (type === HEAL) {
            return 3;
          }
          if (type === MOVE) {
            return 2;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("claim");
    });
    it("should return OK and 'heal'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 0;
          }
          if (type === HEAL) {
            return 3;
          }
          if (type === MOVE) {
            return 2;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("heal");
    });
    it("should return OK and 'attack'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 0;
          }
          if (type === ATTACK || type === RANGED_ATTACK) {
            return 3;
          }
          if (type === MOVE) {
            return 2;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("attack");
    });
    it("should return OK and 'work'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 0;
          }
          if (type === WORK) {
            return 3;
          }
          if (type === MOVE) {
            return 2;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("work");
    });
    it("should return OK and 'transferring'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 0;
          }
          if (type === CARRY) {
            return 3;
          }
          if (type === MOVE) {
            return 2;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("transferring");
    });
    it("should return OK and 'move'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 0;
          }
          if (type === MOVE) {
            return 3;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("move");
    });
    it("should return OK and 'none'", () => {
      const creep = mockInstanceOf<Creep>({
        getActiveBodyparts: jest.fn((type: BodyPartConstant) => {
          if (type === CLAIM) {
            return 0;
          }
          if (type === ATTACK) {
            return 0;
          }
          return 0;
        }),
      });
      const getType = GetType(creep);
      expect(getType.code).toBe(FunctionReturnCodes.OK);
      expect(getType.response).toBe("none");
    });
  });
});
