import * as vscode from 'vscode';
import { ApiClient } from './api-client';

export class RimePanel {
    private panel: vscode.WebviewPanel | undefined;
    private apiClient: ApiClient;

    constructor(
        private readonly extensionUri: vscode.Uri,
        apiClient: ApiClient
    ) {
        this.apiClient = apiClient;
    }

    public show() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'rimePanel',
            'RIME Assistant',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    public dispose() {
        this.panel?.dispose();
    }

    private getWebviewContent(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background: var(--vscode-editor-background);
                        font-family: var(--vscode-font-family);
                    }
                    .status {
                        padding: 10px;
                        border-radius: 4px;
                        background: var(--vscode-editor-inactiveSelectionBackground);
                        margin-bottom: 20px;
                    }
                    button {
                        padding: 8px 16px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-right: 8px;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <h2>RIME AI Assistant</h2>
                <div class="status">
                    <strong>Status:</strong> <span id="status">Connected</span>
                </div>
                <div>
                    <button onclick="openDashboard()">Open Dashboard</button>
                    <button onclick="checkHealth()">Check Health</button>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    function openDashboard() {
                        vscode.postMessage({ command: 'openDashboard' });
                    }
                    
                    function checkHealth() {
                        vscode.postMessage({ command: 'checkHealth' });
                    }
                </script>
            </body>
            </html>
        `;
    }
}
