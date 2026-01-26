import vscode, { l10n } from "vscode";
import { code4i } from "./extension";

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