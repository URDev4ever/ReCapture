// 📋 Hello, random github user, to use this tool just copy and paste this script into the DevTools console (F12 -> Console)

(function() {
    'use strict';
    
    // ===== CONFIGURATION ===== (You have to change this BEFORE pasting btw)
    const CONFIG = {
        captureAll: true,           // Capture all requests
        showInRealTime: true,       // Show in real time
        maxCaptures: 100,           // Maximum number of captures
        includeHeaders: true,       // Include headers
        includeBody: true,          // Include body
        includeResponse: false,     // Include response (can be large)
        filterMethods: ['POST'],    // Methods to capture
        filterUrls: [],             // Specific URLs (empty = all)
        excludeUrls: [],            // URLs to exclude
        autoCopy: false,            // Automatically copy to clipboard
        saveToFile: false           // Save to file
    };
    
    // ===== STATE =====
    let captures = [];
    let isCapturing = true;
    let startTime = Date.now();
    
    // ===== UI ELEMENTS =====
    function createUI() {
        // Create floating container
        const container = document.createElement('div');
        container.id = 'request-capture-ui';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #1a1a1a;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            z-index: 999999;
            font-family: monospace;
            font-size: 12px;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            border: 1px solid #333;
        `;
        
        container.innerHTML = `
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #4CAF50;">🕵️‍♂️ ReCapture</h3>
                <button id="capture-close" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">X</button>
            </div>
            <div style="margin-bottom: 10px;">
                <div>⏱️ Time: <span id="capture-time">0s</span></div>
                <div>📊 Captured: <span id="capture-count">0</span></div>
                <div>🔍 Status: <span id="capture-status" style="color: #4CAF50;">Active</span></div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
                <button id="btn-show-all" style="flex: 1; background: #2196F3; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Show All</button>
                <button id="btn-show-post" style="flex: 1; background: #FF9800; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Show POST</button>
                <button id="btn-clear" style="flex: 1; background: #f44336; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Clear</button>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
                <button id="btn-export" style="flex: 1; background: #9C27B0; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Export JSON</button>
                <button id="btn-copy" style="flex: 1; background: #009688; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Copy All</button>
                <button id="btn-toggle" style="flex: 1; background: #607D8B; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Pause</button>
            </div>
            <div style="margin-bottom: 10px;">
                <input type="text" id="search-filter" placeholder="🔍 Filter by URL or text..." style="width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #555; background: #222; color: white; border-radius: 4px;">
            </div>
            <div id="capture-list" style="max-height: 300px; overflow-y: auto; font-size: 11px;">
                <!-- Captures will appear here -->
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Event listeners
        document.getElementById('capture-close').onclick = () => container.remove();
        document.getElementById('btn-show-all').onclick = () => showAllCaptures();
        document.getElementById('btn-show-post').onclick = () => showPostCaptures();
        document.getElementById('btn-clear').onclick = clearCaptures;
        document.getElementById('btn-export').onclick = exportToJson;
        document.getElementById('btn-copy').onclick = copyToClipboard;
        document.getElementById('btn-toggle').onclick = toggleCapture;
        document.getElementById('search-filter').oninput = filterCaptures;
        
        // Update time
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('capture-time').textContent = `${elapsed}s`;
        }, 1000);
    }
    
    // ===== INTERCEPTORS =====
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [resource, config = {}] = args;
        const url = typeof resource === 'string' ? resource : resource.url;
        const method = config.method || 'GET';
        
        if (shouldCapture(url, method)) {
            const captureId = Date.now() + Math.random();
            const capture = {
                id: captureId,
                timestamp: new Date().toISOString(),
                type: 'fetch',
                method: method,
                url: url,
                headers: config.headers ? {...config.headers} : {},
                body: config.body,
                requestConfig: config
            };
            
            processCapture(capture);
            
            // Also intercept the response
            try {
                const response = await originalFetch.apply(this, args);
                
                if (CONFIG.includeResponse) {
                    const clonedResponse = response.clone();
                    const responseData = {
                        status: clonedResponse.status,
                        statusText: clonedResponse.statusText,
                        headers: Object.fromEntries(clonedResponse.headers.entries()),
                        body: await clonedResponse.text()
                    };
                    
                    updateCapture(captureId, { response: responseData });
                }
                
                return response;
            } catch (error) {
                updateCapture(captureId, { error: error.toString() });
                throw error;
            }
        }
        
        return originalFetch.apply(this, args);
    };
    
    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    const originalXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    
    XMLHttpRequest.prototype.open = function(method, url) {
        this._captureData = {
            method: method,
            url: url,
            headers: {},
            timestamp: new Date().toISOString()
        };
        
        // Intercept setRequestHeader to capture headers
        this.setRequestHeader = function(header, value) {
            this._captureData.headers[header] = value;
            return originalXHRSetHeader.apply(this, arguments);
        };
        
        return originalXHROpen.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
        if (this._captureData && shouldCapture(this._captureData.url, this._captureData.method)) {
            const captureId = Date.now() + Math.random();
            const capture = {
                id: captureId,
                timestamp: this._captureData.timestamp,
                type: 'xhr',
                method: this._captureData.method,
                url: this._captureData.url,
                headers: this._captureData.headers,
                body: body
            };
            
            processCapture(capture);
            
            // Intercept response
            const originalOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function() {
                if (this.readyState === 4 && CONFIG.includeResponse) {
                    const responseData = {
                        status: this.status,
                        statusText: this.statusText,
                        responseText: this.responseText,
                        responseType: this.responseType
                    };
                    
                    updateCapture(captureId, { response: responseData });
                }
                
                if (originalOnReadyStateChange) {
                    return originalOnReadyStateChange.apply(this, arguments);
                }
            };
            
            // Also intercept addEventListener events
            const originalAddEventListener = this.addEventListener;
            if (originalAddEventListener) {
                this.addEventListener = function(type, listener, options) {
                    if (type === 'load' && CONFIG.includeResponse) {
                        const wrappedListener = function(event) {
                            const responseData = {
                                status: this.status,
                                statusText: this.statusText,
                                responseText: this.responseText
                            };
                            
                            updateCapture(captureId, { response: responseData });
                            return listener.call(this, event);
                        };
                        
                        return originalAddEventListener.call(this, type, wrappedListener, options);
                    }
                    
                    return originalAddEventListener.call(this, type, listener, options);
                };
            }
        }
        
        return originalXHRSend.apply(this, arguments);
    };
    
    // ===== HELPER FUNCTIONS =====
    function shouldCapture(url, method) {
        if (!isCapturing) return false;
        if (!CONFIG.filterMethods.includes(method.toUpperCase())) return false;
        
        if (CONFIG.filterUrls.length > 0) {
            return CONFIG.filterUrls.some(filter => url.includes(filter));
        }
        
        if (CONFIG.excludeUrls.length > 0) {
            return !CONFIG.excludeUrls.some(exclude => url.includes(exclude));
        }
        
        return true;
    }
    
    function processCapture(capture) {
        if (!isCapturing) return;
        
        // Limit number of captures
        if (captures.length >= CONFIG.maxCaptures) {
            captures.shift();
        }
        
        captures.push(capture);
        
        // Update UI
        updateUI();
        
        // Show in console
        if (CONFIG.showInRealTime) {
            console.log(`📡 [${capture.method}] ${capture.url}`);
            
            if (capture.body) {
                try {
                    if (typeof capture.body === 'string') {
                        console.log('📦 Body:', capture.body.substring(0, 200));
                    } else if (capture.body instanceof FormData) {
                        console.log('📦 FormData entries:', Array.from(capture.body.entries()));
                    }
                } catch (e) {
                    console.log('📦 Body:', capture.body);
                }
            }
        }
        
        // Auto-copy if enabled (not always working though)
        if (CONFIG.autoCopy && capture.method === 'POST') {
            setTimeout(() => {
                const formatted = formatCaptureForCopy(capture);
                navigator.clipboard.writeText(formatted).catch(() => {
                    console.log('📋 Capture (to copy manually):', formatted);
                });
            }, 100);
        }
    }
    
    function updateCapture(id, data) {
        const capture = captures.find(c => c.id === id);
        if (capture) {
            Object.assign(capture, data);
        }
    }
    
    function updateUI() {
        const countEl = document.getElementById('capture-count');
        const statusEl = document.getElementById('capture-status');
        const listEl = document.getElementById('capture-list');
        
        if (countEl) countEl.textContent = captures.length;
        if (statusEl) statusEl.textContent = isCapturing ? 'Active' : 'Paused';
        if (statusEl) statusEl.style.color = isCapturing ? '#4CAF50' : '#FF9800';
        
        if (listEl) {
            // Show last 10 captures
            const recentCaptures = captures.slice(-10).reverse();
            listEl.innerHTML = recentCaptures.map(capture => `
                <div style="padding: 5px; margin: 2px 0; background: #2a2a2a; border-radius: 4px; border-left: 3px solid ${capture.method === 'POST' ? '#FF9800' : '#2196F3'};">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: ${capture.method === 'POST' ? '#FF9800' : '#2196F3'}">${capture.method}</span>
                        <span style="font-size: 10px; color: #888;">${new Date(capture.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style="font-size: 10px; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${capture.url}">
                        ${capture.url}
                    </div>
                    ${capture.body ? `<div style="font-size: 9px; color: #999; margin-top: 3px;">📦 ${typeof capture.body === 'string' ? capture.body.substring(0, 50) + '...' : 'Binary/FormData'}</div>` : ''}
                </div>
            `).join('');
        }
    }
    
    // ===== UI FUNCTIONS =====
    function showAllCaptures() {
        console.clear();
        console.log('%c📊 ALL CAPTURED REQUESTS', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
        console.log(`Total: ${captures.length} requests`);
        
        captures.forEach((capture, index) => {
            console.log(`\n[${index + 1}] ${capture.method} ${capture.url}`);
            console.log(`   Time: ${capture.timestamp}`);
            console.log(`   Type: ${capture.type}`);
            
            if (Object.keys(capture.headers).length > 0) {
                console.log('   Headers:', capture.headers);
            }
            
            if (capture.body) {
                console.log('   Body:', capture.body);
            }
            
            if (capture.response) {
                console.log('   Response:', capture.response);
            }
        });
    }
    
    function showPostCaptures() {
        const postCaptures = captures.filter(c => c.method === 'POST');
        
        console.clear();
        console.log('%c📊 POST REQUESTS ONLY', 'color: #FF9800; font-size: 16px; font-weight: bold;');
        console.log(`Total POST: ${postCaptures.length} requests`);
        
        postCaptures.forEach((capture, index) => {
            console.log(`\n[${index + 1}] POST ${capture.url}`);
            console.log(`   Time: ${capture.timestamp}`);
            
            if (Object.keys(capture.headers).length > 0) {
                console.log('   Headers:', JSON.stringify(capture.headers, null, 2));
            }
            
            if (capture.body) {
                console.log('   Body:', capture.body);
                
                // Try to parse JSON
                if (typeof capture.body === 'string') {
                    try {
                        const parsed = JSON.parse(capture.body);
                        console.log('   Body (parsed):', parsed);
                    } catch (e) {
                        // Not JSON
                    }
                    
                    // Try to parse FormData
                    if (capture.body.includes('&')) {
                        const params = new URLSearchParams(capture.body);
                        const obj = {};
                        for (let [key, value] of params.entries()) {
                            obj[key] = value;
                        }
                        console.log('   Body (form):', obj);
                    }
                }
            }
            
            if (capture.response) {
                console.log('   Response Status:', capture.response.status);
                if (capture.response.body) {
                    console.log('   Response Body:', capture.response.body.substring(0, 200) + '...');
                }
            }
        });
        
        return postCaptures;
    }
    
    function clearCaptures() {
        captures = [];
        updateUI();
        console.log('%c🧹 All captures cleared', 'color: #f44336;');
    }
    
    function toggleCapture() {
        isCapturing = !isCapturing;
        const btn = document.getElementById('btn-toggle');
        if (btn) btn.textContent = isCapturing ? 'Pause' : 'Resume';
        updateUI();
        console.log(`%c${isCapturing ? '▶️ Capture resumed' : '⏸️ Capture paused'}`, `color: ${isCapturing ? '#4CAF50' : '#FF9800'};`);
    }
    
    function filterCaptures() {
        const filter = document.getElementById('search-filter').value.toLowerCase();
        const filtered = captures.filter(capture => 
            capture.url.toLowerCase().includes(filter) ||
            (capture.body && capture.body.toString().toLowerCase().includes(filter))
        );
        
        console.clear();
        console.log(`🔍 Filtered: "${filter}" - Found ${filtered.length} matches`);
        
        filtered.forEach((capture, index) => {
            console.log(`\n[${index + 1}] ${capture.method} ${capture.url}`);
            if (capture.body) {
                console.log('   Body:', capture.body.toString().substring(0, 150));
            }
        });
    }
    
    function exportToJson() {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                url: window.location.href,
                totalCaptures: captures.length,
                config: CONFIG
            },
            captures: captures
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `request-captures-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('%c💾 Exported to JSON file', 'color: #9C27B0;');
    }
    
    function copyToClipboard() {
        const formatted = captures.map(formatCaptureForCopy).join('\n\n' + '='.repeat(50) + '\n\n');
        
        navigator.clipboard.writeText(formatted).then(() => {
            console.log('%c📋 All captures copied to clipboard', 'color: #009688;');
        }).catch(() => {
            console.log('%c📋 Copy this manually:', 'color: #009688;');
            console.log(formatted);
        });
    }
    
    function formatCaptureForCopy(capture) {
        let text = `[${capture.method}] ${capture.url}\n`;
        text += `Time: ${capture.timestamp}\n`;
        text += `Type: ${capture.type}\n`;
        
        if (Object.keys(capture.headers).length > 0) {
            text += `Headers:\n${JSON.stringify(capture.headers, null, 2)}\n`;
        }
        
        if (capture.body) {
            text += `Body:\n${capture.body}\n`;
            
            // Try to format
            if (typeof capture.body === 'string') {
                try {
                    const parsed = JSON.parse(capture.body);
                    text += `Body (parsed JSON):\n${JSON.stringify(parsed, null, 2)}\n`;
                } catch (e) {
                    // Not JSON
                }
            }
        }
        
        if (capture.response) {
            text += `Response Status: ${capture.response.status}\n`;
            if (capture.response.body) {
                text += `Response Body:\n${capture.response.body.substring(0, 500)}...\n`;
            }
        }
        
        return text;
    }
    
    // ===== GLOBAL FUNCTIONS =====
    window.captureCommands = {
        showAll: showAllCaptures,
        showPost: showPostCaptures,
        clear: clearCaptures,
        export: exportToJson,
        copy: copyToClipboard,
        toggle: toggleCapture,
        pause: () => { isCapturing = false; updateUI(); },
        resume: () => { isCapturing = true; updateUI(); },
        filter: filterCaptures,
        getCaptures: () => captures,
        getPostCaptures: () => captures.filter(c => c.method === 'POST'),
        find: (text) => captures.filter(c => 
            c.url.includes(text) || 
            (c.body && c.body.toString().includes(text))
        ),
        getLast: (count = 1) => captures.slice(-count),
        getByIndex: (index) => captures[index],
        config: CONFIG
    };
    
    // ===== INITIALIZATION =====
    createUI();
    
    console.clear();
    console.log('%c🕵️‍♂️ RECAPTURE ACTIVATED', 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; border-radius: 5px;');
    console.log('%c📋 Commands available:', 'color: #2196F3; font-weight: bold;');
    console.log('  captureCommands.showAll()     - Show all captures');
    console.log('  captureCommands.showPost()    - Show only POST requests');
    console.log('  captureCommands.clear()       - Clear all captures');
    console.log('  captureCommands.export()      - Export to JSON file');
    console.log('  captureCommands.copy()        - Copy to clipboard');
    console.log('  captureCommands.toggle()      - Toggle capture on/off');
    console.log('  captureCommands.find("text")  - Search captures');
    console.log('  captureCommands.getLast(5)    - Get last 5 captures');
    console.log('  captureCommands.getPostCaptures() - Get all POST');
    console.log('\n%c🎯 Now interact with the page to capture requests...', 'color: #4CAF50;');
    console.log('%c📊 UI panel is in the top-right corner', 'color: #FF9800;');
    
    // Update initial UI
    updateUI();
    
})();
