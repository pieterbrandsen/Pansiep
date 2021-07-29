import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import MainVisuals from "./main";
import DrawVisualHandler from "./drawVisual";
import RoomConfig from "../../utils/config/room";
import RoomConstants from "../../utils/constants/room";

const roomName = "room";

const controller = mockInstanceOf<StructureController>({
  my: false,
  level: 0,
  progressTotal: 0,
  progress: 0,
});
const room = mockInstanceOf<Room>({
  name: roomName,
  controller,
  find: jest.fn().mockReturnValue([]),
  visual: {
    circle: jest.fn().mockReturnValue(0),
    poly: jest.fn().mockReturnValue(0),
    line: jest.fn().mockReturnValue(0),
    rect: jest.fn().mockReturnValue(0),
    text: jest.fn().mockReturnValue(0),
  },
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      gcl: { level: 0 },
      gpl: { level: 0 },
      rooms: {
        [roomName]: room,
      },
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

jest.mock("../../utils/logger");

describe("MainVisuals", () => {
  beforeEach(() => {
    room.controller = controller;
    jest
      .spyOn(DrawVisualHandler, "AddTextWCoords")
      .mockClear()
      .mockReturnValue();
    MemoryInitializationHandler.InitializeGlobalMemory();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
  });
  it("should draw visuals including controller visuals", () => {
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;

    MainVisuals(room);
    expect(room.controller).not.toBeUndefined();
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
  it("should draw visuals without controller visuals", () => {
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;
    room.controller = undefined;

    MainVisuals(room);
    expect(room.controller).toBeUndefined();
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
  it("should draw visuals with cache data", () => {
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;
    Memory.cache.creeps.data[roomName] = [];
    Memory.cache.structures.data[roomName] = [];
    expect(Memory.cache.creeps.data[room.name]).toBeDefined();
    expect(Memory.cache.structures.data[room.name]).toBeDefined();

    MainVisuals(room);
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
  it("should not draw any visuals", () => {
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.None;

    MainVisuals(room);
    expect(DrawVisualHandler.AddTextWCoords).not.toHaveBeenCalled();
  });
});
