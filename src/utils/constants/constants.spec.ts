import GlobalConstants from "./global";
import RoomConstants from "./room";
import StructureConstants from "./structure";
import CreepConstants from "./creep";

describe("Constants", () => {
  it("should have 4 defined classes", () => {
    expect(GlobalConstants).toBeDefined();
    expect(RoomConstants).toBeDefined();
    expect(StructureConstants).toBeDefined();
    expect(CreepConstants).toBeDefined();
  });
});
