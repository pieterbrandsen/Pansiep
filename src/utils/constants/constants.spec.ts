import RoomConstants from "./room";
import StructureConstants from "./structure";
import CreepConstants from "./creep";

describe("Constants", () => {
  it("should have 4 defined classes", () => {
    expect(RoomConstants).toBeDefined();
    expect(StructureConstants).toBeDefined();
    expect(CreepConstants).toBeDefined();
  });
});
