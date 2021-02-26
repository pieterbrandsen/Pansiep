import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { VisualDisplayLevels } from "../utils/constants/room";
import { FunctionReturnCodes } from "../utils/constants/global";
import {
  ShouldVisualsBeDisplayed,
  AddLineWPos,
  AddLineWCoords,
  AddCircleWPos,
  AddCircleWCoords,
  AddRectWPos,
  AddRectWCoords,
  AddPoly,
  AddTextWPos,
  AddTextWCoords,
} from "./visuals";

jest.mock("../utils/config/room", () => {
  return {
    VisualLevel: 500,
  };
});

describe("Visuals", () => {
  beforeEach(() => {
    mockGlobal<Game>(
      "Game",
      {
        cpu: {
          getUsed: () => {
            return 1;
          },
        },
      },
      true
    );
  });
  describe("ShouldVisualsBeDisplayed method", () => {
    it("should return OK", () => {
      let shouldVisualsBeDisplayed = ShouldVisualsBeDisplayed(
        VisualDisplayLevels.None
      );
      expect(
        shouldVisualsBeDisplayed.code === FunctionReturnCodes.OK
      ).toBeTruthy();

      shouldVisualsBeDisplayed = ShouldVisualsBeDisplayed(
        VisualDisplayLevels.Info
      );
      expect(
        shouldVisualsBeDisplayed.code === FunctionReturnCodes.OK
      ).toBeTruthy();

      shouldVisualsBeDisplayed = ShouldVisualsBeDisplayed(
        VisualDisplayLevels.Debug
      );
      expect(
        shouldVisualsBeDisplayed.code === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const shouldVisualsBeDisplayed = ShouldVisualsBeDisplayed(
        VisualDisplayLevels.All
      );
      expect(
        shouldVisualsBeDisplayed.code ===
          FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("AddLine method", () => {
    const room = mockInstanceOf<Room>({ visual: { line: jest.fn() } });
    const pos1 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    const pos2 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    it("should return OK", () => {
      const addLineWPos = AddLineWPos(
        room,
        pos1,
        pos2,
        VisualDisplayLevels.Info
      );
      const addLineWCoords = AddLineWCoords(
        room,
        pos1.x,
        pos2.x,
        pos1.y,
        pos2.y,
        VisualDisplayLevels.Info
      );

      expect(addLineWPos.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(addLineWCoords.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const addLineWPos = AddLineWPos(
        room,
        pos1,
        pos2,
        VisualDisplayLevels.All
      );
      const addLineWCoords = AddLineWCoords(
        room,
        pos1.x,
        pos2.x,
        pos1.y,
        pos2.y,
        VisualDisplayLevels.All
      );

      expect(
        addLineWPos.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
      expect(
        addLineWCoords.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("AddCircle method", () => {
    const room = mockInstanceOf<Room>({ visual: { circle: jest.fn() } });
    const pos1 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    it("should return OK", () => {
      const addCircleWPos = AddCircleWPos(room, pos1, VisualDisplayLevels.Info);
      const addCircleWCoords = AddCircleWCoords(
        room,
        pos1.x,
        pos1.y,
        VisualDisplayLevels.Info
      );

      expect(addCircleWPos.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(addCircleWCoords.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const addCircleWPos = AddCircleWPos(room, pos1, VisualDisplayLevels.All);
      const addCircleWCoords = AddCircleWCoords(
        room,
        pos1.x,
        pos1.y,
        VisualDisplayLevels.All
      );

      expect(
        addCircleWPos.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
      expect(
        addCircleWCoords.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("AddRect method", () => {
    const room = mockInstanceOf<Room>({ visual: { rect: jest.fn() } });
    const pos1 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    it("should return OK", () => {
      const addRectWPos = AddRectWPos(
        room,
        pos1,
        20,
        10,
        VisualDisplayLevels.Info
      );
      const addRectWCoords = AddRectWCoords(
        room,
        pos1.x,
        pos1.y,
        20,
        10,
        VisualDisplayLevels.Info
      );

      expect(addRectWPos.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(addRectWCoords.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const addRectWPos = AddRectWPos(
        room,
        pos1,
        20,
        10,
        VisualDisplayLevels.All
      );
      const addRectWCoords = AddRectWCoords(
        room,
        pos1.x,
        pos1.y,
        20,
        10,
        VisualDisplayLevels.All
      );

      expect(
        addRectWPos.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
      expect(
        addRectWCoords.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("AddPoly method", () => {
    const room = mockInstanceOf<Room>({ visual: { poly: jest.fn() } });
    const pos1 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    const pos2 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    it("should return OK", () => {
      const addPoly = AddPoly(room, [pos1, pos2], VisualDisplayLevels.Info);
      const addPoly2 = AddPoly(
        room,
        [
          [pos1.x, pos1.y],
          [pos2.x, pos2.y],
        ],
        VisualDisplayLevels.Info
      );

      expect(addPoly.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(addPoly2.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const addPoly = AddPoly(room, [pos1, pos2], VisualDisplayLevels.All);
      const addPoly2 = AddPoly(
        room,
        [
          [pos1.x, pos1.y],
          [pos2.x, pos2.y],
        ],
        VisualDisplayLevels.All
      );

      expect(
        addPoly.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
      expect(
        addPoly2.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("AddText method", () => {
    const room = mockInstanceOf<Room>({ visual: { text: jest.fn() } });
    const pos1 = mockInstanceOf<RoomPosition>({ x: 20, y: 20 });
    it("should return OK", () => {
      const addTextWPos = AddTextWPos(
        room,
        "textGoesHere",
        pos1,
        VisualDisplayLevels.Info
      );
      const addTextWCoords = AddTextWCoords(
        room,
        "textGoesHere",
        pos1.x,
        pos1.y,
        VisualDisplayLevels.Info
      );

      expect(addTextWPos.code === FunctionReturnCodes.OK).toBeTruthy();
      expect(addTextWCoords.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const addTextWPos = AddTextWPos(
        room,
        "textGoesHere",
        pos1,
        VisualDisplayLevels.All
      );
      const addTextWCoords = AddTextWCoords(
        room,
        "textGoesHere",
        pos1.x,
        pos1.y,
        VisualDisplayLevels.All
      );

      expect(
        addTextWPos.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
      expect(
        addTextWCoords.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
});
