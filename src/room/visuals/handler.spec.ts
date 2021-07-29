import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../../memory/initialization";
import RoomVisualHandler from "./handler";
import JobVisuals from "./job";
import IncomeAndExpensesVisuals from "./incomeAndExpenses";
import MainVisuals from "./main";

const roomName = "room";

const controller = mockInstanceOf<StructureController>({ my: false });
const room = mockInstanceOf<Room>({
  name: roomName,
  controller,
  find: jest.fn().mockReturnValue([]),
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

jest.mock("./incomeAndExpenses");
jest.mock("./job");
jest.mock("./main");
jest.mock("../../utils/logger");

describe("RoomVisualHandler", () => {
  it("should call all room visual handlers", () => {
    RoomVisualHandler.DrawRoomVisuals(room);

    expect(MainVisuals).toHaveBeenCalledTimes(1);
    expect(IncomeAndExpensesVisuals).toHaveBeenCalledTimes(1);
    expect(JobVisuals).toHaveBeenCalledTimes(1);
  });
});
