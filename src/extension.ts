import { CodeForIBMi } from '@halcyontech/vscode-ibmi-types';
import * as vscode from 'vscode';
import { runCLCommand } from './commands';

export let code4i: CodeForIBMi;

export async function activate(context: vscode.ExtensionContext) {
	const codeForIBMiExtension = vscode.extensions.getExtension<CodeForIBMi>('halcyontechltd.code-for-ibmi');
	if (codeForIBMiExtension) {
		code4i = codeForIBMiExtension.isActive ? codeForIBMiExtension.exports : await codeForIBMiExtension.activate();
	}
	else {
		throw new Error(vscode.l10n.t("This extension requires the 'halcyontechltd.code-for-ibmi' extension to be activated!"));
	}

	context.subscriptions.push(
		vscode.commands.registerCommand("byoe.runCLCommand", runCLCommand)
	);

	console.log("Extension activated");
}

export function deactivate() {
	console.log("Extension deactivated");
}
