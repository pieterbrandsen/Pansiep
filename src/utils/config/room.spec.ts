import { VisualLevel } from "./room";

describe("Room config", () => {
  it("should have VisualLevel", () => {
    expect(VisualLevel).toBeGreaterThanOrEqual(0);
  });
});
