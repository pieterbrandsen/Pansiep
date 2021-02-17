import Logger from "../utils/logger";
import { Username } from "../utils/constants/global";

export default class RoomHelper {
  public static GetRoomUsingName(roomName: string): Room | null {
    return Game.rooms[roomName];
  }

  public static GetRoomMemoryUsingName(
    roomName: string
  ): RoomMemory | undefined {
    return Memory.rooms[roomName];
  }

  public static IsMyRoom(room: Room): boolean {
    try {
      return room.controller ? room.controller.my : false;
    } catch (error) {
      Logger.Error("src/room/helper:IsMyRoom", error, room);
      return false;
    }
  }

  public static IsMyReservedRoom(room: Room): boolean {
    try {
      if (room.controller)
        return room.controller.reservation
          ? room.controller.reservation.username === Username
          : false;
      return false;
    } catch (error) {
      Logger.Error("src/room/helper:IsMyReservedRoom", error, room);
      return false;
    }
  }

  public static GetAllRoomNames(): string[] {
    return Memory.cache.rooms.data;
  }
}
