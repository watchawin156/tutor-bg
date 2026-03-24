-- D1 Schema for TutorM (Shared - no per-user isolation)

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    is_approved BOOLEAN DEFAULT 0
);

DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT,
    grade TEXT,
    parentTel TEXT
);

DROP TABLE IF EXISTS teachers;
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

DROP TABLE IF EXISTS rooms;
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    totalSessions INTEGER
);

DROP TABLE IF EXISTS enrollments;
CREATE TABLE enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    courseId INTEGER,
    remainingHours INTEGER,
    totalHours INTEGER,
    paid BOOLEAN,
    balance REAL,
    date TEXT,
    timestamp INTEGER
);

DROP TABLE IF EXISTS schedules;
CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseId INTEGER,
    day TEXT,
    start TEXT,
    end TEXT,
    room TEXT,
    teacher TEXT
);

DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    courseId INTEGER,
    studentName TEXT,
    course TEXT,
    amount REAL,
    type TEXT,
    slipFile TEXT,
    timestamp INTEGER,
    date TEXT
);

DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    amount REAL,
    type TEXT,
    timestamp INTEGER,
    date TEXT
);

DROP TABLE IF EXISTS teacherRatios;
CREATE TABLE teacherRatios (
    teacherName TEXT PRIMARY KEY,
    ratio REAL
);

DROP TABLE IF EXISTS attendances;
CREATE TABLE attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER,
    courseId INTEGER,
    date TEXT,
    timestamp INTEGER
);

-- Insert master admin (always approved)
INSERT INTO users (email, is_approved) VALUES ('watchawin.tha@gmail.com', 1);
