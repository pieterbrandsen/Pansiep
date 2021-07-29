import RoomConfig from "../../utils/config/room";
import WrapperHandler from "../../utils/wrapper";

export default class DrawVisualHandler {
  /**
   * Returns an boolean value indicating if room visuals are going to be displayed
   */
  public static ShouldVisualsBeDisplayed = WrapperHandler.FuncWrapper(
    function ShouldVisualsBeDisplayed(visualLevel: number): boolean {
      const configVisualLevel = RoomConfig.VisualDisplayLevel;
      return visualLevel <= configVisualLevel;
    }
  );

  /**
   * Draw a line based on inputted positions
   */
  public static AddLineWPos = WrapperHandler.FuncWrapper(function AddLineWPos(
    room: Room,
    pos1: RoomPosition,
    pos2: RoomPosition,
    style?: LineStyle
  ): void {
    room.visual.line(pos1, pos2, style);
  });

  /**
   * Draw a line based on inputted coords
   */
  public static AddLineWCoords = WrapperHandler.FuncWrapper(
    function AddLineWCoords(
      room: Room,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      style?: LineStyle
    ): void {
      room.visual.line(x1, y1, x2, y2, style);
    }
  );

  /**
   * Draw a circle based on inputted positions
   */
  public static AddCircleWPos = WrapperHandler.FuncWrapper(
    function AddCircleWPos(
      room: Room,
      pos: RoomPosition,
      style?: CircleStyle
    ): void {
      room.visual.circle(pos, style);
    }
  );

  /**
   * Draw a circle based on inputted coords
   */
  public static AddCircleWCoords = WrapperHandler.FuncWrapper(
    function AddCircleWCoords(
      room: Room,
      x: number,
      y: number,
      style?: CircleStyle
    ): void {
      room.visual.circle(x, y, style);
    }
  );

  /**
   * Draw a rectangle based on inputted position
   */
  public static AddRectWPos = WrapperHandler.FuncWrapper(function AddRectWPos(
    room: Room,
    topLeftPos: RoomPosition,
    width: number,
    height: number,
    style?: PolyStyle
  ): void {
    room.visual.rect(topLeftPos, width, height, style);
  });

  /**
   * Draw a rectangle based on inputted coords
   */
  public static AddRectWCoords = WrapperHandler.FuncWrapper(
    function AddRectWCoords(
      room: Room,
      x: number,
      y: number,
      width: number,
      height: number,
      style?: PolyStyle
    ): void {
      room.visual.rect(x, y, width, height, style);
    }
  );

  /**
   * Draw a polygon based on inputted points array
   */
  public static AddPoly = WrapperHandler.FuncWrapper(function AddPoly(
    room: Room,
    points: Array<[number, number] | RoomPosition>,
    style?: PolyStyle
  ): void {
    room.visual.poly(points, style);
  });

  /**
   * Draw text based on inputted position
   */
  public static AddTextWPos = WrapperHandler.FuncWrapper(function AddTextWPos(
    room: Room,
    text: string,
    pos: RoomPosition,
    style?: TextStyle
  ): void {
    room.visual.text(text, pos, style);
  });

  /**
   * Draw text based on inputted position
   */
  public static AddTextWCoords = WrapperHandler.FuncWrapper(
    function AddTextWCoords(
      room: Room,
      text: string,
      x: number,
      y: number,
      style?: TextStyle
    ): void {
      room.visual.text(text, x, y, style);
    }
  );
}
