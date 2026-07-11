const vscode = require('vscode');
const fetch = require('node-fetch');

/**
 * Activate extension
 * Registers two commands:
 * - deepseek.setApiKey : prompts user to save API key into SecretStorage
 * - deepseek.search : prompts for query and calls DeepSeek API
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('deepseek.setApiKey', async () => {
      const key = await vscode.window.showInputBox({ prompt: 'Enter DeepSeek API key', ignoreFocusOut: true, password: true });
      if (key) {
        await context.secrets.store('deepseek.apiKey', key);
        vscode.window.showInformationMessage('DeepSeek API key saved to Secret Storage.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('deepseek.search', async () => {
      const apiKey = await context.secrets.get('deepseek.apiKey');
      if (!apiKey) {
        const setNow = 'Set API Key';
        const r = await vscode.window.showInformationMessage('DeepSeek API key not set.', setNow);
        if (r === setNow) await vscode.commands.executeCommand('deepseek.setApiKey');
        return;
      }

      const query = await vscode.window.showInputBox({ prompt: 'DeepSeek: Enter search query', ignoreFocusOut: true });
      if (!query) return;

      // TODO: replace the URL below with the real DeepSeek API endpoint
      const endpoint = 'https://api.deepseek.example/search';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({ query })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : (data.hits || []);

        if (!results.length) {
          vscode.window.showInformationMessage('No results from DeepSeek.');
          return;
        }

        const labels = results.map((r, idx) => ({ label: r.title || r.text || `Result ${idx+1}`, description: r.snippet || '' }));
        const pick = await vscode.window.showQuickPick(labels, { placeHolder: 'Select a result' });
        if (!pick) return;

        // If result contains a URL, open it; otherwise show the full JSON
        const sel = results[labels.findIndex(l => l.label === pick.label)];
        if (sel && (sel.url || sel.link)) {
          const url = sel.url || sel.link;
          vscode.env.openExternal(vscode.Uri.parse(url));
        } else {
          const doc = await vscode.workspace.openTextDocument({ content: JSON.stringify(sel, null, 2), language: 'json' });
          vscode.window.showTextDocument(doc, { preview: true });
        }
      } catch (err) {
        vscode.window.showErrorMessage('DeepSeek request failed: ' + err.message);
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
