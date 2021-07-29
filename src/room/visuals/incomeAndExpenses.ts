import { forEach } from "lodash";
import RoomConstants from "../../utils/constants/room";
import WrapperHandler from "../../utils/wrapper";
import DrawVisualHandler from "./drawVisual";

/**
 * Draws all income and expenses visuals
 */
export default WrapperHandler.FuncWrapper(function RoomIncomeAndExpensesVisuals(
  room: Room,
  roomStats: RoomStats
): void {
  const visualDisplayLevel = RoomConstants.VisualDisplayLevels.Info;
  if (DrawVisualHandler.ShouldVisualsBeDisplayed(visualDisplayLevel) === false)
    return;

  const defaultXCoord = 9;
  const textXPos = defaultXCoord + 0.3;

  const secondRowX = defaultXCoord + 8;
  const textSecondRowXPos = secondRowX + 0.3;
  const subTitleTextStyle: TextStyle = {
    align: "left",
    font: 0.9,
  };
  const textStyle: TextStyle = {
    align: "left",
  };
  let topLeftPos = 5;
  let topLeftSecondRowPos = 5;
  DrawVisualHandler.AddLineWCoords(
    room,
    defaultXCoord,
    topLeftPos + 1,
    defaultXCoord,
    topLeftPos + 21,

    { opacity: 1 }
  );
  DrawVisualHandler.AddRectWCoords(
    room,
    defaultXCoord,
    (topLeftPos += 1),
    18,
    20,

    {
      opacity: 0.65,
      fill: "Grey",
    }
  );

  // Empire
  topLeftPos += 1;
  DrawVisualHandler.AddTextWCoords(
    room,
    "> Net Profit",
    textXPos,
    (topLeftPos += 1),
    subTitleTextStyle
  );

  const energyIncomeAndExpensesList: {
    income: StringMap<number>;
    expenses: StringMap<number>;
  } = { income: {}, expenses: {} };
  forEach(Object.values(Memory.stats.rooms), (memRoomStats: RoomStats) => {
    forEach(
      Object.entries(memRoomStats.energyIncome),
      ([incomeName, incomeAmount]) => {
        // if (energyIncomeAndExpensesList.income[key])
        // energyIncomeAndExpensesList.income[key] += value;
        // else energyIncomeAndExpensesList.income[key] = value;
        energyIncomeAndExpensesList.income[incomeName] = incomeAmount;
      }
    );
    forEach(
      Object.entries(memRoomStats.energyExpenses),
      ([expenseName, expenseCostObj]) => {
        let cost = 0;
        if (typeof expenseCostObj === "number") {
          cost = expenseCostObj;
        } else {
          cost = Object.values(expenseCostObj).reduce<number>((acc, curr) => {
            // DELETEME -eslint-disable-next-line no-param-reassign
            acc += curr as number;
            return acc;
          }, 0);
        }
        // if (energyIncomeAndExpensesList.expenses[expenseName])
        // energyIncomeAndExpensesList.expenses[expenseName] += cost;
        // else energyIncomeAndExpensesList.expenses[expenseName] = cost;
        energyIncomeAndExpensesList.expenses[expenseName] = cost;
      }
    );
  });
  const globalEnergyIncome = Object.entries(energyIncomeAndExpensesList.income)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  const globalEnergyExpenses = Object.entries(
    energyIncomeAndExpensesList.expenses
  )
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);

  DrawVisualHandler.AddTextWCoords(
    room,
    "Income:",
    textXPos,
    (topLeftPos += 1),
    textStyle
  );
  forEach(globalEnergyIncome, ([key, value]) => {
    DrawVisualHandler.AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  // if (globalEnergyIncome.length < 5)
  topLeftPos += 5 - globalEnergyIncome.length;

  topLeftSecondRowPos += 3;
  DrawVisualHandler.AddTextWCoords(
    room,
    "Expenses:",
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    textStyle
  );
  forEach(globalEnergyExpenses, ([key, value]) => {
    DrawVisualHandler.AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      textStyle
    );
  });
  // if (globalEnergyIncome.length < 5)
  topLeftSecondRowPos += 5 - globalEnergyExpenses.length;

  // Room
  topLeftPos += 4;
  DrawVisualHandler.AddTextWCoords(
    room,
    "> Net Profit",
    textXPos,
    (topLeftPos += 1),
    subTitleTextStyle
  );
  DrawVisualHandler.AddTextWCoords(
    room,
    "Income:",
    textXPos,
    (topLeftPos += 1),
    textStyle
  );
  const energyIncome = Object.entries(roomStats.energyIncome)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  forEach(energyIncome, ([key, value]) => {
    DrawVisualHandler.AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  // if (energyIncome.length < 5) topLeftPos += 5 - energyIncome.length;
  topLeftPos += 5 - energyIncome.length;

  topLeftSecondRowPos += 5;
  DrawVisualHandler.AddTextWCoords(
    room,
    "Expenses:",
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    textStyle
  );
  const energyExpenses = Object.entries(roomStats.energyExpenses)
    .map((o) => {
      if (typeof o[1] !== "number") {
        // eslint-disable-next-line no-param-reassign
        o[1] = Object.values(o[1]).reduce<number>((acc, curr) => {
          // eslint-disable-next-line no-param-reassign
          acc += curr as number;
          return acc;
        }, 0);
      }
      return o;
    })
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  forEach(energyExpenses, ([key, value]) => {
    DrawVisualHandler.AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      textStyle
    );
  });
  // if (energyIncome.length < 5) topLeftSecondRowPos += 5 - energyExpenses.length;
  topLeftSecondRowPos += 5 - energyExpenses.length;
});
