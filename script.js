// script.js - THE FINAL, PUBLISHABLE GCSE STUDY QUEST LOGIC

// --- Core Game Variables & Data Structure ---
let userXP = 0;
let userLevel = 1;
let xpRequired = 100;
let focusCoins = 0;
let nextQuestId = 4;
let dailyStreak = 0;
let lastCompletionDate = null; // Stores the date of the last completed quest

// NOTE: These are the default values. They will be overwritten by loadGame() if a save exists.
let quests = [
    { id: 1, name: "Review Chemistry Topic 1: Atomic Structure", xp: 50, completed: false, subject: "Chemistry" },
    { id: 2, name: "Maths: Complete a full Non-Calculator Past Paper", xp: 100, completed: false, subject: "Maths" },
    { id: 3, name: "Daily Goal: Study for 30 minutes (Repeatable)", xp: 20, completed: false, subject: "General" }
];

let subjects = [
    { name: "Maths", totalXP: 0 },
    { name: "English", totalXP: 0 },
    { name: "Biology", totalXP: 0 },
    { name: "History", totalXP: 0 },
    { name: "Chemistry", totalXP: 0 },
    { name: "Physics", totalXP: 0 },
    { name: "German", totalXP: 0 },
    { name: "RS", totalXP: 0 },
];

let storeItems = [
    { name: "30-Min Netflix Break", cost: 10 },
    { name: "Order Takeout/Snack", cost: 20 },
    { name: "Skip One Chore", cost: 5 }
];

// --- DOM Update Functions ---

function updateStatsDisplay() {
    document.getElementById('level').textContent = userLevel;
    document.getElementById('xp').textContent = userXP;
    document.getElementById('xp-to-next').textContent = xpRequired;
    document.getElementById('xp-bar').value = userXP;
    document.getElementById('xp-bar').max = xpRequired;
    document.getElementById('focus-coins').textContent = focusCoins;
    document.getElementById('daily-streak').textContent = dailyStreak;
}

function renderQuests() {
    const listElement = document.getElementById('quest-list');
    listElement.innerHTML = ''; 

    quests.forEach(quest => {
        const listItem = document.createElement('li');
        listItem.className = quest.completed ? 'completed-quest' : 'active-quest';
        
        listItem.innerHTML = `
            <input type="checkbox" 
                    id="quest-${quest.id}" 
                    onchange="completeQuest(${quest.id})"
                    ${quest.completed ? 'checked disabled' : ''}>
            <label for="quest-${quest.id}">
                ${quest.name} 
                <span class="xp-badge">(+${quest.xp} XP)</span>
            </label>
            <button class="delete-quest" onclick="deleteQuest(${quest.id})">🗑️</button>
        `;
        listElement.appendChild(listItem);
    });
}

function deleteQuest(id) {
    if (confirm("Are you sure you want to delete this quest?")) {
        quests = quests.filter(q => q.id !== id);
        renderQuests();
        saveGame();
    }
}

function renderSubjects() {
    const listElement = document.getElementById('subject-list');
    if (!listElement) return;
    listElement.innerHTML = ''; 

    subjects.forEach(subject => {
        const listItem = document.createElement('li');
        const milestoneXP = 500; 
        const progressPercent = Math.min(100, (subject.totalXP / milestoneXP) * 100);

        listItem.innerHTML = `
            <div class="subject-header">
                <strong>${subject.name}</strong>
                <span class="subject-xp">${subject.totalXP} XP</span>
            </div>
            <progress value="${subject.totalXP}" max="${milestoneXP}"></progress>
            <p class="subject-progress">Next Milestone at ${milestoneXP} XP (${progressPercent.toFixed(0)}% complete)</p>
            <button class="delete-subject" onclick="deleteSubject('${subject.name}')">❌</button>
        `;
        listElement.appendChild(listItem);
    });
}


// --- Core Game Logic Functions ---

function gainXP(amount) {
    userXP += amount;
    
    while (userXP >= xpRequired) {
        userXP -= xpRequired;
        userLevel += 1;
        xpRequired = Math.round(xpRequired * 1.5); 
        
        focusCoins += 10; 
        alert(`🎉 LEVEL UP! You are now Level ${userLevel}! You earned 10 Focus Coins!`);
    }

    updateStatsDisplay();
}

function completeQuest(id) {
    const questIndex = quests.findIndex(q => q.id === id);
    if (questIndex === -1 || quests[questIndex].completed) return;

    const quest = quests[questIndex];
    gainXP(quest.xp); 

    // Update Streak Tracker and check for bonus
    checkStreak();

    // Award XP to the subject tracker
    const subject = subjects.find(s => s.name === quest.subject);
    if (subject) {
        subject.totalXP += quest.xp;
    }
    
    quest.completed = true;

    // Handle repeatable Daily Goal
    if (quest.name.includes("Daily Goal")) {
        setTimeout(() => {
            quests.splice(questIndex, 1); 
            quests.push({
                id: nextQuestId++, 
                name: quest.name, 
                xp: quest.xp, 
                completed: false,
                subject: quest.subject
            });
            renderQuests(); 
            saveGame();
        }, 500); 
    }

    renderQuests(); 
    renderSubjects();
    saveGame();
}

// --- NEW STREAK LOGIC ---

function checkStreak() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const lastDate = lastCompletionDate ? new Date(lastCompletionDate) : null;
    if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
    }
    
    if (!lastDate || today.getTime() > lastDate.getTime()) {
        const timeDiff = today.getTime() - (lastDate ? lastDate.getTime() : 0);
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        const isSameDay = lastDate && (timeDiff < (1000 * 3600 * 24)) && today.getDate() === lastDate.getDate();

        if (dayDiff === 1) {
            dailyStreak += 1;
            alert(`🔥 Streak maintained! Day ${dailyStreak}!`);
        } else if (dayDiff > 1) {
            dailyStreak = 1; 
            alert(`🥺 Streak reset. Start a new streak today!`);
        } else if (!lastDate || !isSameDay) {
            dailyStreak = 1; 
            alert(`⭐ Streak started! Day 1!`);
        } 
        
        if (dailyStreak > 0 && dailyStreak % 7 === 0) {
            focusCoins += 20; 
            alert(`🎁 7-Day Streak Bonus! You earned 20 Focus Coins!`);
        }
    }
    
    lastCompletionDate = new Date().toISOString().split('T')[0]; 
    updateStatsDisplay();
}


// --- Form/Subject Management Logic ---

// Show/Hide the ADD QUEST form
function toggleForm() {
    const form = document.getElementById('add-quest-form');
    form.classList.toggle('visible'); 
    
    if (form.classList.contains('visible')) {
        fillSubjectSelect();
    }
}

// Populate the Subject dropdown list
function fillSubjectSelect() {
    const select = document.getElementById('quest-subject-select');
    if (!select) return; 
    
    select.innerHTML = '<option value="" disabled selected>Select a Subject</option>'; 
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.name;
        option.textContent = subject.name;
        select.appendChild(option);
    });
    
    const generalOption = document.createElement('option');
    generalOption.value = 'General';
    generalOption.textContent = 'General';
    select.appendChild(generalOption);
}

// Process the form input and create a new quest
function addNewQuestFromForm() {
    const newQuestName = document.getElementById('quest-name-input').value.trim();
    const newQuestSubject = document.getElementById('quest-subject-select').value;
    const xpInput = document.getElementById('quest-xp-input').value;
    const newQuestXP = parseInt(xpInput);
    
    if (!newQuestName || !newQuestSubject || isNaN(newQuestXP) || newQuestXP <= 0) {
        alert("Please ensure all fields are filled out correctly.");
        return;
    }
    
    quests.push({
        id: nextQuestId++,
        name: newQuestName,
        xp: newQuestXP,
        completed: false,
        subject: newQuestSubject
    });
    
    document.getElementById('add-quest-form').reset();
    toggleForm();
    
    renderQuests();
    saveGame();
}

// Allow users to add a custom subject
function addCustomSubject() {
    const newSubjectName = prompt("Enter the name of the new subject (e.g., Media Studies):");
    if (newSubjectName && newSubjectName.trim() !== '') {
        const capitalizedName = newSubjectName.trim().charAt(0).toUpperCase() + newSubjectName.trim().slice(1).toLowerCase();
        
        if (!subjects.some(s => s.name === capitalizedName)) {
            subjects.push({ name: capitalizedName, totalXP: 0 });
            renderSubjects();
            saveGame();
            alert(`🎉 Subject '${capitalizedName}' added successfully!`);
        } else {
            alert(`Subject '${capitalizedName}' already exists.`);
        }
    }
}

// Allow users to delete a subject
function deleteSubject(subjectName) {
    if (confirm(`Are you sure you want to delete the subject: ${subjectName}? All its XP will be lost.`)) {
        subjects = subjects.filter(s => s.name !== subjectName);
        quests = quests.filter(q => q.subject !== subjectName); 
        
        renderSubjects();
        renderQuests();
        saveGame();
        alert(`Subject '${subjectName}' deleted.`);
    }
}


// --- Store Logic ---

function openStore() {
    let storeMessage = "Welcome to the Reward Store! You have " + focusCoins + " Focus Coins.\n\n";
    storeItems.forEach((item, index) => {
        storeMessage += `${index + 1}. ${item.name} - ${item.cost} FC\n`;
    });
    storeMessage += "\nType the number of the item you want to purchase (or press Cancel to exit):";
    
    const choice = prompt(storeMessage);

    if (choice) {
        const itemIndex = parseInt(choice) - 1;
        const item = storeItems[itemIndex];

        if (item && focusCoins >= item.cost) {
            focusCoins -= item.cost;
            alert(`🎉 Success! You purchased: ${item.name}! Go enjoy your reward!`);
            updateStatsDisplay();
            saveGame(); 
        } else if (item) {
            alert(`❌ Not enough Focus Coins! You need ${item.cost} FC.`);
        } else {
            alert("Invalid selection. Please try again.");
        }
    }
}

// NEW: Show/Hide the custom reward form
function toggleRewardForm() {
    const form = document.getElementById('new-reward-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    const mainStoreButton = document.querySelector('button[onclick="openStore()"]');
    mainStoreButton.style.display = form.style.display === 'block' ? 'none' : 'block';

    const addRewardButton = document.querySelector('button[onclick="toggleRewardForm()"]');
    addRewardButton.style.display = form.style.display === 'block' ? 'none' : 'block';
}

// NEW: Process the form input and create a new reward
function addNewRewardFromForm() {
    const newRewardName = document.getElementById('reward-name-input').value.trim();
    const newRewardCost = parseInt(document.getElementById('reward-cost-input').value);
    
    if (!newRewardName || isNaN(newRewardCost) || newRewardCost <= 0) {
        alert("Please enter a valid name and cost.");
        return;
    }
    
    storeItems.push({
        name: newRewardName,
        cost: newRewardCost
    });
    
    document.getElementById('new-reward-form').reset();
    toggleRewardForm(); 
    
    alert(`🎉 Custom Reward "${newRewardName}" added to the store for ${newRewardCost} FC!`);
    saveGame(); 
}


// --- Persistence Functions (Saving/Loading) ---

function saveGame() {
    const gameState = {
        xp: userXP,
        level: userLevel,
        xpReq: xpRequired,
        qList: quests,
        sList: subjects,
        store: storeItems, // NEW: Saving custom store items
        nextID: nextQuestId,
        focus: focusCoins,
        streak: dailyStreak,
        lastDate: lastCompletionDate
    };
    localStorage.setItem('gcseStudyQuest', JSON.stringify(gameState)); 
}

function loadGame() {
    const savedState = localStorage.getItem('gcseStudyQuest');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        userXP = gameState.xp;
        userLevel = gameState.level;
        xpRequired = gameState.xpReq;
        // Use the saved arrays, or default to the original if corrupted/missing
        quests = gameState.qList || quests; 
        subjects = gameState.sList || subjects;
        storeItems = gameState.store || storeItems; // NEW: Loading custom store items
        nextQuestId = gameState.nextID;
        focusCoins = gameState.focus || 0;
        dailyStreak = gameState.streak || 0;
        lastCompletionDate = gameState.lastDate || null;
    }
}

// CRITICAL: The function that runs everything when the page loads!
function init() {
    loadGame();
    updateStatsDisplay();
    renderQuests();
    renderSubjects();
}

// This command starts the entire game setup process as soon as the HTML is ready
document.addEventListener('DOMContentLoaded', init);
