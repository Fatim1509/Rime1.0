import * as vscode from 'vscode';
import { RimePanel } from './rime-panel';
import { ApiClient } from './api-client';

let panel: RimePanel | undefined;
let apiClient: ApiClient;

export function activate(context: vscode.ExtensionContext) {
    console.log('RIME extension activated');

    const config = vscode.workspace.getConfiguration('rime');
    const apiUrl = config.get<string>('apiUrl') || 'http://localhost:4000';
    
    apiClient = new ApiClient(apiUrl);

    // Open Panel Command
    context.subscriptions.push(
        vscode.commands.registerCommand('rime.openPanel', () => {
            if (!panel) {
                panel = new RimePanel(context.extensionUri, apiClient);
            }
            panel.show();
        })
    );

    // Explain Code Command
    context.subscriptions.push(
        vscode.commands.registerCommand('rime.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('Please select code to explain');
                return;
            }

            await apiClient.submitIntent(`explain this code: ${selection}`);
            vscode.window.showInformationMessage('Explanation requested from RIME');
        })
    );

    // Fix Error Command
    context.subscriptions.push(
        vscode.commands.registerCommand('rime.fixError', async () => {
            const diagnostics = vscode.languages.getDiagnostics();
            if (diagnostics.length === 0) {
                vscode.window.showInformationMessage('No errors detected');
                return;
            }

            const errors = diagnostics
                .flatMap(([uri, diags]) => 
                    diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error)
                )
                .slice(0, 3);

            if (errors.length === 0) {
                vscode.window.showInformationMessage('No errors found');
                return;
            }

            await apiClient.submitIntent(`fix these errors: ${errors.map(e => e.message).join(', ')}`);
            vscode.window.showInformationMessage('Fix requested from RIME');
        })
    );

    // Auto-detect errors
    if (config.get<boolean>('autoDetectErrors')) {
        vscode.languages.onDidChangeDiagnostics(async (e) => {
            // Could auto-suggest fixes here
        });
    }
}

export function deactivate() {
    if (panel) {
        panel.dispose();
    }
}
