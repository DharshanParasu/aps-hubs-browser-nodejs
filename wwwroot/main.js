import { initViewer, loadModel } from './viewer.js';
import { initTree } from './sidebar.js';

// Token management
let currentToken = localStorage.getItem('aps_token');

// DOM elements
const login = document.getElementById('login');
const tokenModal = document.getElementById('tokenModal');
const tokenInput = document.getElementById('tokenInput');
const submitToken = document.getElementById('submitToken');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const loadingTree = document.getElementById('loadingTree');
const loadingOverlay = document.getElementById('loadingOverlay');

// Show/hide modal
function showTokenModal() {
    tokenModal.style.display = 'flex';
    tokenInput.focus();
}

function hideTokenModal() {
    tokenModal.style.display = 'none';
}

// Show loading states
function showLoading(type = 'tree') {
    if (type === 'tree') {
        loadingTree.style.display = 'flex';
    } else if (type === 'model') {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading(type = 'tree') {
    if (type === 'tree') {
        loadingTree.style.display = 'none';
    } else if (type === 'model') {
        loadingOverlay.style.display = 'none';
    }
}

// Initialize the application
async function initializeApp() {
    try {
        if (!currentToken) {
            showTokenModal();
            return;
        }

        // Set token in session storage for API calls
        sessionStorage.setItem('aps_token', currentToken);
        
        showLoading('tree');
        
        // Try to get user profile to validate token
        const resp = await fetch('/api/auth/profile');
        if (resp.ok) {
            const user = await resp.json();
            
            // Update UI
            userName.textContent = user.name;
            userInfo.style.display = 'flex';
            login.innerHTML = '<i class="fas fa-key"></i> Change Token';
            login.onclick = () => showTokenModal();
            
            // Initialize viewer and tree
            const viewer = await initViewer(document.getElementById('preview'));
            await initTree('#tree', (id) => {
                showLoading('model');
                loadModel(viewer, window.btoa(id).replace(/=/g, ''))
                    .finally(() => hideLoading('model'));
            });
            
            hideLoading('tree');
        } else {
            throw new Error('Invalid token');
        }
        
        login.style.visibility = 'visible';
    } catch (err) {
        hideLoading('tree');
        console.error('Initialization error:', err);
        
        // Clear invalid token
        localStorage.removeItem('aps_token');
        sessionStorage.removeItem('aps_token');
        currentToken = null;
        
        // Show token modal
        showTokenModal();
        
        // Update login button
        login.innerHTML = '<i class="fas fa-key"></i> Set Token';
        login.onclick = () => showTokenModal();
        login.style.visibility = 'visible';
    }
}

// Handle token submission
submitToken.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    
    if (!token) {
        alert('Please enter a valid token');
        return;
    }
    
    // Store token
    currentToken = token;
    localStorage.setItem('aps_token', token);
    
    // Hide modal and initialize app
    hideTokenModal();
    tokenInput.value = '';
    
    await initializeApp();
});

// Handle Enter key in token input
tokenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitToken.click();
    }
});

// Close modal when clicking outside
tokenModal.addEventListener('click', (e) => {
    if (e.target === tokenModal) {
        if (currentToken) {
            hideTokenModal();
        }
    }
});

// Initialize the application
initializeApp();