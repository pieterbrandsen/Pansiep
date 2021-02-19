import StructureConfig from "./structure";
import CreepConfig from "./creep";

describe("Config", () => {
  it("should have 4 defined classes", () => {
    expect(StructureConfig).toBeDefined();
    expect(CreepConfig).toBeDefined();
  });
});
