import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import JobVisuals from "./job";
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

describe("JobVisuals", () => {
  beforeEach(() => {
    jest
      .spyOn(DrawVisualHandler, "AddTextWCoords")
      .mockClear()
      .mockReturnValue();
    MemoryInitializationHandler.InitializeRoomMemory(roomName);
  });
  it("should draw visuals", () => {
    const roomStats = RoomHelper.GetRoomStatsMemory(roomName);
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;

    JobVisuals(room, roomStats);
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
  it("should not draw any visuals", () => {
    const roomStats = RoomHelper.GetRoomStatsMemory(roomName);
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.None;

    JobVisuals(room, roomStats);
    expect(DrawVisualHandler.AddTextWCoords).not.toHaveBeenCalled();
  });
  it("should draw most active jobs to the room", () => {
    const roomStats = RoomHelper.GetRoomStatsMemory(roomName);
    RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;

    roomStats.activeJobs = { job: 0, job2: 1, job3: 2, job4: 3, job5: 4 };
    roomStats.creepCountPerJob = { job: 0, job2: 1, job3: 2, job4: 3, job5: 4 };

    JobVisuals(room, roomStats);

    roomStats.activeJobs = { job: 0, job2: 1 };
    roomStats.creepCountPerJob = { job: 0, job2: 1 };
    JobVisuals(room, roomStats);
    expect(DrawVisualHandler.AddTextWCoords).toHaveBeenCalled();
  });
});
