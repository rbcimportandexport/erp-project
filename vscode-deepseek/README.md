# DeepSeek VS Code helper

Quick scaffold to call DeepSeek from the Command Palette.

Usage
- Open this folder in VS Code (or add it to your workspace).
- Run the Extension Development Host (press F5) to load the extension.
- From the Command Palette (Ctrl+Shift+P) run `DeepSeek: Set API Key` and paste your API key.
- Then run `DeepSeek: Search` and enter a query.

Notes
- Replace the placeholder API endpoint in `extension.js` with your real DeepSeek URL.
- This extension stores the API key securely using VS Code SecretStorage.
- Run `npm install` inside this folder to install `node-fetch`.
