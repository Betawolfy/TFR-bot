const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const USERS_DATA_FILE = 'data/users_achievements.json';
const ACHIEVEMENTS_FILE = 'data/achievements_list.json';
const achievements = require('./data/achievements_list.json');

// Initialiser les fichiers JSON s'ils n'existent pas
if (!fs.existsSync(USERS_DATA_FILE)) {
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify({}, null, 2));
}
if (!fs.existsSync(ACHIEVEMENTS_FILE)) {
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(achievements, null, 2));
}

// GET liste des achievements
app.get('/achievements', (req, res) => {
    res.json(achievements);
});

// GET achievements d'un utilisateur
app.get('/achievements/:userID', (req, res) => {
    const userID = req.params.userID;
    const userData = JSON.parse(fs.readFileSync(USERS_DATA_FILE));

    if (!userData[userID]) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
        userAchievements: userData[userID],
        allAchievements: achievements
    });
});

// Ajouter ou mettre à jour un achievement pour un utilisateur 
app.put('/achievement/:userID/:achievement/:value?', (req, res) => {
    const userID = req.params.userID;
    const achievementID = req.params.achievement;
    const value = parseInt(req.params.value) || 1; // Valeur par défaut de 1 si non spécifiée
    
    if (!achievements[achievementID]) {
        return res.status(404).json({ error: 'Achievement non trouvé' });
    }

    let userData = JSON.parse(fs.readFileSync(USERS_DATA_FILE));
    
    if (!userData[userID]) {
        userData[userID] = [];
    }

    const existingAchievement = userData[userID].find(a => a.name === achievementID);
    const maxValue = achievements[achievementID].maxValue;
    
    if (existingAchievement) {
        existingAchievement.current = Math.min(value, maxValue); // Ne pas dépasser maxValue
    } else {
        userData[userID].push({
            name: achievementID,
            current: Math.min(value, maxValue)
        });
    }

    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(userData, null, 2));
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('API des achievements démarrée sur le port 3000');
});