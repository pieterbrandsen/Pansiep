import RoomConstants from "./room";
import CreepConstants from "./creep";

describe("Constants", () => {
  it("should have 4 defined classes", () => {
    expect(RoomConstants).toBeDefined();
    expect(CreepConstants).toBeDefined();
  });
});
