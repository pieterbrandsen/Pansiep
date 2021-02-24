import { mockGlobal, mockInstanceOf } from 'screeps-jest';
import { FunctionReturnCodes } from '../utils/constants/global';
import {RunCreep, Run} from './loop';

JSON.stringify = jest.fn((...args: any[]) => {
  return "stringify";
});

jest.mock("../memory/stats");
jest.mock("../memory/initialization", () => {
  return { 
    IsCreepMemoryInitialized: (id: string) => {return FunctionReturnCodes.OK}
  }
});


describe("Creep loop", () => {
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
  })
  describe("RunCreep method", () => {
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({ memory: {} });
      Game.creeps = { creep };
      
      const runCreep = RunCreep("creep");
      expect(runCreep.code === FunctionReturnCodes.OK).toBeTruthy();
    })
    it ("should return NO_CONTENT", () => {
      Game.creeps = {};
      const runCreep = RunCreep("noCreep");
      expect(runCreep.code === FunctionReturnCodes.NO_CONTENT).toBeTruthy();
    })
  })
  describe("Run method", () => {
    it ("should return NO_CONTENT", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } }, true);

      const runCreep = Run("room");
      expect(runCreep.code === FunctionReturnCodes.NO_CONTENT).toBeTruthy();
    })

    it ("should return OK", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } });
      const creepArray = [
        { creepType: "None", id: "0" },
        { creepType: "None", id: "1" },
        { creepType: "None", id: "2" },
      ];

      jest.mock("../memory/initialization", () => {
        return { 
          IsCreepMemoryInitialized: (id: string) => {return FunctionReturnCodes.NO_CONTENT}
        }
      });

      Memory.cache.creeps.data = { roomName: creepArray };

      let run = Run("roomName");
      expect(run.code === FunctionReturnCodes.OK).toBeTruthy();

      Memory.cache.creeps.data = { roomName: [] };
      run = Run("roomName");
      expect(run.code === FunctionReturnCodes.OK).toBeTruthy();
    })
  })
})

// jest.unmock("creep/helper");
// jest.unmock("memory/stats");
// jest.unmock("memory/initialization");