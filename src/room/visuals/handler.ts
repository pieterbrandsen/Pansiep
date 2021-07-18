import { FuncWrapper } from "../../utils/wrapper";
import JobVisuals from "./job";
import IncomeAndExpensesVisuals from "./incomeAndExpenses";
import MainVisuals from "./main";
import { GetRoomStatsMemory } from "../helper";

export default class RoomVisualHandler {
  /**
   * Draw all room visuals
   */
  public static DrawRoomVisuals = FuncWrapper(function DrawRoomVisuals(room: Room) {
    MainVisuals.Execute(room);

    const roomStats = GetRoomStatsMemory(room.name);
    if (roomStats) {
      IncomeAndExpensesVisuals.Execute(room, roomStats);
      JobVisuals.Execute(room, roomStats);
    }
  });
}
