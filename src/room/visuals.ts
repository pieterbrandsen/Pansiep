import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { VisualLevel } from "../utils/config/room";

/**
 * Returns an boolean value indicating if room visuals are going to be displayed
 *
 * @param {number} visualLevel - Current visual level
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ShouldVisualsBeDisplayed = FuncWrapper(
  function ShouldVisualsBeDisplayed(visualLevel: number): FunctionReturn {
    if (visualLevel > VisualLevel)
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

/**
 * Draw a line based on inputted positions
 *
 * @param {Room} room - Room that the line is going to be drawn in
 * @param {RoomPosition} pos1 - First position
 * @param {RoomPosition} pos2 - Second position
 * @param {number} visualLevel - Current visual level
 * @param {LineStyle} [style] - Styling of line
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw a line based on inputted coords
 *
 * @param {Room} room - Room that the line is going to be drawn in
 * @param {number} x1 - First x coord
 * @param {number} y1 - First y coord
 * @param {number} x2 - Second x coord
 * @param {number} y2 - Second y coord
 * @param {number} visualLevel - Current visual level
 * @param {LineStyle} [style] - Styling of line
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw a circle based on inputted positions
 *
 * @param {Room} room - Room that the circle is going to be drawn in
 * @param {RoomPosition} pos - Position of circle
 * @param {number} visualLevel - Current visual level
 * @param {CircleStyle} [style] - Styling of circle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw a circle based on inputted coords
 *
 * @param {Room} room - Room that the circle is going to be drawn in
 * @param {number} x - X coord
 * @param {number} y - Y coord
 * @param {number} visualLevel - Current visual level
 * @param {CircleStyle} [style] - Styling of circle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw a rectangle based on inputted position
 *
 * @param {Room} room - Room that the rectangle is going to be drawn in
 * @param {RoomPosition} topLeftPos - Top left position of circle
 * @param {number} width - How wide the rectangle is on X coord
 * @param {number} height - How long the rectangle is on Y coord
 * @param {number} visualLevel - Current visual level
 * @param {PolyStyle} [style] - Styling of rectangle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw a rectangle based on inputted coords
 *
 * @param {Room} room - Room that the rectangle is going to be drawn in
 * @param {number} x - X coord
 * @param {number} y - Y coord
 * @param {number} width - How wide the rectangle is on X coord
 * @param {number} height - How long the rectangle is on Y coord
 * @param {number} visualLevel - Current visual level
 * @param {PolyStyle} [style] - Styling of rectangle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw a polygon based on inputted points array
 *
 * @param {Room} room - Room that the polygon is going to be drawn in
 * @param {Array<[number, number] | RoomPosition>} points - Array of Array<number,number> or room positions
 * @param {number} visualLevel - Current visual level
 * @param {CircleStyle} [style] - Styling of polygon
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw text based on inputted position
 *
 * @param {Room} room - Room that the text is going to be drawn in
 * @param {string} text - Text that is going to be displayed
 * @param {RoomPosition} pos - Position of text
 * @param {number} visualLevel - Current visual level
 * @param {TextStyle} [style] - Styling of circle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Draw text based on inputted position
 *
 * @param {Room} room - Room that the text is going to be drawn in
 * @param {string} text - Text that is going to be displayed
 * @param {number} x - X coord
 * @param {number} y - Y coord
 * @param {number} visualLevel - Current visual level
 * @param {TextStyle} [style] - Styling of circle
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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
