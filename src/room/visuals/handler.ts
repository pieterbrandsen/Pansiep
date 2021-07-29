import JobVisuals from "./job";
import IncomeAndExpensesVisuals from "./incomeAndExpenses";
import MainVisuals from "./main";
import RoomHelper from "../helper";
import WrapperHandler from "../../utils/wrapper";

export default class RoomVisualHandler {
  /**
   * Draw all room visuals
   */
  public static DrawRoomVisuals = WrapperHandler.FuncWrapper(
    function DrawRoomVisuals(room: Room) {
      const roomStats = RoomHelper.GetRoomStatsMemory(room.name);

      MainVisuals(room);
      IncomeAndExpensesVisuals(room, roomStats);
      JobVisuals(room, roomStats);
    }
  );
}
