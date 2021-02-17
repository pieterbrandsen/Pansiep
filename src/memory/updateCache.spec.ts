import { mockGlobal } from "screeps-jest";
import Initialization from "./initialization";
import updateCache from "./updateCache";
import UpdateCache from "./updateCache";


describe("Updates cache of live objects", () => {
  it("should call all updateCache methods", () => {
    mockGlobal<Memory>("Memory", {}, true);
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined), rooms: {}, time: 5000, structures: {}, creeps: {} });
    Initialization.InitializeGlobalMemory();

    expect(UpdateCache.UpdateCache()).toBeTruthy();
  });
});