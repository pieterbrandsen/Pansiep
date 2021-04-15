import { FunctionReturnCodes } from "../utils/constants/global";
import { VisualDisplayLevels } from "../utils/constants/room";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { AddRectWCoords, AddTextWCoords } from "./visuals";

// eslint-disable-next-line import/prefer-default-export
export const RoomVisuals = FuncWrapper(function RoomVisuals(
  room: Room
): FunctionReturn {
  const textXPos = 1.3;
  let topLeftPos = 1;
  AddRectWCoords(room, topLeftPos, topLeftPos, 9, 14, VisualDisplayLevels.Info, {
    opacity: 0.65,
    fill: "Grey",
  });

  // Empire
  topLeftPos+=1;
  AddTextWCoords(room, "Empire:", textXPos, topLeftPos, VisualDisplayLevels.Info, {
    align: "left",
    font: 1,
  });
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `GCL lvl: ${Game.gcl.level}`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `GCL progress: ${(
      (Game.gcl.progress / Game.gcl.progressTotal) *
      100
    ).toFixed(2)}%`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `GPL lvl: ${Game.gpl.level}`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `GPL progress: ${(
      (Game.gpl.progress / Game.gpl.progressTotal) *
      100
    ).toFixed(2)}%`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `Structure count: ${Object.keys(Memory.structures).length}`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `Creep count: ${Object.keys(Memory.creeps).length}`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );

  // Room
  topLeftPos+=2;
  AddTextWCoords(room, "Room:", textXPos, 10, VisualDisplayLevels.Info, {
    align: "left",
    font: 1,
  });
  topLeftPos+=1;
  if (room.controller) {
  AddTextWCoords(
      room,
      `RCL lvl: ${room.controller.level}`,
      textXPos,
      topLeftPos,
      VisualDisplayLevels.Info,
      { align: "left" }
    );
  topLeftPos+=1;
  AddTextWCoords(
      room,
      `RCL progress: ${(
        (room.controller.progress / room.controller.progressTotal) *
        100
      ).toFixed(2)}%`,
      textXPos,
      topLeftPos,
      VisualDisplayLevels.Info,
      { align: "left" }
    );
  } else {
  AddTextWCoords(
      room,
      `RCL: No controller`,
      textXPos,
      topLeftPos,
      VisualDisplayLevels.Info,
      { align: "left" }
    );
    topLeftPos+=1;
  }
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `Structure count: ${
      Memory.cache.structures.data[room.name]
        ? Memory.cache.structures.data[room.name].length
        : 0
    }`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  topLeftPos+=1;
  AddTextWCoords(
    room,
    `Creep count: ${
      Memory.cache.creeps.data[room.name]
        ? Memory.cache.creeps.data[room.name].length
        : 0
    }`,
    textXPos,
    topLeftPos,
    VisualDisplayLevels.Info,
    { align: "left" }
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
