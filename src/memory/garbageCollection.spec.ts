import { mockGlobal } from "screeps-jest";
import GarbageCollection from "./garbageCollection";

describe("GarbageCollection of memory", () => {
  it("should remove creeps/structures memory on request and cleanup their linked memory", () => {
    mockGlobal<Memory>(
      "Memory",
      {
        creeps: { deadCreep: {} },
        structures: { dismantledStructure: {} },
      },
      true
    );

    expect(GarbageCollection.RemoveCreep("deadCreep")).toBeTruthy();
    expect(
      GarbageCollection.RemoveStructure("dismantledStructure")
    ).toBeTruthy();
    expect(Memory.creeps.deadCreep).toBeUndefined();
    expect(Memory.structures.dismantledStructure).toBeUndefined();
  });

  it("should remove room memory on request and clean up other linked memory", () => {
    mockGlobal<Memory>(
      "Memory",
      {
        rooms: { unclaimedRoom: {} },
        creeps: { deadCreep: { spawnRoom: "unclaimedRoom" } },
        structures: { dismantledStructures: { room: "unclaimedRoom" } },
      },
      true
    );
    expect(GarbageCollection.RemoveRoom("unclaimedRoom")).toBeTruthy();
    expect(Memory.rooms.unclaimedRoom).toBeUndefined();
  });

  it("should remove the room but no creeps/structures when there are none", () => {
    mockGlobal<Memory>(
      "Memory",
      {
        rooms: { unclaimedRoom: {} },
        creeps: { aliveCreep: { spawnRoom: "claimedRoom" } },
        structures: { structure: {} },
      },
      true
    );

    GarbageCollection.RemoveRoom("unclaimedRoom");
    expect(Memory.rooms.unclaimedRoom).toBeUndefined();
    expect(Memory.creeps.aliveCreep).toBeDefined();
  });

  it("should error when Memory.creeps is undefined", () => {
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined) });
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Memory>("Memory", {});

    expect(GarbageCollection.RemoveCreep("deadCreep")).toBeFalsy();
    expect(
      GarbageCollection.RemoveStructure("dismantledStructure")
    ).toBeFalsy();
    expect(GarbageCollection.RemoveRoom("unclaimedRoom")).toBeFalsy();
  });
});
