import { forEach } from "lodash";
import RoomConstants from "../../utils/constants/room";
import FuncWrapper from "../../utils/wrapper";
import {
  AddLineWCoords,
  AddRectWCoords,
  AddTextWCoords,
  ShouldVisualsBeDisplayed,
} from "./draw";

/**
 * Draws all income and expenses visuals
 */
export default FuncWrapper(function RoomIncomeAndExpensesVisuals(
  room: Room,
  roomStats: RoomStats
): void {
  const visualDisplayLevel = RoomConstants.VisualDisplayLevels.Info;
  if (ShouldVisualsBeDisplayed(visualDisplayLevel) === false) return;

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
  AddLineWCoords(
    room,
    defaultXCoord,
    topLeftPos + 1,
    defaultXCoord,
    topLeftPos + 21,

    { opacity: 1 }
  );
  AddRectWCoords(
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
  AddTextWCoords(
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
  forEach(Object.values(Memory.stats.rooms), (rs: RoomStats) => {
    forEach(Object.entries(rs.energyIncome), ([key, value]) => {
      if (energyIncomeAndExpensesList.income[key])
        energyIncomeAndExpensesList.income[key] += value;
      else energyIncomeAndExpensesList.income[key] = value;
    });
    forEach(Object.entries(rs.energyExpenses), ([key, value]) => {
      let number = 0;
      if (typeof value === "number") {
        number = value;
      } else {
        number = Object.values(value).reduce<number>((acc, curr) => {
          // eslint-disable-next-line no-param-reassign
          acc += curr as number;
          return acc;
        }, 0);
      }
      if (energyIncomeAndExpensesList.expenses[key])
        energyIncomeAndExpensesList.expenses[key] += number;
      else energyIncomeAndExpensesList.expenses[key] = number;
    });
  });
  const globalEnergyIncome = Object.entries(energyIncomeAndExpensesList.income)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  const globalEnergyExpenses = Object.entries(
    energyIncomeAndExpensesList.expenses
  )
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);

  AddTextWCoords(room, "Income:", textXPos, (topLeftPos += 1), textStyle);
  forEach(globalEnergyIncome, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  if (globalEnergyIncome.length < 5)
    topLeftPos += 5 - globalEnergyIncome.length;

  topLeftSecondRowPos += 3;
  AddTextWCoords(
    room,
    "Expenses:",
    textSecondRowXPos,
    (topLeftSecondRowPos += 1),
    textStyle
  );
  forEach(globalEnergyExpenses, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      textStyle
    );
  });
  if (globalEnergyIncome.length < 5)
    topLeftSecondRowPos += 5 - globalEnergyExpenses.length;

  // Room
  topLeftPos += 4;
  AddTextWCoords(
    room,
    "> Net Profit",
    textXPos,
    (topLeftPos += 1),
    subTitleTextStyle
  );
  AddTextWCoords(room, "Income:", textXPos, (topLeftPos += 1), textStyle);
  const energyIncome = Object.entries(roomStats.energyIncome)
    .slice(0, 5)
    .sort((a, b) => b[1] - a[1]);
  forEach(energyIncome, ([key, value]) => {
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textXPos,
      (topLeftPos += 1),
      textStyle
    );
  });
  if (energyIncome.length < 5) topLeftPos += 5 - energyIncome.length;

  topLeftSecondRowPos += 5;
  AddTextWCoords(
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
    AddTextWCoords(
      room,
      `${key}: ${value.toFixed(3)}`,
      textSecondRowXPos,
      (topLeftSecondRowPos += 1),
      textStyle
    );
  });
  if (energyIncome.length < 5) topLeftSecondRowPos += 5 - energyExpenses.length;
});
