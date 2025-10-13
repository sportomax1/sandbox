// Sample items - replace with your own
const items = [
    "Pizza",
    "Burger",
    "Sushi",
    "Tacos",
    "Pasta",
    "Ramen",
    "Steak",
    "Salad",
    "Ice Cream",
    "Chocolate Cake"
];

let currentMatchup = { item1: null, item2: null };
let voteCount = 0;
let matchupNumber = 1;

// API endpoint - update this based on your deployment
const API_ENDPOINT = '/.netlify/functions/save-vote';

// Initialize the app
function init() {
    generateMatchup();
}

// Generate a random matchup
function generateMatchup() {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    currentMatchup.item1 = shuffled[0];
    currentMatchup.item2 = shuffled[1];
    
    document.getElementById('item1-text').textContent = currentMatchup.item1;
    document.getElementById('item2-text').textContent = currentMatchup.item2;
    document.getElementById('current-matchup').textContent = matchupNumber;
}

// Handle vote
async function vote(itemId) {
    const winner = itemId === 'item1' ? currentMatchup.item1 : currentMatchup.item2;
    const loser = itemId === 'item1' ? currentMatchup.item2 : currentMatchup.item1;
    
    showMessage('Saving vote...', 'loading');
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                winner: winner,
                loser: loser,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save vote');
        }
        
        const result = await response.json();
        
        // Update stats
        voteCount++;
        matchupNumber++;
        document.getElementById('total-votes').textContent = voteCount;
        
        showMessage(`Vote saved! ${winner} wins! 🎉`, 'success');
        
        // Generate next matchup after a short delay
        setTimeout(() => {
            generateMatchup();
            clearMessage();
        }, 1500);
        
    } catch (error) {
        console.error('Error saving vote:', error);
        showMessage('Error saving vote. Please try again.', 'error');
        setTimeout(clearMessage, 3000);
    }
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
}

// Clear message
function clearMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

// Start the app
init();
