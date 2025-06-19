import * as SQLite from 'expo-sqlite';

// --- DATABASE SETUP ---

// Opens or creates the database file.
// The 'next' API returns a promise that resolves with the database object.
const dbPromise = SQLite.openDatabaseAsync('rollcall.db');

/**
 * Initializes the database.
 * This function creates the necessary tables if they don't already exist.
 * It's designed to be called once when the app starts.
 */
export async function initializeDatabase() {
  const db = await dbPromise;
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    -- Table for Subjects
    -- Stores the name and a user-assigned color for each subject.
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      target_attendance REAL DEFAULT 75.0 -- Goal setting feature, default to 75%
    );

    -- Table for Timetable (Schedule)
    -- Links subjects to specific days and times.
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY NOT NULL,
      subject_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
      start_time TEXT NOT NULL, -- Stored in "HH:MM" format (24-hour)
      end_time TEXT NOT NULL,   -- Stored in "HH:MM" format (24-hour)
      location TEXT,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
    );

    -- Table for Attendance Records
    -- This is the core table for tracking attendance for each class on a specific date.
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY NOT NULL,
      timetable_id INTEGER NOT NULL, -- Links to a specific class in the timetable
      date TEXT NOT NULL,           -- Stored in "YYYY-MM-DD" format
      status TEXT NOT NULL,         -- 'present', 'absent', 'cancelled', 'holiday'
      notes TEXT,                   -- Optional notes for a specific class
      FOREIGN KEY (timetable_id) REFERENCES timetable (id) ON DELETE CASCADE
    );

    -- Future-proofing for the Tasks feature
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY NOT NULL,
        subject_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT NOT NULL, -- "YYYY-MM-DD"
        is_completed INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
    );
  `);
  console.log('Database initialized successfully.');
}

/**
 * A hook-like function to get the database instance.
 * In our app, we will call this to get the db object for our queries.
 */
export const getDb = async () => {
  return await dbPromise;
};

// --- You can add your database query functions below this line in the future ---