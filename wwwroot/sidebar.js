async function getJSON(url) {
    const token = sessionStorage.getItem('aps_token');
    const resp = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    
    if (!resp.ok) {
        const errorText = await resp.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to load data: ${resp.status} ${resp.statusText}`);
    }
    return resp.json();
}

function createTreeNode(id, text, icon, children = false) {
    return { id, text, children, itree: { icon } };
}

async function getHubs() {
    try {
        const hubs = await getJSON('/api/hubs');
        return hubs.map(hub => createTreeNode(`hub|${hub.id}`, hub.name, 'icon-hub', true));
    } catch (err) {
        console.error('Failed to load hubs:', err);
        return [];
    }
}

async function getProjects(hubId) {
    try {
        const projects = await getJSON(`/api/hubs/${hubId}/projects`);
        return projects.map(project => createTreeNode(`project|${hubId}|${project.id}`, project.name, 'icon-project', true));
    } catch (err) {
        console.error('Failed to load projects:', err);
        return [];
    }
}

async function getContents(hubId, projectId, folderId = null) {
    try {
        const contents = await getJSON(`/api/hubs/${hubId}/projects/${projectId}/contents` + (folderId ? `?folder_id=${folderId}` : ''));
        return contents.map(item => {
            if (item.folder) {
                return createTreeNode(`folder|${hubId}|${projectId}|${item.id}`, item.name, 'icon-my-folder', true);
            } else {
                return createTreeNode(`item|${hubId}|${projectId}|${item.id}`, item.name, 'icon-item', true);
            }
        });
    } catch (err) {
        console.error('Failed to load contents:', err);
        return [];
    }
}

async function getVersions(hubId, projectId, itemId) {
    try {
        const versions = await getJSON(`/api/hubs/${hubId}/projects/${projectId}/contents/${itemId}/versions`);
        return versions.map(version => createTreeNode(`version|${version.id}`, version.name, 'icon-version'));
    } catch (err) {
        console.error('Failed to load versions:', err);
        return [];
    }
}

export function initTree(selector, onSelectionChanged) {
    return new Promise((resolve, reject) => {
    // See http://inspire-tree.com
    const tree = new InspireTree({
        data: function (node) {
            if (!node || !node.id) {
                return getHubs();
            } else {
                const tokens = node.id.split('|');
                switch (tokens[0]) {
                    case 'hub': return getProjects(tokens[1]);
                    case 'project': return getContents(tokens[1], tokens[2]);
                    case 'folder': return getContents(tokens[1], tokens[2], tokens[3]);
                    case 'item': return getVersions(tokens[1], tokens[2], tokens[3]);
                    default: return [];
                }
            }
        }
    });
    
    tree.on('node.click', function (event, node) {
        event.preventTreeDefault();
        const tokens = node.id.split('|');
        if (tokens[0] === 'version') {
            onSelectionChanged(tokens[1]);
        }
    });
    
        const treeDOM = new InspireTreeDOM(tree, { target: selector });
        
        // Wait for initial load
        tree.on('data.loaded', () => {
            resolve(treeDOM);
        });
        
        tree.on('data.loaderror', (err) => {
            reject(err);
        });
    });
}
