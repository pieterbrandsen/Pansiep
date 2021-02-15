import { mockGlobal, mockInstanceOf } from "screeps-jest";
import GarbageCollection from "./garbageCollection";

const creep = mockInstanceOf<Creep>({});
const creep2 = mockInstanceOf<Creep>({});
const creep3 = mockInstanceOf<Creep>({});

describe("GarbageCollection of memory", () => {
  it("should remove dead creeps", () => {
    mockGlobal<Game>('Game', {
      creeps: {
        creep,
        creep2,
        creep3
      },
    }, true);
    mockGlobal<Memory>('Memory', { creeps: {"creep": {}, "creep2": {}, "creep3": {}, "deadCreep": {}} });

    GarbageCollection.CheckCreeps();
    expect(Object.keys(Game.creeps).length).toEqual(3);
  });

  it("should error when Memory.creeps is undefined", () => {
    mockGlobal<Game>('Game', {notify: jest.fn(() => undefined)});
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Memory>('Memory', {});

    expect(GarbageCollection.CheckCreeps()).toBeFalsy();
  });
});