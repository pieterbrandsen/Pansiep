import { forEach, isUndefined } from "lodash";
import { FunctionReturnCodes, Username } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { FuncWrapper } from "../utils/wrapper";

/**
 * Return Game object of room requested
 *
 * @param {string} name - name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetRoom = FuncWrapper(function GetRoom(
  name: string
): FunctionReturn {
  const room = Game.rooms[name];
  if (isUndefined(room))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, room);
});

/**
 * Indicates if inputted room is my room
 *
 * @param {Room} room - Checked room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const IsMyOwnedRoom = FuncWrapper(function IsMyOwnedRoom(
  room: Room
): FunctionReturn {
  const isMyOwnedRoom = room.controller ? room.controller.my : false;
  if (!isMyOwnedRoom)
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MY_ROOM);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Fetches room memory and returns it
 *
 * @param {string} name - name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetRoomMemoryUsingName = FuncWrapper(
  function GetRoomMemoryUsingName(id: string): FunctionReturn {
    const roomMemory = Memory.rooms[id];
    if (isUndefined(roomMemory))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
    return FunctionReturnHelper(FunctionReturnCodes.OK, roomMemory);
  }
);

/**
 * Fetches room stats memory and returns it
 *
 * @param {string} name - name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
 export const GetRoomStatsMemoryUsingName = FuncWrapper(
  function GetRoomStatsMemoryUsingName(id: string): FunctionReturn {
    const roomMemory = Memory.stats.rooms[id];
    if (isUndefined(roomMemory))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
    return FunctionReturnHelper(FunctionReturnCodes.OK, roomMemory);
  }
);

/**
 * Overwrites old room memory with new memory
 *
 * @param {RoomMemory} mem - Updated room memory
 * @param {string} name - name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const UpdateRoomMemory = FuncWrapper(function UpdateRoomMemory(
  mem: RoomMemory,
  name: string
): FunctionReturn {
  Memory.rooms[name] = mem;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Indicates if inputted room is reserved by me
 *
 * @param {Room} room - Checked room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const IsMyReservedRoom = FuncWrapper(function IsMyReservedRoom(
  room: Room
): FunctionReturn {
  if (room.controller === undefined)
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);

  const isMyReservedRoom = room.controller.reservation
    ? room.controller.reservation.username === Username
    : false;
  if (!isMyReservedRoom)
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MY_ROOM);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Return all cached room names
 *
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetRoomIds = FuncWrapper(function GetRoomIds(): FunctionReturn {
  const roomIds: string[] = Memory.cache.rooms.data;
  return FunctionReturnHelper(FunctionReturnCodes.OK, roomIds);
});

/**
 * Gets actual object for each id out of inputted array
 *
 * @param {string[]} ids - Ids of objects
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetObjectsFromIDs = FuncWrapper(function GetObjectsFromIDs<T>(
  ids: string[]
): FunctionReturn {
  const objects: T[] = [];
  forEach(ids, (id: string) => {
    const object: T | null = Game.getObjectById(id);
    if (object !== null) {
      objects.push(object);
    }
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, objects);
});
