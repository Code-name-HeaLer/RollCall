import * as SQLite from "expo-sqlite";

// --- THE FIX STARTS HERE ---

// We declare a variable to hold our promise, but we don't initialize it yet.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * This is our new singleton-pattern initializer.
 * It ensures that SQLite.openDatabaseAsync is only ever called once.
 */
const getDbPromise = (): Promise<SQLite.SQLiteDatabase> => {
  if (dbPromise === null) {
    // If the promise is null, this is the first time it's being called.
    // Create the promise and store it.
    dbPromise = SQLite.openDatabaseAsync("rollcall.db");
  }
  // Return the existing promise on all subsequent calls.
  return dbPromise;
};

/**
 * A helper function to get the resolved database instance.
 * We will use this in all our database operation functions.
 */
export const getDatabase = async () => {
  return await getDbPromise();
};

// --- THE FIX ENDS HERE ---

/**
 * Initializes the database tables if they don't exist.
 */
export async function initializeDatabase() {
  // We now use our singleton promise getter
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      target_attendance REAL DEFAULT 75.0,
      teacher_name TEXT, -- Can be null
      historical_classes_held INTEGER NOT NULL DEFAULT 0,
      historical_classes_attended INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY NOT NULL,
      subject_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
  id INTEGER PRIMARY KEY NOT NULL,
  timetable_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (timetable_id) REFERENCES timetable (id) ON DELETE CASCADE,
  -- This is the crucial fix. It tells the database that the combination
  -- of timetable_id and date must be unique across all rows.
  UNIQUE(timetable_id, date) 
);

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY NOT NULL,
        subject_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
    );
  `);
  // Migration: add teacher_name column if it doesn't exist
  try {
    await db.execAsync("ALTER TABLE subjects ADD COLUMN teacher_name TEXT;");
  } catch (e) {
    // Ignore error if column already exists
  }
  console.log("Database initialized successfully with singleton pattern.");
}

// --- Our query functions now use the new getDatabase() helper ---

export type Subject = {
  id: number;
  name: string;
  color: string;
  target_attendance: number;
  teacher_name: string | null;
  historical_classes_held: number;
  historical_classes_attended: number;
};

// --- Add this new type and function ---

// This type includes the original Subject fields PLUS the calculated attendance
export type SubjectWithAttendance = Subject & {
  recorded_present: number;
  recorded_absent: number;
};

/**
 * Fetches all subjects and joins their real-time attendance counts.
 * This is the primary function for the subjects list screen.
 */
export async function getSubjectsWithAttendance(): Promise<SubjectWithAttendance[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<SubjectWithAttendance>(`
    SELECT
      s.*,
      COALESCE((
        SELECT COUNT(*)
        FROM attendance_records ar
        JOIN timetable t ON ar.timetable_id = t.id
        WHERE t.subject_id = s.id AND ar.status = 'present'
      ), 0) as recorded_present,
      COALESCE((
        SELECT COUNT(*)
        FROM attendance_records ar
        JOIN timetable t ON ar.timetable_id = t.id
        WHERE t.subject_id = s.id AND ar.status = 'absent'
      ), 0) as recorded_absent
    FROM subjects s
    ORDER BY s.name ASC;
  `);
  return results || [];
}

export async function getAllSubjects(): Promise<Subject[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Subject>(
    "SELECT * FROM subjects ORDER BY name ASC;"
  );
  return results || [];
}

export async function addSubject(data: {
  name: string;
  color: string;
  targetAttendance: number;
  teacherName?: string;
  classesHeld?: number;
  classesAttended?: number;
}): Promise<Subject> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO subjects (name, color, target_attendance, teacher_name, historical_classes_held, historical_classes_attended) VALUES (?, ?, ?, ?, ?, ?);",
    [
      data.name,
      data.color,
      data.targetAttendance,
      data.teacherName || null,
      data.classesHeld || 0,
      data.classesAttended || 0,
    ]
  );

  const newSubjectId = result.lastInsertRowId;
  const newSubject = await db.getFirstAsync<Subject>(
    "SELECT * FROM subjects WHERE id = ?;",
    [newSubjectId]
  );

  if (!newSubject) {
    throw new Error("Failed to create and retrieve the new subject.");
  }

  return newSubject;
}

export type TimetableEntry = {
  id: number;
  subject_id: number;
  day_of_week: number; // 0 for Sunday, 1 for Monday...
  start_time: string;
  end_time: string;
  location: string | null;
};

// This type represents a timetable entry JOINED with its subject details.
export type FullTimetableEntry = TimetableEntry & {
  subject_name: string;
  subject_color: string;
};

/**
 * Fetches the entire weekly timetable, joining with subject data.
 * @returns A promise that resolves to an array of all scheduled classes.
 */
export async function getFullTimetable(): Promise<FullTimetableEntry[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<FullTimetableEntry>(`
    SELECT
      t.id,
      t.subject_id,
      t.day_of_week,
      t.start_time,
      t.end_time,
      t.location,
      s.name as subject_name,
      s.color as subject_color
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    ORDER BY t.day_of_week ASC, t.start_time ASC;
  `);
  return results || [];
}

/**
 * Adds a new class schedule to the timetable.
 * @param entry The details of the class to add.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addTimetableEntry(entry: {
  subjectId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO timetable (subject_id, day_of_week, start_time, end_time, location) VALUES (?, ?, ?, ?, ?);",
    [
      entry.subjectId,
      entry.dayOfWeek,
      entry.startTime,
      entry.endTime,
      entry.location || null,
    ]
  );
}

// --- Add these three functions to the bottom of the file ---

/**
 * Fetches a single subject by its ID.
 * @param id The ID of the subject to fetch.
 * @returns A promise that resolves to the Subject object or null if not found.
 */
export async function getSubjectById(id: number): Promise<Subject | null> {
  const db = await getDatabase();
  const subject = await db.getFirstAsync<Subject>(
    "SELECT * FROM subjects WHERE id = ?;",
    [id]
  );
  return subject || null;
}

/**
 * Updates an existing subject's details.
 * @param id The ID of the subject to update.
 * @param data An object containing the new name, color, and target.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateSubject(
  id: number,
  data: {
    name: string;
    color: string;
    targetAttendance: number;
    teacherName?: string;
  }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE subjects SET name = ?, color = ?, target_attendance = ?, teacher_name = ? WHERE id = ?;",
    [data.name, data.color, data.targetAttendance, data.teacherName || null, id]
  );
}

/**
 * Deletes a subject from the database.
 * This will also delete all associated timetable and attendance records
 * because of the "ON DELETE CASCADE" constraint we set up.
 * @param id The ID of the subject to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteSubject(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM subjects WHERE id = ?;", [id]);
}

// Add at the bottom of lib/database.ts

/**
 * Updates a timetable entry.
 */
export async function updateTimetableEntry(entry: {
  id: number;
  subjectId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE timetable SET subject_id = ?, day_of_week = ?, start_time = ?, end_time = ?, location = ? WHERE id = ?;",
    [
      entry.subjectId,
      entry.dayOfWeek,
      entry.startTime,
      entry.endTime,
      entry.location || null,
      entry.id,
    ]
  );
}

/**
 * Deletes a timetable entry.
 */
export async function deleteTimetableEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM timetable WHERE id = ?;", [id]);
}

// --- Add these new functions to the bottom of the file ---

/**
 * Fetches all scheduled classes for a specific day of the week.
 * @param dayOfWeek The index of the day (0 for Sunday, 1 for Monday...).
 * @returns A promise that resolves to an array of scheduled classes for that day.
 */

export type ClassWithSubjectAttendance = FullTimetableEntry & {
  target_attendance: number;
  historical_classes_held: number;
  historical_classes_attended: number;
  recorded_present: number;
  recorded_absent: number;
};

export async function getClassesForDayWithAttendance(dayOfWeek: number): Promise<ClassWithSubjectAttendance[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<ClassWithSubjectAttendance>(`
    SELECT
      t.id, t.subject_id, t.day_of_week, t.start_time, t.end_time, t.location,
      s.name as subject_name, s.color as subject_color,
      s.target_attendance, s.historical_classes_held, s.historical_classes_attended,
      COALESCE((
        SELECT COUNT(*) FROM attendance_records ar JOIN timetable t2 ON ar.timetable_id = t2.id
        WHERE t2.subject_id = s.id AND ar.status = 'present'
      ), 0) as recorded_present,
      COALESCE((
        SELECT COUNT(*) FROM attendance_records ar JOIN timetable t3 ON ar.timetable_id = t3.id
        WHERE t3.subject_id = s.id AND ar.status = 'absent'
      ), 0) as recorded_absent
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    WHERE t.day_of_week = ?
    ORDER BY t.start_time ASC;
  `, [dayOfWeek]);
  return results || [];
}

/**
 * Calculates the overall attendance percentage across all subjects.
 * It combines historical data with recorded attendance.
 * @returns A promise that resolves to the overall percentage, or null if no data.
 */
export async function calculateOverallAttendance(): Promise<number | null> {
  const db = await getDatabase();

  // 1. Get historical totals from all subjects
  const historicalTotals = await db.getFirstAsync<{
    totalHeld: number;
    totalAttended: number;
  }>(`
    SELECT
      SUM(historical_classes_held) as totalHeld,
      SUM(historical_classes_attended) as totalAttended
    FROM subjects;
  `);

  // 2. Get totals from the attendance_records table
  const recordTotals = await db.getFirstAsync<{
    presentCount: number;
    absentCount: number;
  }>(`
    SELECT
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentCount,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentCount
    FROM attendance_records;
  `);

  const totalAttended =
    (historicalTotals?.totalAttended || 0) + (recordTotals?.presentCount || 0);
  const totalHeld =
    (historicalTotals?.totalHeld || 0) +
    (recordTotals?.presentCount || 0) +
    (recordTotals?.absentCount || 0);

  if (totalHeld === 0) {
    return null; // Avoid division by zero
  }

  return (totalAttended / totalHeld) * 100;
}

// Type for the status of attendance
export type AttendanceStatus = "present" | "absent" | "cancelled" | "holiday";

/**
 * Marks or updates the attendance for a specific class on a specific date.
 * Uses UPSERT logic to either insert a new record or update an existing one.
 * @param timetableId The ID of the class from the timetable.
 * @param date The date in 'YYYY-MM-DD' format.
 * @param status The new attendance status.
 */
export async function markAttendance(
  timetableId: number,
  date: string,
  status: AttendanceStatus
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO attendance_records (timetable_id, date, status)
     VALUES (?, ?, ?)
     ON CONFLICT(timetable_id, date) DO UPDATE SET status = excluded.status;`,
    [timetableId, date, status]
  );
}

// --- Add this function to the bottom of the file ---

/**
 * Fetches all attendance records for a specific date.
 * @param date The date in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to a Map of [timetableId, status].
 */
export async function getAttendanceForDate(
  date: string
): Promise<Map<number, AttendanceStatus>> {
  const db = await getDatabase();
  const records = await db.getAllAsync<{
    timetable_id: number;
    status: AttendanceStatus;
  }>("SELECT timetable_id, status FROM attendance_records WHERE date = ?;", [
    date,
  ]);

  // Using a Map is highly efficient for lookups.
  const recordsMap = new Map<number, AttendanceStatus>();
  for (const record of records) {
    recordsMap.set(record.timetable_id, record.status);
  }

  return recordsMap;
}

// --- Add this new type and function to the bottom of the file ---

// This type will hold the summary of statuses for a single day.
export type DayAttendanceSummary = {
  present: number;
  absent: number;
  cancelled: number;
  holiday: number;
};

/**
 * Fetches a summary of attendance statuses for each day within a given date range.
 * @param startDate The start date in 'YYYY-MM-DD' format.
 * @param endDate The end date in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to a Map where the key is the date string
 *          and the value is the DayAttendanceSummary object.
 */
export async function getMonthlyAttendanceSummary(
  startDate: string,
  endDate: string
): Promise<Map<string, DayAttendanceSummary>> {
  const db = await getDatabase();
  const results = await db.getAllAsync<{
    date: string;
    present: number;
    absent: number;
    cancelled: number;
    holiday: number;
  }>(`
    SELECT
      date,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = 'holiday' THEN 1 ELSE 0 END) as holiday
    FROM attendance_records
    WHERE date BETWEEN ? AND ?
    GROUP BY date;
  `, [startDate, endDate]);

  const summaryMap = new Map<string, DayAttendanceSummary>();
  for (const row of results) {
    summaryMap.set(row.date, {
      present: row.present,
      absent: row.absent,
      cancelled: row.cancelled,
      holiday: row.holiday,
    });
  }
  
  return summaryMap;
}

// --- Add this new type and function ---

export type AttendanceDetail = FullTimetableEntry & {
  status: AttendanceStatus | null; // Status can be null if not yet marked
};

/**
 * Fetches all scheduled classes for a given day of the week and joins their
 * attendance status for a specific date.
 * @param date The specific date in 'YYYY-MM-DD' format.
 * @param dayOfWeek The day of the week index (0 for Sunday).
 * @returns A promise that resolves to an array of class details for that day.
 */
export async function getAttendanceDetailsForDate(
  date: string,
  dayOfWeek: number
): Promise<AttendanceDetail[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<AttendanceDetail>(`
    SELECT
      t.id, t.subject_id, t.day_of_week, t.start_time, t.end_time, t.location,
      s.name as subject_name, s.color as subject_color,
      ar.status as status
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    LEFT JOIN attendance_records ar ON t.id = ar.timetable_id AND ar.date = ?
    WHERE t.day_of_week = ?
    ORDER BY t.start_time ASC;
  `, [date, dayOfWeek]);
  return results || [];
}