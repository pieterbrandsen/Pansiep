import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { VisualDisplayLevels } from "../utils/constants/room";
import { VisualLevel } from "../utils/config/room";

export const ShouldVisualsBeDisplayed = FuncWrapper(
  function ShouldVisualsBeDisplayed(visualLevel: number): FunctionReturn {
    if (visualLevel <= VisualLevel)
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);
  }
);

export const AddLineWPos = FuncWrapper(function AddLineWPos(
  room: Room,
  pos1: RoomPosition,
  pos2: RoomPosition,
  visualLevel: number,
  style?: LineStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.line(pos1, pos2, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddLineWCoords = FuncWrapper(function AddLineWCoords(
  room: Room,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  visualLevel: number,
  style?: LineStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.line(x1, x2, y1, y2, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddCircleWPos = FuncWrapper(function AddCircleWPos(
  room: Room,
  pos: RoomPosition,
  visualLevel: number,
  style?: CircleStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.circle(pos, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddCircleWCoords = FuncWrapper(function AddCircleWCoords(
  room: Room,
  x: number,
  y: number,
  visualLevel: number,
  style?: CircleStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.circle(x, y, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddRectWPos = FuncWrapper(function AddRectWPos(
  room: Room,
  topLeftPos: RoomPosition,
  width: number,
  height: number,
  visualLevel: number,
  style?: PolyStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.rect(topLeftPos, width, height, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddRectWCoords = FuncWrapper(function AddRectWCoords(
  room: Room,
  x: number,
  y: number,
  width: number,
  height: number,
  visualLevel: number,
  style?: PolyStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.rect(x, y, width, height, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddPoly = FuncWrapper(function AddPoly(
  room: Room,
  points: Array<[number, number] | RoomPosition>,
  visualLevel: number,
  style?: PolyStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.poly(points, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddTextWPos = FuncWrapper(function AddTextWPos(
  room: Room,
  text: string,
  pos: RoomPosition,
  visualLevel: number,
  style?: TextStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.text(text, pos, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const AddTextWCoords = FuncWrapper(function AddTextWCoords(
  room: Room,
  text: string,
  x: number,
  y: number,
  visualLevel: number,
  style?: TextStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.text(text, x, y, style);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

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
