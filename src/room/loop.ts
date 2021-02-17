import RoomHelper from "./helper";
import Initialization from "../memory/initialization";

export default class RoomLoop {
  public static Run(): boolean {
    const roomNames = RoomHelper.GetAllRoomNames();
    roomNames.forEach(roomName => {
      if (Initialization.IsRoomMemoryInitialized(roomName)) {
        this.RunRoom(roomName);
      }
      else Initialization.InitializeRoomMemory(roomName); 
    });

    return true;
  }

  private static RunRoom(roomName: string): boolean {
    const room = RoomHelper.GetRoom(roomName);
    console.log(room);
    return true;
  }
}