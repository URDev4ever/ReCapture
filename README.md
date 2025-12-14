<h1 align="center">ReCapture</h1>
<h3 align="center">A lightweight in-browser Request Viewer that intercepts and displays fetch/XHR requests in real time. Includes filters, live UI, POST parsing, export to JSON, auto-copy, and a floating DevTools console panel. Just paste it into DevTools and start capturing.</h3>


## 📋 QUICK START
  You can either copy ReCapture.js and paste it in DevTools (F12 > Console > Ctrl + v) OR create a persistent script that you can enable/disable whenever you like WHITHOUT you having to keep coming to this horrible repo and copying the script.
  For that last option, you can use TAMPERMONKEY:
1. **Copy the script** from above
2. **Open Tampermonkey** in your browser
3. **Create new script** (`+` button)
4. **Paste the code**
5. **Save** (Ctrl+S)
6. **Enable the script**
7. **Reload any page** (F5)
8. **Done!** UI appears automatically

## 🚀 INSTALLATION INSTRUCTIONS

### Step-by-Step:

**1. Install Tampermonkey Extension:**
- Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/

**2. Create New Script:**
- Click Tampermonkey icon
- Select "Create a new script"
- Delete all existing code

**3. Paste This Script:**
```javascript
// ==UserScript==
// @name         ReCapture
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Capture and analyze HTTP requests in real-time
// @author       URDev
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// PASTE THE ENTIRE SCRIPT FROM ABOVE HERE
// (Start from (function() { to })();)
```

4. **Save & Enable:**
- Press `Ctrl+S` to save
- Ensure script is enabled (toggle switch ON)
- Reload any webpage

## 🎯 HOW TO USE

**Once installed:**
1. **Visit any website**
2. **UI panel appears** (top-right corner)
<img width="231" height="260" alt="recapture ui" src="https://github.com/user-attachments/assets/ae5fe392-f6de-49f8-b4f5-977618c41a7a" />

3. **Interact with the page** - requests are captured automatically
 <img width="415" height="542" alt="recapture capturing" src="https://github.com/user-attachments/assets/62961b07-f6c9-460d-bd56-c54c5dddf8a6" />

4. **Use buttons** in the panel to:
   - Show all captures
   - Show only POST requests
   - Export to JSON
   - Copy to clipboard
   - Filter results

**Console Commands:**
```javascript
captureCommands.showAll()         - Show all captures
captureCommands.showPost()        - Show only POST requests
captureCommands.clear()           - Clear all captures
captureCommands.export()          - Export to JSON file
captureCommands.copy()            - Copy to clipboard
captureCommands.toggle()          - Toggle capture on/off
captureCommands.find("text")      - Search captures
captureCommands.getLast(5)        - Get last 5 captures
captureCommands.getPostCaptures() - Get all POST
```
<img width="273" height="303" alt="recapture console" src="https://github.com/user-attachments/assets/22238a3c-8009-4199-a90c-f986a49019dc" />


## ⚙️ CONFIGURATION

Edit these variables in the script:
```javascript
const CONFIG = {
    captureAll: true,           // Capture all requests
    showInRealTime: true,       // Real-time logging
    maxCaptures: 100,           // Storage limit
    filterMethods: ['POST'],    // Methods to capture
    filterUrls: [],             // URLs to filter (empty = all)
    excludeUrls: [],            // URLs to exclude
    includeHeaders: true,       // Include request headers
    includeBody: true,          // Include request body
    includeResponse: false,     // Include response (can be large)
    autoCopy: false,            // Auto-copy POST data
    saveToFile: false           // Auto-save to file
};
```

## 🛠️ TROUBLESHOOTING

**Issue: UI not appearing**
- Ensure Tampermonkey is enabled
- Check script is enabled in Tampermonkey dashboard
- Try reloading page (F5)
- Check browser console for errors (F12 → Console)

**Issue: Not capturing requests**
- Check CONFIG.filterMethods - set to `['GET', 'POST', 'PUT', 'DELETE']` for all
- Some sites use WebSockets (not captured by this tool)
- Ensure page is fully loaded before interacting

**Issue: Script conflicts**
- Disable other userscripts temporarily
- Check for adblockers that might interfere
- Try running in browser incognito mode

**Issue: Memory/performance**
- Reduce CONFIG.maxCaptures to 50 or lower
- Set CONFIG.includeResponse to false
- Click "Clear" button regularly to free memory

## 📁 EXPORTING DATA

**To save captures:**
1. Click "Export JSON" button in UI panel
2. File downloads automatically as `request-captures-[timestamp].json`
3. Open with any text editor, JSON viewer, or import into analysis tools

**To copy specific request:**
1. Use console command: `captureCommands.getLast(1)`
2. Copy from console output
3. Or use `captureCommands.find("search-term")` to find specific requests
4. Click "Copy All" in UI to copy all captures to clipboard

**JSON structure:**
```json
{
  "metadata": {
    "exportedAt": "2024-12-04T14:30:00.000Z",
    "url": "https://example.com",
    "totalCaptures": 42,
    "config": { ... }
  },
  "captures": [
    {
      "id": "timestamp-random",
      "timestamp": "2024-12-04T14:29:55.123Z",
      "type": "fetch",
      "method": "POST",
      "url": "https://api.example.com/login",
      "headers": { ... },
      "body": "username=test&password=123",
      "response": { ... }
    }
  ]
}
```

## 🔄 UPDATING SCRIPT

**To update:**
1. Open Tampermonkey dashboard
2. Find "ReCapture"
3. Click edit (pencil icon)
4. Replace with new code
5. Save (Ctrl+S)
6. Reload pages where script runs

**To disable temporarily:**
1. Click Tampermonkey icon in toolbar
2. Toggle "ReCapture" switch OFF
3. Toggle back ON when needed (VERY useful to just have it "stored" in TamperMonkey's scripts)

## ⚡ PRO TIPS

- **Keyboard Shortcuts:** None by default, but you can add them
- **Mobile:** Works on mobile browsers with Tampermonkey (not tested though)
- **Multiple Tabs:** Each tab has independent capture
- **Privacy:** Data stays in your browser, not sent anywhere
- **Filter specific domains:** Set `filterUrls: ["api.example.com"]` in CONFIG
- **Exclude analytics:** Set `excludeUrls: ["google-analytics.com", "facebook.com"]`

## 🚫 LIMITATIONS

- Cannot capture WebSocket traffic
- May not work on some heavily secured sites
- Requires page reload to start capturing
- Large responses can affect performance
- Some headers may be sanitized by browser

## 📞 SUPPORT

**Quick fixes:**
- Clear browser cache if UI glitches
- Disable/re-enable script in Tampermonkey
- Check for script updates
- Restart browser if issues persist
- OR just press F5 and ReRun (98% success rate)

**For issues:**
1. Check browser console (F12)
2. Capture error message
3. Note website URL where issue occurs
4. Check Tampermonkey error logs

**Debug mode:**
Enable detailed logging by adding to CONFIG:
```javascript
debugMode: true,  // Add this for verbose logging
```

With with <3 by URDev, for YOU!
