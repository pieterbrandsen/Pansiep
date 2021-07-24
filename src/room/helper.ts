import { forEach } from "lodash";
import GlobalConstants from "../utils/constants/global";
import WrapperHandler from "../utils/wrapper";
import RoomReadingHelper from "./reading";

export default class RoomHelper {
  public static Reader = RoomReadingHelper;

  /**
   * Return Game object of room requested
   */
  public static GetRoom = WrapperHandler.FuncWrapper(function GetRoom(
    name: string
  ): Room {
    const room = Game.rooms[name];
    return room;
  });

  /**
   * Indicates if inputted room is my room
   */
  public static IsMyOwnedRoom = WrapperHandler.FuncWrapper(
    function IsMyOwnedRoom(room: Room): boolean {
      const isMyOwnedRoom = room.controller ? room.controller.my : false;
      return isMyOwnedRoom;
    }
  );

  /**
   * Fetches room memory and returns it
   */
  public static GetRoomMemory = WrapperHandler.FuncWrapper(
    function GetRoomMemoryUsingName(name: string): RoomMemory {
      const roomMemory = Memory.rooms[name];
      return roomMemory;
    }
  );

  /**
   * Fetches room stats memory and returns it
   */
  public static GetRoomStatsMemory = WrapperHandler.FuncWrapper(
    function GetRoomStatsMemory(name: string): RoomStats {
      const roomMemory = Memory.stats.rooms[name];
      return roomMemory;
    }
  );

  /**
   * Overwrites old room memory with new memory
   */
  // public static UpdateRoomMemory = WrapperHandler.FuncWrapper(function UpdateRoomMemory(
  //   mem: RoomMemory,
  //   name: string
  // ): FunctionReturn {
  //   Memory.rooms[name] = mem;
  //   return FunctionReturnHelper(FunctionReturnCodes.OK);
  // });

  /**
   * Indicates if inputted room is reserved by me
   */
  public static IsMyReservedRoom = WrapperHandler.FuncWrapper(
    function IsMyReservedRoom(room: Room): boolean {
      if (room.controller === undefined) return false;

      const isMyReservedRoom = room.controller.reservation
        ? room.controller.reservation.username === GlobalConstants.Username
        : false;
      return isMyReservedRoom;
    }
  );

  /**
   * Return all cached room names
   */
  public static GetRoomIds = WrapperHandler.FuncWrapper(
    function GetRoomIds(): string[] {
      const roomIds: string[] = Memory.cache.rooms.data;
      return roomIds;
    }
  );

  /**
   * Gets actual object for each id out of inputted array
   */
  public static GetObjectsFromIDs = WrapperHandler.FuncWrapper(
    function GetObjectsFromIDs<T>(ids: string[]): T[] {
      const objects: T[] = [];
      forEach(ids, (id: string) => {
        const object: T | null = Game.getObjectById(id);
        if (object !== null) {
          objects.push(object);
        }
      });

      return objects;
    }
  );
}
