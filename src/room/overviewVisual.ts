import { FunctionReturnCodes } from "../utils/constants/global";
import { VisualDisplayLevels } from "../utils/constants/room";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { AddRectWCoords, AddTextWCoords } from "./visuals";

// eslint-disable-next-line import/prefer-default-export
export const RoomVisuals = FuncWrapper(function RoomVisuals(
  room: Room
): FunctionReturn {
  const defaultX = 1;
  const textXPos = defaultX + 0.3;
  const titleTextStyle: TextStyle = {
    align: "left",
    font: 1,
  };
  const subTitleTextStyle: TextStyle = {
    align: "left",
    font: 0.9,
  };
  const textStyle: TextStyle = {
    align: "left",
  };
  let topLeftPos = 5;
  AddRectWCoords(
    room,
    defaultX,
    (topLeftPos += 1),
    9,
    16,
    VisualDisplayLevels.Info,
    {
      opacity: 0.65,
      fill: "Grey",
    }
  );

  // Empire
  AddTextWCoords(
    room,
    "Empire:",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    titleTextStyle
  );
  AddTextWCoords(
    room,
    "> Main",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    subTitleTextStyle
  );
  AddTextWCoords(
    room,
    `GCL lvl: ${Game.gcl.level}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `GCL progress: ${(
      (Game.gcl.progress / Game.gcl.progressTotal) *
      100
    ).toFixed(2)}%`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `GPL lvl: ${Game.gpl.level}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `GPL progress: ${(
      (Game.gpl.progress / Game.gpl.progressTotal) *
      100
    ).toFixed(2)}%`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `Structure count: ${Object.keys(Memory.structures).length}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `Creep count: ${Object.keys(Memory.creeps).length}`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );

  // Room
  topLeftPos += 1;
  AddTextWCoords(
    room,
    "Room:",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    titleTextStyle
  );
  AddTextWCoords(
    room,
    "> Main",
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    subTitleTextStyle
  );
  if (room.controller) {
    AddTextWCoords(
      room,
      `RCL lvl: ${room.controller.level}`,
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      textStyle
    );
    AddTextWCoords(
      room,
      `RCL progress: ${(
        (room.controller.progress / room.controller.progressTotal) *
        100
      ).toFixed(2)}%`,
      textXPos,
      (topLeftPos += 1),
      VisualDisplayLevels.Info,
      textStyle
    );
  } else {
    AddTextWCoords(
      room,
      `RCL: No controller`,
      textXPos,
      (topLeftPos += 2),
      VisualDisplayLevels.Info,
      textStyle
    );
  }
  AddTextWCoords(
    room,
    `Structure count: ${
      Memory.cache.structures.data[room.name]
        ? Memory.cache.structures.data[room.name].length
        : 0
    }`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  AddTextWCoords(
    room,
    `Creep count: ${
      Memory.cache.creeps.data[room.name]
        ? Memory.cache.creeps.data[room.name].length
        : 0
    }`,
    textXPos,
    (topLeftPos += 1),
    VisualDisplayLevels.Info,
    textStyle
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
