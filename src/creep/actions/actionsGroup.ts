import ExecuteAttack from "./attack";
import ExecuteBuild from "./build";
import ExecuteClaim from "./claim";
import ExecuteDismantle from "./dismantle";
import ExecuteHarvest from "./harvest";
import ExecuteHeal from "./heal";
import ExecuteMove from "./move";
import ExecuteRepair from "./repair";
import ExecuteTransfer from "./transfer";
import ExecuteUpgrade from "./upgrade";
import ExecuteWithdraw from "./withdraw";

export default class CreepActions {
  public static Attack = ExecuteAttack;

  public static Build = ExecuteBuild;

  public static Claim = ExecuteClaim;

  public static Dismantle = ExecuteDismantle;

  public static Harvest = ExecuteHarvest;

  public static Heal = ExecuteHeal;

  public static Move = ExecuteMove;

  public static Repair = ExecuteRepair;

  public static Transfer = ExecuteTransfer;

  public static Upgrade = ExecuteUpgrade;

  public static Withdraw = ExecuteWithdraw;
}
