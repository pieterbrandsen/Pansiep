import _ from "lodash";
import { FunctionReturnCodes, Username } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";

export const GetRoom = FuncWrapper(function GetRoom(
  id: string
): FunctionReturn {
  const room = Game.rooms[id] !== undefined ? Game.rooms[id] : null;
  if (_.isNull(room))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Room>(FunctionReturnCodes.OK, room);
});

export const IsMyOwnedRoom = FuncWrapper(function IsMyOwnedRoom(
  room: Room
): FunctionReturn {
  const isMyOwnedRoom = room.controller ? room.controller.my : false;
  return FunctionReturnHelper<boolean>(FunctionReturnCodes.OK, isMyOwnedRoom);
});

export const GetRoomMemoryUsingName = FuncWrapper(
  function GetRoomMemoryUsingName(id: string): FunctionReturn {
    const roomMemory = Memory.rooms[id];
    if (_.isUndefined(roomMemory))
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
  return FunctionReturnHelper<boolean>(
    FunctionReturnCodes.OK,
    isMyReservedRoom
  );
});

export const GetRoomNames = FuncWrapper(
  function GetRoomNames(): FunctionReturn {
    const roomNames: string[] | undefined = Memory.cache.rooms.data;
    if (!_.isUndefined(roomNames))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
    return FunctionReturnHelper(FunctionReturnCodes.OK, roomNames);
  }
);
