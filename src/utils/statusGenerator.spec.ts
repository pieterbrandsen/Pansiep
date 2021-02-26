import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./statusGenerator";

describe("Status generator", () => {
  describe("FunctionReturnHelper method", () => {
    it("should return a object with 2 values", () => {
      const functionReturnHelper = FunctionReturnHelper(
        FunctionReturnCodes.ACCEPTED,
        true
      );
      expect(
        functionReturnHelper.code === FunctionReturnCodes.ACCEPTED
      ).toBeTruthy();
      expect(functionReturnHelper.response).toBeTruthy();

      const functionReturnHelper2 = FunctionReturnHelper(
        FunctionReturnCodes.BAD_REQUEST,
        ["a", "b"]
      );
      expect(
        functionReturnHelper2.code === FunctionReturnCodes.BAD_REQUEST
      ).toBeTruthy();
      expect(functionReturnHelper2.response).toBeInstanceOf(Array);

      const functionReturnHelper3 = FunctionReturnHelper(
        FunctionReturnCodes.CREATED,
        { a: true }
      );
      expect(
        functionReturnHelper3.code === FunctionReturnCodes.CREATED
      ).toBeTruthy();
      expect(functionReturnHelper3.response).toBeInstanceOf(Object);

      const functionReturnHelper4 = FunctionReturnHelper(
        FunctionReturnCodes.INTERNAL_SERVER_ERROR
      );
      expect(
        functionReturnHelper4.code === FunctionReturnCodes.INTERNAL_SERVER_ERROR
      ).toBeTruthy();
      expect(functionReturnHelper4.response).toBeUndefined();
    });
    it("should return a object with 1 values", () => {
      const functionReturnHelper = FunctionReturnHelper(100);
      expect(functionReturnHelper.code).toBeDefined();
      expect(functionReturnHelper.response).not.toBeDefined();
    });
  });
});
