async function getAccessToken(callback) {
    try {
        const token = sessionStorage.getItem('aps_token');
        if (!token) {
            throw new Error('No token available');
        }
        
        const resp = await fetch('/api/auth/token', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!resp.ok)
            throw new Error(await resp.text());
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);        
    }
}

export function initViewer(container) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, function () {
            const config = {
                extensions: ['Autodesk.DocumentBrowser']
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            resolve(viewer);
        });
    });
}

export function loadModel(viewer, urn) {
    return new Promise((resolve, reject) => {
        function onDocumentLoadSuccess(doc) {
            viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
            resolve();
        }
        function onDocumentLoadFailure(code, message) {
            console.error('Model load failed:', message);
            reject(new Error(message));
        }
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}
