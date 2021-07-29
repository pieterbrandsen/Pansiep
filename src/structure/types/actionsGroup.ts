import ExecuteContainer from "./container";
import ExecuteController from "./controller";
import ExecuteExtension from "./extension";
import ExecuteFactory from "./factory";
import ExecuteLab from "./lab";
import ExecuteLink from "./link";
import ExecuteNuker from "./nuker";
import ExecuteObserver from "./observer";
import ExecuteRoad from "./road";
import ExecuteSpawnHandler from "./spawn";
import ExecuteStorage from "./storage";
import ExecuteTerminal from "./terminal";
import ExecuteTowerHandler from "./tower";

export default class StructureActions {
  public static Container = ExecuteContainer;

  public static Controller = ExecuteController;

  public static Extension = ExecuteExtension;

  public static Factory = ExecuteFactory;

  public static Lab = ExecuteLab;

  public static Link = ExecuteLink;

  public static Nuker = ExecuteNuker;

  public static Observer = ExecuteObserver;

  public static Road = ExecuteRoad;

  public static SpawnHandler = ExecuteSpawnHandler;

  public static Storage = ExecuteStorage;

  public static Terminal = ExecuteTerminal;

  public static TowerHandler = ExecuteTowerHandler;
}
