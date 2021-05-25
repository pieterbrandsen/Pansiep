import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
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
  y1: number,
  x2: number,
  y2: number,
  visualLevel: number,
  style?: LineStyle
): FunctionReturn {
  if (
    ShouldVisualsBeDisplayed(visualLevel).code ===
    FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
  )
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  room.visual.line(x1, y1, x2, y2, style);
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
