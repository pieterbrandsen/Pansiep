import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CreepManager from "../creep/loop";
import MemoryInitializationHandler from "../memory/initialization";
import StatsHandler from "../memory/stats";
import StructureManager from "../structure/loop";
import RoomHelper from "./helper";
import RoomManager from "./loop";
import RoomPlannerHandler from "./planner/planner";
import RoomVisualHandler from "./visuals/handler";

const roomName = "room";
const room = mockInstanceOf<Room>({ name: roomName });

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});

jest.mock("./helper");
jest.mock("../creep/loop");
jest.mock("./planner/planner");
jest.mock("../structure/loop");
jest.mock("./visuals/handler");
jest.mock("../memory/stats");

describe("RoomManager", () => {
  it("should run all the rooms and call all methods in RunRoom", () => {
    RoomHelper.GetRoomIds = jest.fn().mockReturnValue([roomName, roomName]);
    RoomHelper.GetRoom = jest.fn().mockReturnValue(room);
    MemoryInitializationHandler.IsRoomMemoryInitialized = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    RoomManager.Run();

    expect(RoomHelper.GetRoomIds).toHaveBeenCalledTimes(1);

    expect(RoomHelper.GetRoom).toHaveBeenCalledWith(roomName);
    expect(StatsHandler.RoomStatsPreProcessing).toHaveBeenCalledWith(roomName);
    expect(StructureManager.Run).toHaveBeenCalledWith(roomName);
    expect(CreepManager.Run).toHaveBeenCalledWith(roomName);
    expect(RoomPlannerHandler.TryToExecuteRoomPlanner).toHaveBeenCalledWith(
      room
    );
    expect(RoomVisualHandler.DrawRoomVisuals).toHaveBeenCalledWith(room);
    expect(StatsHandler.RoomStats).toHaveBeenCalledWith(room);
  });
});
