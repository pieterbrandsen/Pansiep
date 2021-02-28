import { forEach, isUndefined } from "lodash";
import { FunctionReturnCodes, Username } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";

export const GetRoom = FuncWrapper(function GetRoom(
  id: string
): FunctionReturn {
  const room = Game.rooms[id];
  if (isUndefined(room))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Room>(FunctionReturnCodes.OK, room);
});

export const IsMyOwnedRoom = FuncWrapper(function IsMyOwnedRoom(
  room: Room
): FunctionReturn {
  const isMyOwnedRoom = room.controller ? room.controller.my : false;
  if (!isMyOwnedRoom)
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MY_ROOM);
  return FunctionReturnHelper<boolean>(FunctionReturnCodes.OK);
});

export const GetRoomMemoryUsingName = FuncWrapper(
  function GetRoomMemoryUsingName(id: string): FunctionReturn {
    const roomMemory = Memory.rooms[id];
    if (isUndefined(roomMemory))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
    return FunctionReturnHelper<RoomMemory>(FunctionReturnCodes.OK, roomMemory);
  }
);

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
  return FunctionReturnHelper<boolean>(FunctionReturnCodes.OK);
});

export const GetRoomIds = FuncWrapper(function GetRoomIds(): FunctionReturn {
  const roomIds: string[] = Memory.cache.rooms.data;
  return FunctionReturnHelper(FunctionReturnCodes.OK, roomIds);
});

export const GetObjectsFromIDs = FuncWrapper(function GetObjectsFromIDs<T>(
  IDs: string[]
): FunctionReturn {
  const objects: T[] = [];
  forEach(IDs, (id: string) => {
    const object: T | null = Game.getObjectById(id);
    if (object !== null) {
      objects.push(object);
    }
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, objects);
});
