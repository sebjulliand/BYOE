import { ObjectItem } from "@halcyontech/vscode-ibmi-types";
import vscode, { l10n } from "vscode";
import { code4i } from "./extension";
import { openOutput } from "./utils";

export async function runCLCommand() {
  //Show input box so the user can enter a command
  const clCommand = await vscode.window.showInputBox({
    placeHolder: l10n.t("CL command..."),
    title: l10n.t("Run a CL command"),
  });

  if (clCommand) {
    const result = await code4i.instance.getConnection().runCommand({ command: clCommand });
    if (result.code === 0) {
      if (await vscode.window.showInformationMessage(l10n.t("CL Command successfully executed 🥳"), result.stdout ? l10n.t("Open output") : '')) {
        vscode.workspace.openTextDocument({ content: result.stdout || result.stderr });
      }
    }
    else {
      if (await vscode.window.showErrorMessage(l10n.t("CL Command failed 🤬"), l10n.t("Open output"))) {
        vscode.workspace.openTextDocument({ content: result.stderr || result.stdout });
      }
    }
  }
}

export async function displayFileDescription(item: ObjectItem) {
  const file = item.object;
  const result = await code4i.instance.getConnection().runCommand({ command: `DSPFD FILE(${file.library}/${file.name}) OUTPUT(*PRINT) FILEATR(*ALL)` });
  if (result.code === 0) {
    openOutput(l10n.t("{0}/{1} file description", file.library, file.name), result.stdout);
  }
  else {
    if (await vscode.window.showErrorMessage(l10n.t("Could not get description for file {0}/{1}", file.library, file.name), l10n.t("Open output"))) {
      vscode.workspace.openTextDocument({ content: result.stderr || result.stdout });
    }
  }
}

export async function displayFileColumns(item: ObjectItem) {
  const rows = await code4i.instance.getConnection().runSQL(`
    select *
    from qsys2.columns
    where table_schema = '${item.object.library}' and
          table_name = '${item.object.name}'
          order by column_name
    `);

  if (rows) {
    const page = code4i.customUI();
    rows.forEach(row => {
      page.addHeading(row.COLUMN_NAME as string, 3)
        .addParagraph(`
        <ul>
        ${Object.entries(row)
            .sort(([column1], [column2]) => column1.localeCompare(column2))
            .filter(([column, value]) => column !== 'COLUMN_NAME' && value !== null)
            .map(([column, value]) => `<li><b>${column}</b>: ${value}</li>`)
            .join("\n")
          }
        </ul>
        `);
    });
    page.loadPage(l10n.t(`Columns of {0}.{1}`, item.object.library, item.object.name));
  }
}