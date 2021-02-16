interface IConsoleCommands {}

export default class ConsoleCommands implements IConsoleCommands {
  public static AssignCommandsToHeap(): boolean {
    if (global.help === undefined) global.help = this.HelpCommand;
    return true;
  }

  private static DescribeFunction(
    name: string,
    description: string,
    params?: { name: string; type: string }[]
  ): string {
    let string = "";
    string += `<br><br>Function   name: ${name}<br>Description: ${description}`;
    if (params && params.length > 0) {
      string += "<br>Params:";
      params.forEach((param) => {
        string += `<br>Name = ${param.name}, Type = ${param.type}`;
      });
    }
    string +=
      "<br>----------------------------------------------------------------";
    return string;
  }

  public static HelpCommand(): string {
    let helpMessage: string = "<span style='color:Cornsilk'>";
    helpMessage += "All functions accessible using the Console";
    helpMessage += this.DescribeFunction(
      "functionName",
      "functionDescription",
      [{ name: "param1", type: "string" }]
    );
    helpMessage += this.DescribeFunction(
      "functionName2",
      "functionDescription2"
    );
    helpMessage += "<br><br>EndOfList";
    helpMessage += "</span";
    return helpMessage;
  }
}
