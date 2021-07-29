import { mockInstanceOf, mockGlobal } from "screeps-jest";
import RoomConfig from "../../utils/config/room";
import RoomConstants from "../../utils/constants/room";
import DrawVisualHandler from "./drawVisual";

const roomName = "room";
const room = mockInstanceOf<Room>({
  name: roomName,
  visual: {
    circle: jest.fn().mockReturnValue(0),
    poly: jest.fn().mockReturnValue(0),
    line: jest.fn().mockReturnValue(0),
    rect: jest.fn().mockReturnValue(0),
    text: jest.fn().mockReturnValue(0),
  },
});

const width = 30;
const height = 31;
const points: Array<[number, number]> = [
  [10, 11],
  [20, 21],
];
const text = "text";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
      rooms: {},
    },
    true
  );
});

describe("DrawVisualHandler", () => {
  describe("ShouldVisualsBeDisplayed", () => {
    it("should return expected boolean values", () => {
      RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.None;
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.None
        )
      ).toBe(true);
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.Info
        )
      ).toBe(false);
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.Debug
        )
      ).toBe(false);

      RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Info;
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.None
        )
      ).toBe(true);
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.Info
        )
      ).toBe(true);
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.Debug
        )
      ).toBe(false);

      RoomConfig.VisualDisplayLevel = RoomConstants.VisualDisplayLevels.Debug;
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.None
        )
      ).toBe(true);
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.Info
        )
      ).toBe(true);
      expect(
        DrawVisualHandler.ShouldVisualsBeDisplayed(
          RoomConstants.VisualDisplayLevels.Debug
        )
      ).toBe(true);
    });
  });
  describe("Add...WPos", () => {
    it("should call all functions where position are needed", () => {
      const pos = new RoomPosition(10, 11, roomName);
      const pos2 = new RoomPosition(20, 21, roomName);

      DrawVisualHandler.AddCircleWPos(room, pos);
      expect(room.visual.circle).toHaveBeenLastCalledWith(pos, undefined);
      DrawVisualHandler.AddCircleWPos(room, pos, {});
      expect(room.visual.circle).toHaveBeenLastCalledWith(pos, {});

      DrawVisualHandler.AddLineWPos(room, pos, pos2);
      expect(room.visual.line).toHaveBeenLastCalledWith(pos, pos2, undefined);
      DrawVisualHandler.AddLineWPos(room, pos, pos2, {});
      expect(room.visual.line).toHaveBeenLastCalledWith(pos, pos2, {});

      DrawVisualHandler.AddRectWPos(room, pos, width, height);
      expect(room.visual.rect).toHaveBeenLastCalledWith(
        pos,
        width,
        height,
        undefined
      );
      DrawVisualHandler.AddRectWPos(room, pos, width, height, {});
      expect(room.visual.rect).toHaveBeenLastCalledWith(pos, width, height, {});

      DrawVisualHandler.AddTextWPos(room, text, pos);
      expect(room.visual.text).toHaveBeenLastCalledWith(text, pos, undefined);
      DrawVisualHandler.AddTextWPos(room, text, pos, {});
      expect(room.visual.text).toHaveBeenLastCalledWith(text, pos, {});
    });
  });
  describe("Add...WCoords", () => {
    it("should call all functions where coords are needed", () => {
      const x = 10;
      const x2 = 11;
      const y = 20;
      const y2 = 21;

      DrawVisualHandler.AddCircleWCoords(room, x, y);
      expect(room.visual.circle).toHaveBeenLastCalledWith(x, y, undefined);
      DrawVisualHandler.AddCircleWCoords(room, x, y, {});
      expect(room.visual.circle).toHaveBeenLastCalledWith(x, y, {});

      DrawVisualHandler.AddLineWCoords(room, x, y, x2, y2);
      expect(room.visual.line).toHaveBeenLastCalledWith(
        x,
        y,
        x2,
        y2,
        undefined
      );
      DrawVisualHandler.AddLineWCoords(room, x, y, x2, y2, {});
      expect(room.visual.line).toHaveBeenLastCalledWith(x, y, x2, y2, {});

      DrawVisualHandler.AddRectWCoords(room, x, y, width, height);
      expect(room.visual.rect).toHaveBeenLastCalledWith(
        x,
        y,
        width,
        height,
        undefined
      );
      DrawVisualHandler.AddRectWCoords(room, x, y, width, height, {});
      expect(room.visual.rect).toHaveBeenLastCalledWith(
        x,
        y,
        width,
        height,
        {}
      );

      DrawVisualHandler.AddTextWCoords(room, text, x, y);
      expect(room.visual.text).toHaveBeenLastCalledWith(text, x, y, undefined);
      DrawVisualHandler.AddTextWCoords(room, text, x, y, {});
      expect(room.visual.text).toHaveBeenLastCalledWith(text, x, y, {});

      DrawVisualHandler.AddPoly(room, points);
      expect(room.visual.poly).toHaveBeenLastCalledWith(points, undefined);
      DrawVisualHandler.AddPoly(room, points, {});
      expect(room.visual.poly).toHaveBeenLastCalledWith(points, {});
    });
  });
});
