import { FunctionReturnCodes } from "../utils/constants/global";
import { VisualDisplayLevels } from "../utils/constants/room";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { AddRectWCoords, AddTextWCoords } from "./visuals";

// eslint-disable-next-line import/prefer-default-export
export const RoomVisuals = FuncWrapper(function RoomVisuals(
  room: Room
): FunctionReturn {
  AddRectWCoords(room, 1, 1, 9, 14, VisualDisplayLevels.Info, {
    opacity: 0.65,
    fill: "Grey",
  });

  // Empire
  AddTextWCoords(room, "Empire:", 1.3, 2, VisualDisplayLevels.Info, {
    align: "left",
    font: 1,
  });
  AddTextWCoords(
    room,
    `GCL lvl: ${Game.gcl.level}`,
    1.3,
    3,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  AddTextWCoords(
    room,
    `GCL progress: ${(
      (Game.gcl.progress / Game.gcl.progressTotal) *
      100
    ).toFixed(2)}%`,
    1.3,
    4,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  AddTextWCoords(
    room,
    `GPL lvl: ${Game.gpl.level}`,
    1.3,
    5,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  AddTextWCoords(
    room,
    `GPL progress: ${(
      (Game.gpl.progress / Game.gpl.progressTotal) *
      100
    ).toFixed(2)}%`,
    1.3,
    6,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  AddTextWCoords(
    room,
    `Structure count: ${Object.keys(Memory.structures).length}`,
    1.3,
    7,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  AddTextWCoords(
    room,
    `Creep count: ${Object.keys(Memory.creeps).length}`,
    1.3,
    8,
    VisualDisplayLevels.Info,
    { align: "left" }
  );

  // Room
  AddTextWCoords(room, "Room:", 1.3, 10, VisualDisplayLevels.Info, {
    align: "left",
    font: 1,
  });
  if (room.controller) {
    AddTextWCoords(
      room,
      `RCL lvl: ${room.controller.level}`,
      1.3,
      11,
      VisualDisplayLevels.Info,
      { align: "left" }
    );
    AddTextWCoords(
      room,
      `RCL progress: ${(
        (room.controller.progress / room.controller.progressTotal) *
        100
      ).toFixed(2)}%`,
      1.3,
      12,
      VisualDisplayLevels.Info,
      { align: "left" }
    );
  } else {
    AddTextWCoords(
      room,
      `RCL: No controller`,
      1.3,
      11,
      VisualDisplayLevels.Info,
      { align: "left" }
    );
  }
  AddTextWCoords(
    room,
    `Structure count: ${
      Memory.cache.structures.data[room.name]
        ? Memory.cache.structures.data[room.name].length
        : 0
    }`,
    1.3,
    13,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  AddTextWCoords(
    room,
    `Creep count: ${
      Memory.cache.creeps.data[room.name]
        ? Memory.cache.creeps.data[room.name].length
        : 0
    }`,
    1.3,
    14,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
