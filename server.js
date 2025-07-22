// server.js - Node.js Backend for Clock Reading Experiment

const { Database } = require('@sqlitecloud/drivers');
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv'); // Import dotenv for environment variable management
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file.
// This is good practice for local development to keep sensitive data out of the code.
dotenv.config();

const app = express();

const connectionString = process.env.SQLITECLOUD_CONNECTION_STRING || "sqlitecloud://id.sqlite.cloud:8860/apikey...";

// SQLiteCloud client configuration
// The 'Database' constructor itself initializes the connection or makes it ready for operations.
// There is no explicit .connect() method to call.
const db = new Database(connectionString,
    {
    host: process.env.SQLITECLOUD_HOST || 'id.sqlite.cloud',
    username: process.env.SQLITECLOUD_USER || 'admin',
    port: process.env.SQLITECLOUD_PORT || 8860,
    database: process.env.SQLITECLOUD_DB || 'clockdb',
    apikey: process.env.SQLITECLOUD_APIKEY || 'apikey...',
    ssl: true // Use SSL for secure connection
});

// Middleware
app.use(cors({
    origin: '*', // Change this to your frontend domain in production
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Function to create tables if they don't exist
async function createTables() {
    try {
        // Use db.sql() directly as the connection is managed by the driver instance
        await db.sql(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS experiments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                clock_type_selection TEXT,
                show_numbers INTEGER,
                total_trials INTEGER,
                overall_accuracy REAL,
                avg_reaction_time REAL,
                digital_avg_reaction REAL,
                analog_avg_reaction REAL,
                digital_accuracy REAL,
                analog_accuracy REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS trials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                experiment_id INTEGER,
                trial_number INTEGER,
                clock_type TEXT,
                show_numbers INTEGER,
                actual_time TEXT,
                user_input TEXT,
                correct INTEGER,
                reaction_time INTEGER,
                typing_time INTEGER,
                timestamp DATETIME,
                FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
            );
        `);
        // console.log('[DB INFO] Tables created or already exist.');
    } catch (err) {
        console.error('[DB ERROR] Failed to create tables:', err.message);
        // It's crucial to exit the process if table creation fails, as the app won't function
        process.exit(1);
    }
}

// Initialize database and start server in an async function
async function initializeAndStartServer() {
    try {
        console.log('[DB INFO] SQLiteCloud driver initialized. Attempting to create tables.');
        await createTables(); // Ensure tables exist before starting the server

    } catch (err) {
        console.error('[SERVER ERROR] Failed to initialize database or start server:', err.message);
        process.exit(1); // Exit if critical startup fails
    }
}

// Call the initialization function to start the process
initializeAndStartServer();

// API: Save experiment data
app.post('/api/save-experiment', async (req, res) => {
    const { username, experimentData, summary } = req.body;

    if (!experimentData || !summary) {
        return res.status(400).json({ error: 'Missing experimentData or summary' });
    }

    try {
        // Insert or ignore user
        await db.sql(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [username]);

        // Insert experiment
        const result = await db.sql(`
            INSERT INTO experiments 
            (username, clock_type_selection, show_numbers, total_trials, overall_accuracy, 
             avg_reaction_time, digital_avg_reaction, analog_avg_reaction, digital_accuracy, analog_accuracy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                username || 'Anonymous',
                summary.clockTypeSelection,
                summary.showNumbers ? 1 : 0,
                summary.totalTrials,
                summary.overallAccuracy,
                summary.avgReactionTime,
                summary.digitalAvgReaction,
                summary.analogAvgReaction,
                summary.digitalAccuracy,
                summary.analogAccuracy
        );

        const experimentId = result.lastInsertRowid;

        // Insert trials
        const trialPromises = experimentData.map(trial =>
            db.sql(`
                INSERT INTO trials 
                (experiment_id, trial_number, clock_type, show_numbers, actual_time, user_input, correct, reaction_time, typing_time, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    experimentId,
                    trial.trial,
                    trial.clockType,
                    trial.showNumbers ? 1 : 0,
                    trial.actualTime,
                    trial.userInput,
                    trial.correct ? 1 : 0,
                    trial.reactionTime,
                    trial.typingTime,
                    trial.timestamp
            )
        );

        await Promise.all(trialPromises);

        // console.log(`[DB INFO] Experiment ${experimentId} and ${experimentData.length} trials saved for user: ${username}`);
        res.status(201).json({ success: true, experimentId });

    } catch (err) {
        console.error('[DB ERROR] Error saving experiment:', err.message);
        res.status(500).json({ error: 'Failed to save experiment data' });
    }
});

// API: Get statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const [overall] = await db.sql(`
            SELECT 
                COUNT(*) as total_experiments,
                AVG(overall_accuracy) as avg_accuracy,
                AVG(avg_reaction_time) as avg_reaction_time
            FROM experiments
        `);

        const clockComparison = await db.sql(`
            SELECT 'digital' as clock_type, AVG(digital_avg_reaction) as avg_reaction, AVG(digital_accuracy) as avg_accuracy
            FROM experiments WHERE digital_avg_reaction > 0
            UNION ALL
            SELECT 'analog' as clock_type, AVG(analog_avg_reaction), AVG(analog_accuracy)
            FROM experiments WHERE analog_avg_reaction > 0
        `);

        const numbersEffect = await db.sql(`
            SELECT show_numbers, AVG(analog_avg_reaction) as avg_reaction, AVG(analog_accuracy) as avg_accuracy
            FROM experiments
            WHERE analog_avg_reaction > 0 AND (clock_type_selection = 'analog' OR clock_type_selection = 'mixed')
            GROUP BY show_numbers
        `);
        
        res.json({
            overall: overall,
            clockComparison,
            numbersEffect,
        });
    } catch (err) {
        console.error('[DB ERROR] Error fetching statistics:', err.message);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});


app.listen(PORT, () => {
    console.log(`[SERVER INFO] Listening on port ${PORT}`);
});
