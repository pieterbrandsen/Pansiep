import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import IncomeAndExpensesVisuals from "./incomeAndExpenses";
import RoomHelper from "../helper";
import DrawVisualHandler from "./drawVisual";
import RoomConfig from "../../utils/config/room";
import RoomConstants from "../../utils/constants/room";

const roomName = "room";

const controller = mockInstanceOf<StructureController>({ my: false });
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
      rooms: {
        [roomName]: room,
      },
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );

  MemoryInitializationHandler.InitializeGlobalMemory();
  MemoryInitializationHandler.InitializeRoomMemory(roomName);
});

jest.mock("../../utils/logger");

describe("IncomeAndExpensesVisuals", () => {
  beforeEach(() => {
    jest
      .spyOn(DrawVisualHandler, "AddTextWCoords")
      .mockClear()
      .mockReturnValue();
  });
  it("should draw visuals", () => {
    const roomStats = RoomHelper.GetRoomStatsMemory(roomName);
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;

    IncomeAndExpensesVisuals(room, roomStats);
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
  it("should not draw any visuals", () => {
    const roomStats = RoomHelper.GetRoomStatsMemory(roomName);
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.None;

    IncomeAndExpensesVisuals(room, roomStats);
    expect(DrawVisualHandler.AddTextWCoords).not.toHaveBeenCalled();
  });
  it("adds income and expense to room visuals", () => {
    const roomStats = RoomHelper.GetRoomStatsMemory(roomName);
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;

    roomStats.energyIncome = { dismantle: 0, harvest: 1 };
    roomStats.energyExpenses = {
      build: 0,
      upgrade: 1,
      repair: 2,
      spawn: { creepType: 3, creepType2: 4 },
    };

    IncomeAndExpensesVisuals(room, roomStats);
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
});
