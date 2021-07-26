import { forEach } from "lodash";
import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CreepConstants from "../utils/constants/creep";
import RoomConstants from "../utils/constants/room";
import StructureConstants from "../utils/constants/structure";
import GarbageCollectionHandler from "./garbageCollection";
import MemoryInitializationHandler from "./initialization";

jest.mock("../utils/logger");
jest.mock("../room/planner/planner");

const roomName = "room";
const structureId = "structure" as Id<Structure>;
const creepName = "creep";
const constructionSite = mockInstanceOf<ConstructionSite>({
  id: "cs",
  remove: jest.fn(),
});
const room = mockInstanceOf<Room>({
  name: roomName,
  find: jest.fn().mockImplementation((typeNumber) => {
    if (typeNumber === 111) return [constructionSite];
    return [];
  }),
});
const structure = mockInstanceOf<Structure>({
  id: structureId,
  room,
  structureType: "container",
  pos: new RoomPosition(1, 1, roomName),
});
const creep = mockInstanceOf<Creep>({
  id: creepName,
  name: creepName,
  room,
  pos: new RoomPosition(1, 1, roomName),
  getActiveBodyparts: jest.fn().mockReturnValue(1),
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {
    powerCreeps: undefined,
  });
  mockGlobal<Game>(
    "Game",
    {
      rooms: {
        [roomName]: room,
      },
      structures: {
        [structureId]: structure,
      },
      creeps: {
        [creepName]: creep,
      },
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

describe("InitializationHandler", () => {
  it("should expect heap vars are not valid", () => {
    const result = MemoryInitializationHandler.AreHeapVarsValid();
    expect(result).toBeFalsy();
  });
  it("should expect heap vars are valid", () => {
    MemoryInitializationHandler.InitializeHeapVars();
    const result = MemoryInitializationHandler.AreHeapVarsValid();
    expect(result).toBeTruthy();
  });
  it("should expect custom properties are not valid", () => {
    const result = MemoryInitializationHandler.AreCustomPrototypesInitialized();
    expect(result).toBeFalsy();
  });
  it("should expect custom properties are valid", () => {
    forEach(RoomConstants.TrackedIntents, (key: string) => {
      Room.prototype[key] = jest.fn();
    });
    forEach(StructureConstants.TrackedIntents, (key: string) => {
      Structure.prototype[key] = jest.fn();
    });
    forEach(CreepConstants.TrackedIntents, (key: string) => {
      Creep.prototype[key] = jest.fn();
    });
    MemoryInitializationHandler.InitializeCustomPrototypes();
    const result = MemoryInitializationHandler.AreCustomPrototypesInitialized();
    expect(result).toBeTruthy();
  });
  it("should expect global memory are not valid", () => {
    const result = MemoryInitializationHandler.IsGlobalMemoryInitialized();
    expect(result).toBeFalsy();
  });
  it("should expect global memory are valid", () => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    const result = MemoryInitializationHandler.IsGlobalMemoryInitialized();
    expect(result).toBeTruthy();
  });
  it("should expect room memory are not valid", () => {
    GarbageCollectionHandler.RemoveRoom(roomName);
    const result = MemoryInitializationHandler.IsRoomMemoryInitialized(
      roomName
    );
    expect(result).toBeFalsy();
  });
  it("should expect room memory are valid", () => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    const result = MemoryInitializationHandler.IsRoomMemoryInitialized(
      roomName
    );
    expect(result).toBeTruthy();
  });
  it("should expect structure memory are not valid", () => {
    GarbageCollectionHandler.RemoveStructure(roomName, structureId);
    const result = MemoryInitializationHandler.IsStructureMemoryInitialized(
      structureId
    );
    expect(result).toBeFalsy();

    Memory.structures[structureId] = { room: (undefined as unknown) as string };
    const result2 = MemoryInitializationHandler.IsStructureMemoryInitialized(
      structureId
    );
    expect(result2).toBeFalsy();
  });
  it("should expect structure memory are valid", () => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeStructureMemory(
      roomName,
      structureId,
      "container",
      true
    );
    Memory.cache.structures.data = {};
    MemoryInitializationHandler.InitializeStructureMemory(
      roomName,
      structureId,
      "container",
      true
    );

    const result = MemoryInitializationHandler.IsStructureMemoryInitialized(
      structureId
    );
    expect(result).toBeTruthy();
  });
  it("should expect creep memory are not valid", () => {
    GarbageCollectionHandler.RemoveCreep(roomName, creepName);
    const result = MemoryInitializationHandler.IsCreepMemoryInitialized(
      creepName
    );
    expect(result).toBeFalsy();

    Memory.creeps[creepName] = {
      commandRoom: (undefined as unknown) as string,
      parts: {},
      type: "none",
    };
    const result2 = MemoryInitializationHandler.IsCreepMemoryInitialized(
      creepName
    );
    expect(result2).toBeFalsy();
  });
  it("should expect creep memory are valid", () => {
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
    MemoryInitializationHandler.InitializeCreepMemory(
      roomName,
      creepName,
      "none",
      true
    );
    Memory.cache.creeps.data = {};
    MemoryInitializationHandler.InitializeCreepMemory(
      roomName,
      creepName,
      "none",
      true
    );
    const result = MemoryInitializationHandler.IsCreepMemoryInitialized(
      creepName
    );
    expect(result).toBeTruthy();
  });
});
