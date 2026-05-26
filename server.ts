import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_DIR = process.env.PERSISTENT_DIR || process.cwd();
const DB_FILE = path.join(DB_DIR, "database_store.json");

// Define Core In-Memory / File Persistent Structures
interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "Free User" | "Pro User" | "Premium User";
  xpPoints: number;
  coachPersona: string;
  focusArea: string;
  energyState: string;
  discipline: number;
  joinedAt: string;
  lifeAreaScores: {
    life: number;
    focus: number;
    discipline: number;
    energy: number;
    finance: number;
  };
}

interface DBMission {
  id: string;
  text: string;
  val: number;
  category: string;
  completed: boolean;
}

interface DBJourney {
  id: string;
  title: string;
  desc: string;
  xp: number;
  streak: number;
  level: number;
  unlocked: boolean;
  missions: { id: string; text: string; xp: number; completed: boolean }[];
  completed?: boolean;
}

interface DBFocusLog {
  id: string;
  timestamp: string;
  duration: number; // in seconds
  mode: string;
  sound: string;
}

interface DBAccountabilityLog {
  id: string;
  timestamp: string;
  sleepRating: number; // percentage
  routineAlignment: number; // percentage
  monomodeCompletion: number; // percentage
  notes: string;
  coachFeedback: string;
}

interface DBChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  analysis?: any;
}

interface UserDataStore {
  user: DBUser;
  missions: DBMission[];
  journeys: DBJourney[];
  focusLogs: DBFocusLog[];
  accountabilityLogs: DBAccountabilityLog[];
  chats: DBChatMessage[];
}

interface DBPendingVerification {
  email: string;
  name: string;
  passwordHash: string;
  otp: string;
  expiresAt: number;
}

// Map of Token -> User Email for simple fast Session State persistence
let activeSessions: Record<string, string> = {};

// Map of Email -> Pending Registration Verification Details
let pendingVerifications: Record<string, DBPendingVerification> = {};

// Helper: Seed Default Guest Data
const createDefaultStore = (email: string, name: string): UserDataStore => {
  return {
    user: {
      id: crypto.randomUUID(),
      name: name,
      email: email,
      passwordHash: "",
      role: "Free User",
      xpPoints: 1200,
      coachPersona: "ora",
      focusArea: "Routine deconstruction",
      energyState: "Stable",
      discipline: 75,
      joinedAt: new Date().toISOString(),
      lifeAreaScores: {
        life: 84,
        focus: 92,
        discipline: 78,
        energy: 65,
        finance: 74
      }
    },
    missions: [
      { id: "m1", text: "Complete 25-minute focus session", val: 150, category: "focus", completed: true },
      { id: "m2", text: "Take a mid-day calm breathing break", val: 100, category: "clarity", completed: false },
      { id: "m3", text: "Review your daily budget list", val: 80, category: "finance", completed: false },
      { id: "m4", text: "Study new skills for 15 minutes", val: 120, category: "learning", completed: false }
    ],
    journeys: [
      {
        id: "escape-procrastination",
        title: "Clarity Alignment",
        desc: "Deconstruct starting hesitation and configure private space parameters designed to build focus.",
        xp: 1500,
        streak: 12,
        level: 3,
        unlocked: true,
        missions: [
          { id: "ep1", text: "Initiate with a simple 5-minute sandbox task", xp: 300, completed: true },
          { id: "ep2", text: "Configure monomode physical limits (disable hardware notifications)", xp: 400, completed: false },
          { id: "ep3", text: "Pre-load next day's 3 priority contexts the night before", xp: 500, completed: false }
        ]
      },
      {
        id: "productivity-reset",
        title: "Cognitive Reboot",
        desc: "Re-anchor focus stamina by shifting from fragmented multitasking cycles to singular deep intervals.",
        xp: 2200,
        streak: 8,
        level: 4,
        unlocked: true,
        missions: [
          { id: "pr1", text: "Schedule a singular 90-minute monomode block", xp: 450, completed: false },
          { id: "pr2", text: "Integrate a 10-minute quiet non-stimulus walk", xp: 350, completed: false },
          { id: "pr3", text: "Flush active cognitive baggage by clearing secondary context tabs", xp: 300, completed: false }
        ]
      },
      {
        id: "rebuild-my-life",
        title: "System Restoration",
        desc: "Restore daily sleep consistency, weekly micro-budgets, and balanced cardiovascular routines.",
        xp: 4500,
        streak: 5,
        level: 5,
        unlocked: true,
        missions: [
          { id: "rl1", text: "Establish sleep boundaries (stabilize sleep window under 11:00 PM)", xp: 600, completed: false },
          { id: "rl2", text: "Register and categorize all active weekly outflows", xp: 500, completed: false },
          { id: "rl3", text: "Restore regular cardiorespiratory threshold focus (30m training)", xp: 450, completed: false }
        ]
      },
      {
        id: "become-disciplined",
        title: "Sustained Volition",
        desc: "Amplify volitional starting capacity and build lasting cognitive habits under stress.",
        xp: 3000,
        streak: 15,
        level: 6,
        unlocked: false,
        missions: [
          { id: "bd1", text: "Couple morning hydration directly to a review sequence", xp: 500, completed: false },
          { id: "bd2", text: "Integrate a 60-second immediate cold immersion sequence", xp: 600, completed: false }
        ]
      }
    ],
    focusLogs: [
      { id: "fl1", timestamp: new Date(Date.now() - 3600000).toISOString(), duration: 1500, mode: "focus", sound: "binaural" }
    ],
    accountabilityLogs: [
      {
        id: "al1",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        sleepRating: 80,
        routineAlignment: 75,
        monomodeCompletion: 60,
        notes: "I managed my focus blocks well, but had some phone notification disruptions in the afternoon.",
        coachFeedback: "Excellent stability on routine alignments. Ensure hardware notification switches are toggled before your next monomode sequence."
      }
    ],
    chats: [
      {
        id: "welcome-ai",
        sender: "ai",
        text: "I am your alignment advisor. Let's examine the conditions surrounding your focus or routine plateaus. Share the obstacle you are facing today, and we will formulate a simple, low-friction adjustment logic.",
        timestamp: "READY"
      }
    ]
  };
};

// Main Database Object
let db: Record<string, UserDataStore> = {};

const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
      console.log("LifePilot DB Engine: Loaded database store securely.");
    } else {
      // Initialize Default Guest data on startup
      db = {
        "guest@lifepilot.ai": createDefaultStore("guest@lifepilot.ai", "Guest Pilot")
      };
      saveDatabase();
      console.log("LifePilot DB Engine: New database created and seeded with guest coordinates.");
    }
  } catch (err) {
    console.error("LifePilot DB Engine: Failed to read database, falling back to in-memory core.", err);
    db = { "guest@lifepilot.ai": createDefaultStore("guest@lifepilot.ai", "Guest Pilot") };
  }
};

const saveDatabase = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("LifePilot DB Engine: Failed to write database state:", err);
  }
};

loadDatabase();

// Initialize Database access helper
const getUserStore = (authToken: string | undefined): UserDataStore => {
  let email = "guest@lifepilot.ai";
  if (authToken && activeSessions[authToken]) {
    email = activeSessions[authToken];
  }
  if (!db[email]) {
    db[email] = createDefaultStore(email, email.split("@")[0]);
    saveDatabase();
  }
  return db[email];
};

// Initialize Groq safely on server-side
let groq: Groq | null = null;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("LifePilot AI: Groq engine loaded on server-side API.");
  } else {
    console.warn("LifePilot AI: GROQ_API_KEY is not defined. Falling back to simulated cognitive matrix.");
  }
} catch (err) {
  console.error("LifePilot AI: Failed to initialize Groq Client:", err);
}

// ----------------------
// 1. API - AUTHENTICATION SERVICES
// ----------------------

// Transmit 6-digit OTP verification code via Nodemailer or fallback Dev Mode
const sendOTPEmail = async (email: string, otp: string, name: string): Promise<{ success: boolean; devMode: boolean }> => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"LifePilot" <no-reply@lifepilot.ai>`;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from,
        to: email,
        subject: `Verification Code: ${otp}`,
        text: `Hello ${name},\n\nThank you for choosing LifePilot. Your 6-digit verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes. Please enter this code in the application to activate your account.\n\nWarmly,\nThe LifePilot Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f5; border-radius: 8px;">
            <h2 style="font-family: serif; font-style: italic; color: #5B6EF5; font-size: 24px; margin-bottom: 20px;">LifePilot</h2>
            <p style="color: #333; font-size: 15px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #333; font-size: 15px;">Thank you for joining LifePilot. Enter the code below to complete your registration and activate your account:</p>
            <div style="background-color: #f5f6ff; padding: 15px 25px; border-radius: 6px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #5B6EF5;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 13px;">This verification code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">LifePilot AI — Your Private Habit & Routine Co-Pilot</p>
          </div>
        `
      });
      console.log(`[SMTP] Successfully sent OTP ${otp} to ${email}`);
      return { success: true, devMode: false };
    } catch (err) {
      console.error(`[SMTP] Failed to send email via SMTP, falling back to Dev Mode.`, err);
    }
  }

  // Fallback dev mode console block logging
  console.log(`
============================================================
🔑 [DEV MODE] LIFE PILOT EMAIL TRANSCEIVER FALLBACK
============================================================
To: ${email} (${name})
Subject: Verification Code: ${otp}
Verification Code: ${otp} (Expires in 10 minutes)
============================================================
To send real emails, define these keys in your .env file:
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
============================================================
`);

  return { success: true, devMode: true };
};

// Register - Initial Step: Request registration & send OTP
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const normalEmail = email.toLowerCase().trim();
  if (db[normalEmail] && db[normalEmail].user.passwordHash !== "") {
    return res.status(400).json({ error: "This email registration already exists." });
  }

  // Generate 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  // Save to pending verifications
  pendingVerifications[normalEmail] = {
    email: normalEmail,
    name: name.trim(),
    passwordHash: hash,
    otp,
    expiresAt
  };

  const mailResult = await sendOTPEmail(normalEmail, otp, name);

  res.json({
    success: true,
    message: "Verification code sent to your email address.",
    email: normalEmail,
    devMode: mailResult.devMode,
    devOtp: mailResult.devMode ? otp : undefined
  });
});

// Verify OTP - Second Step: Complete registration after verifying OTP code
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  const normalEmail = email.toLowerCase().trim();
  const pending = pendingVerifications[normalEmail];

  if (!pending) {
    return res.status(400).json({ error: "No pending registration found for this email address." });
  }

  if (pending.expiresAt < Date.now()) {
    delete pendingVerifications[normalEmail];
    return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
  }

  if (pending.otp !== otp.trim()) {
    return res.status(400).json({ error: "Invalid verification code. Please check and try again." });
  }

  // OTP is valid! Create the permanent account in DB
  const newStore = createDefaultStore(normalEmail, pending.name);
  newStore.user.passwordHash = pending.passwordHash;
  db[normalEmail] = newStore;
  saveDatabase();

  // Clean up pending entry
  delete pendingVerifications[normalEmail];

  // Generate session token
  const token = crypto.randomUUID();
  activeSessions[token] = normalEmail;

  res.json({
    success: true,
    message: "Email verified and account activated successfully.",
    token,
    user: {
      name: newStore.user.name,
      email: newStore.user.email,
      role: newStore.user.role,
      xpPoints: newStore.user.xpPoints,
      coachPersona: newStore.user.coachPersona,
      lifeAreaScores: newStore.user.lifeAreaScores
    }
  });
});

// Resend OTP - Regenerate code and resend
app.post("/api/auth/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const normalEmail = email.toLowerCase().trim();
  const pending = pendingVerifications[normalEmail];

  if (!pending) {
    return res.status(400).json({ error: "No active registration process found for this email address." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp = otp;
  pending.expiresAt = Date.now() + 10 * 60 * 1000;
  pendingVerifications[normalEmail] = pending;

  const mailResult = await sendOTPEmail(normalEmail, otp, pending.name);

  res.json({
    success: true,
    message: "A fresh verification code has been sent to your email address.",
    email: normalEmail,
    devMode: mailResult.devMode,
    devOtp: mailResult.devMode ? otp : undefined
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Coordinates incomplete." });
  }

  const normalEmail = email.toLowerCase().trim();
  const userStore = db[normalEmail];

  if (!userStore || userStore.user.passwordHash === "") {
    return res.status(401).json({ error: "Invalid email profile parameters." });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (userStore.user.passwordHash !== hash) {
    return res.status(401).json({ error: "Creds verification failed." });
  }

  const token = crypto.randomUUID();
  activeSessions[token] = normalEmail;

  res.json({
    message: "Authorization verified.",
    token,
    user: {
      name: userStore.user.name,
      email: userStore.user.email,
      role: userStore.user.role,
      xpPoints: userStore.user.xpPoints,
      coachPersona: userStore.user.coachPersona,
      lifeAreaScores: userStore.user.lifeAreaScores
    }
  });
});

// Guest Demo Bypass (Dummy Login)
app.post("/api/auth/guest", (req, res) => {
  const token = `GUEST-SESSION-${crypto.randomUUID()}`;
  const email = "guest@lifepilot.ai";
  activeSessions[token] = email;
  
  if (!db[email]) {
    db[email] = createDefaultStore(email, "Guest Pilot");
    saveDatabase();
  }
  
  res.json({
    success: true,
    message: "Guest session initialized.",
    token,
    user: {
      name: db[email].user.name,
      email: db[email].user.email,
      role: db[email].user.role,
      xpPoints: db[email].user.xpPoints,
      coachPersona: db[email].user.coachPersona,
      lifeAreaScores: db[email].user.lifeAreaScores
    }
  });
});

// Session Retrieval
app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
  
  if (!token || !activeSessions[token]) {
    // Return standard fallback guest session
    const guestStore = getUserStore(undefined);
    return res.json({
      loggedIn: false,
      user: {
        name: guestStore.user.name,
        email: guestStore.user.email,
        role: guestStore.user.role,
        xpPoints: guestStore.user.xpPoints,
        coachPersona: guestStore.user.coachPersona,
        lifeAreaScores: guestStore.user.lifeAreaScores
      }
    });
  }

  const email = activeSessions[token];
  const userStore = db[email];

  res.json({
    loggedIn: true,
    user: {
      name: userStore.user.name,
      email: userStore.user.email,
      role: userStore.user.role,
      xpPoints: userStore.user.xpPoints,
      coachPersona: userStore.user.coachPersona,
      lifeAreaScores: userStore.user.lifeAreaScores,
      discipline: userStore.user.discipline,
      energyState: userStore.user.energyState,
      focusArea: userStore.user.focusArea
    }
  });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
  
  if (token && activeSessions[token]) {
    delete activeSessions[token];
  }
  res.json({ success: true, message: "Logged out from cockpit security pipeline." });
});

// Forgot / Reset
app.post("/api/auth/forgot", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });

  const normalEmail = email.toLowerCase().trim();
  const resetPasskey = `PILOT-RESET-${Math.floor(1000 + Math.random() * 9000)}`;
  
  if (db[normalEmail]) {
    db[normalEmail].user.passwordHash = crypto.createHash("sha256").update("123456").digest("hex"); // Temporary default pin
    saveDatabase();
  }

  res.json({
    message: "Transmitted diagnostic guidelines.",
    instruction: `A temporary backup key has been updated. Access cockpit using password "123456" and recalibrate parameters immediately. Ref ID: ${resetPasskey}`
  });
});

// ----------------------
// 2. API - USER PROFILE & SETTINGS
// ----------------------
app.get("/api/user/profile", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  res.json(uStore.user);
});

app.post("/api/user/profile", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { coachPersona, xpPoints, lifeAreaScores, discipline, energyState, focusArea } = req.body;

  if (coachPersona) uStore.user.coachPersona = coachPersona;
  if (xpPoints !== undefined) uStore.user.xpPoints = xpPoints;
  if (lifeAreaScores) uStore.user.lifeAreaScores = { ...uStore.user.lifeAreaScores, ...lifeAreaScores };
  if (discipline !== undefined) uStore.user.discipline = discipline;
  if (energyState) uStore.user.energyState = energyState;
  if (focusArea) uStore.user.focusArea = focusArea;

  saveDatabase();
  res.json(uStore.user);
});

// ----------------------
// 3. API - HABITS & DAILY MISSIONS
// ----------------------
app.get("/api/habits", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  res.json({
    missions: uStore.missions,
    scores: uStore.user.lifeAreaScores
  });
});

app.post("/api/habits/toggle", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { id } = req.body;

  const mIdx = uStore.missions.findIndex(m => m.id === id);
  if (mIdx !== -1) {
    uStore.missions[mIdx].completed = !uStore.missions[mIdx].completed;
    
    // Recalculate Stability Score dynamically on completes
    const completedCount = uStore.missions.filter(m => m.completed).length;
    const completionRate = Math.round((completedCount / uStore.missions.length) * 100);
    
    uStore.user.lifeAreaScores.life = Math.min(100, Math.max(50, completionRate + 15));
    
    // Reward XP on complete toggle on
    if (uStore.missions[mIdx].completed) {
      uStore.user.xpPoints += uStore.missions[mIdx].val;
    } else {
      uStore.user.xpPoints = Math.max(0, uStore.user.xpPoints - uStore.missions[mIdx].val);
    }
    
    saveDatabase();
    return res.json({
      success: true,
      missions: uStore.missions,
      scores: uStore.user.lifeAreaScores,
      xpPoints: uStore.user.xpPoints
    });
  }

  res.status(404).json({ error: "Mission ID not found." });
});

app.post("/api/habits/add", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { text, category, val } = req.body;

  if (!text) return res.status(400).json({ error: "Text is mandatory." });

  const newMission: DBMission = {
    id: `m-custom-${Date.now()}`,
    text,
    category: category || "routines",
    val: val || 100,
    completed: false
  };

  uStore.missions.push(newMission);
  saveDatabase();

  res.json({ success: true, missions: uStore.missions });
});

// ----------------------
// 4. API - FOCUS SESSIONS
// ----------------------
app.get("/api/focus/stats", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  
  const totalFocusSeconds = uStore.focusLogs.reduce((acc, f) => acc + f.duration, 0);
  const focusRating = Math.min(100, Math.round(70 + (uStore.focusLogs.length * 5)));
  
  res.json({
    logs: uStore.focusLogs,
    totalMinutes: Math.round(totalFocusSeconds / 60),
    sessionsCount: uStore.focusLogs.length,
    indexRating: focusRating
  });
});

app.post("/api/focus/log", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { duration, mode, sound } = req.body; // duration in seconds

  if (!duration) return res.status(400).json({ error: "Duration is missing." });

  const newLog: DBFocusLog = {
    id: `fl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    duration: parseInt(duration),
    mode: mode || "focus",
    sound: sound || "none"
  };

  uStore.focusLogs.push(newLog);
  
  // Award 150 boundary XP points
  uStore.user.xpPoints += 150;
  
  // Update focus analytics score
  uStore.user.lifeAreaScores.focus = Math.min(100, uStore.user.lifeAreaScores.focus + 2);
  
  saveDatabase();

  res.json({
    success: true,
    logs: uStore.focusLogs,
    xpPoints: uStore.user.xpPoints,
    scores: uStore.user.lifeAreaScores
  });
});

// ----------------------
// 5. API - JOURNEYS & MILESTONES
// ----------------------
app.get("/api/journeys", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  res.json(uStore.journeys);
});

app.post("/api/journeys/toggle-mission", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { journeyId, missionId } = req.body;

  const jIndex = uStore.journeys.findIndex(j => j.id === journeyId);
  if (jIndex === -1) return res.status(404).json({ error: "Journey not found." });

  const mIndex = uStore.journeys[jIndex].missions.findIndex(m => m.id === missionId);
  if (mIndex === -1) return res.status(404).json({ error: "Mission in journey not found." });

  const mission = uStore.journeys[jIndex].missions[mIndex];
  if (mission.completed) {
    // Already complete, prevent double complete
    return res.json({ success: true, journeys: uStore.journeys, message: "Already complete." });
  }

  uStore.journeys[jIndex].missions[mIndex].completed = true;
  
  // Reward journey mission XP points
  uStore.user.xpPoints += mission.xp;

  // If all missions in this journey complete, mark journey completed, unlock next level
  const totalMissions = uStore.journeys[jIndex].missions.length;
  const completedMissions = uStore.journeys[jIndex].missions.filter(m => m.completed).length;
  
  if (totalMissions === completedMissions) {
    uStore.journeys[jIndex].completed = true;
    uStore.journeys[jIndex].streak += 1;
    // Unlock next level automatically if locked
    const nextJIndex = uStore.journeys.findIndex(j => !j.unlocked);
    if (nextJIndex !== -1) {
      uStore.journeys[nextJIndex].unlocked = true;
    }
  }

  saveDatabase();

  res.json({
    success: true,
    journeys: uStore.journeys,
    xpPoints: uStore.user.xpPoints
  });
});

// ----------------------
// 6. API - ACCOUNTABILITY & CHECKINS WITH PERSONAS
// ----------------------
app.get("/api/accountability", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  res.json({
    logs: uStore.accountabilityLogs,
    streak: uStore.user.lifeAreaScores.discipline
  });
});

app.post("/api/accountability/checkin", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { sleepRating, routineAlignment, monomodeCompletion, notes } = req.body;

  if (sleepRating === undefined || routineAlignment === undefined || monomodeCompletion === undefined) {
    return res.status(400).json({ error: "Ratings missing." });
  }

  const coachPersona = uStore.user.coachPersona || "ora";
  let coachPromptModifier = "";
  if (coachPersona === "spartan") {
    coachPromptModifier = "You are Commander Bright — a tough, high-energy Spartan lifestyle instructor. Call out lazy excuses immediately! Outline clear discipline metrics and willpower guidelines. Be extremely direct and encouraging but demanding.";
  } else if (coachPersona === "socrates") {
    coachPromptModifier = "You are Sage Socrates — a gentle philosophical teacher. Ask 2 deep questions about their routine, forcing them to self-examine where their distraction gaps reside. Focus on intellectual reasonings.";
  } else {
    coachPromptModifier = "You are Advisor Ora (Empathetic) — soft-spoken, highly comforting, loving, and supportive. Emphasize relief, lower cortisol levels, and practical slow habits.";
  }

  let finalFeedback = "";

  if (groq) {
    try {
      const gResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are the LifePilot coach advisor. Write a supportive coaching review message based strictly on the parameters provided. Stay simple and human-like. Respond with only the advice paragraph, no extra text."
          },
          {
            role: "user",
            content: `Analyze these daily executive parameters:\n- Sleep Window Quality: ${sleepRating}%\n- Routine Alignments: ${routineAlignment}%\n- Monomode Completes: ${monomodeCompletion}%\nNotes shared: "${notes || "Completed routine checklist"}"\n\nEvaluate their metrics and write a brief advice paragraph (2 to 3 sentences max) directly matching this persona coach profile constraint:\n${coachPromptModifier}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      finalFeedback = gResponse.choices[0]?.message?.content || "";
    } catch (gErr) {
      console.error("Groq failed in advisor generation:", gErr);
    }
  }

  if (!finalFeedback) {
    // Offline / Failsafe Advisor simulation
    if (coachPersona === "spartan") {
      finalFeedback = `Parameters are acceptable, but you are leaving critical margins behind! Your monomode completed score is ${monomodeCompletion}%. I need to see full deep work commitments. Turn off your distractions completely! No excuses tomorrow.`;
    } else if (coachPersona === "socrates") {
      finalFeedback = `Your metrics are steady, yet why does the divide between intention and execution remain? Why do you think sleep indices dropped to ${sleepRating}%? Look at what thoughts occupy your mind in evening hours. Reflect on this core motive.`;
    } else {
      finalFeedback = `You did a lovely job protecting your alignments. It's completely alright to take everything slowly, step by step. Try to let go of any self-criticism and rest comfortably tonight. I am proud of your consistency today.`;
    }
  }

  const newLog: DBAccountabilityLog = {
    id: `al-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sleepRating: parseInt(sleepRating),
    routineAlignment: parseInt(routineAlignment),
    monomodeCompletion: parseInt(monomodeCompletion),
    notes: notes || "Daily routine coordinates logged.",
    coachFeedback: finalFeedback.trim()
  };

  uStore.accountabilityLogs.unshift(newLog); // Put new items first in chronological check list
  
  // Calculate average discipline index rating
  const avgDiscipline = Math.round((parseInt(sleepRating) + parseInt(routineAlignment) + parseInt(monomodeCompletion)) / 3);
  uStore.user.lifeAreaScores.discipline = avgDiscipline;
  uStore.user.discipline = avgDiscipline;
  
  // Award 220 XP points for accountability logging
  uStore.user.xpPoints += 220;
  
  saveDatabase();

  res.json({
    success: true,
    logs: uStore.accountabilityLogs,
    scores: uStore.user.lifeAreaScores,
    xpPoints: uStore.user.xpPoints
  });
});

// ----------------------
// 7. API - MONETIZATION / BILLING GATEWAY SIMULATOR
// ----------------------
app.post("/api/billing/checkout", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  const { planType } = req.body;

  if (planType === "cancel") {
    uStore.user.role = "Free User";
    saveDatabase();
    return res.json({ message: "Downgraded to free limits.", role: "Free User" });
  }

  uStore.user.role = "Premium User";
  uStore.user.xpPoints += 500; // Premium bonus credit
  saveDatabase();

  res.json({
    success: true,
    message: "Authorization verified. Premium license active in cockpit.",
    invoice: {
      id: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: "$19.00 / Mo",
      platform: "LifePilot Stripe Secure Processor",
      status: "paid"
    },
    user: {
      role: "Premium User",
      xpPoints: uStore.user.xpPoints
    }
  });
});

// ----------------------
// 8. API - COACH DIRECTIVE CONSULTATIONS (SECURE PROXIED GEMINI ENDPOINT)
// ----------------------
app.post("/api/chat", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || "";
  const uStore = getUserStore(token);
  
  const { messages } = req.body;
  const lastMessageText = messages && messages.length > 0 ? messages[messages.length - 1].text : "How can I optimize my life?";

  const coachPersona = uStore.user.coachPersona || "ora";
  let promptConstraint = "";
  if (coachPersona === "spartan") {
    promptConstraint = "You are Commander Bright — a direct, high-energy, demanding spartan lifestyle instructor. Use ALL-CAPS highlights occasionally, call out passive excuses directly, and tell them exactly to work in monomodes.";
  } else if (coachPersona === "socrates") {
    promptConstraint = "You are Sage Socrates — an intellectual philosophical mentor. Speak elegantly, use thought-provoking questions, analyze reasoning patterns, and evaluate core values.";
  } else {
    promptConstraint = "You are Advisor Ora — a warm, supportive, calming, and deeply comforting coach. Speak softly, reduce cortisol anxiety, suggest gentle breathing intervals, and make tasks sound extremely simple and small.";
  }

  const jsonSystemPrompt = `You are the premium LifePilot AI Operating System advisor. ${promptConstraint}

Deliver customized, extremely helpful cognitive advice. Keep language humanly comforting.
You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no extra text.

The JSON must have exactly these fields:
{
  "text": "Your detailed personalized coach advice (2-4 paragraphs)",
  "rootCause": "Short label for root cause (e.g. Anxiety Avoidance)",
  "riskLevels": [
    { "factor": "Blocker name", "scale": 75, "color": "purple" },
    { "factor": "Another blocker", "scale": 60, "color": "cyan" }
  ],
  "actionItems": [
    "Step 1 action",
    "Step 2 action",
    "Step 3 action"
  ],
  "timeframeEstimation": "Time before initial progress is felt"
}`;

  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: jsonSystemPrompt },
          {
            role: "user",
            content: `User focus area: ${uStore.user.focusArea}\nUser discipline index: ${uStore.user.discipline}/100\nEnergy level: ${uStore.user.energyState}\n\nUser message: "${lastMessageText}"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1024
      });

      const responseText = response.choices[0]?.message?.content;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());

        // Save history in server db
        uStore.chats.push({
          id: `msg-user-${Date.now()}`,
          sender: "user",
          text: lastMessageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        const aiMsg: DBChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: parsed.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          analysis: {
            rootCause: parsed.rootCause,
            riskLevels: parsed.riskLevels,
            actionItems: parsed.actionItems,
            timeframeEstimation: parsed.timeframeEstimation
          }
        };
        uStore.chats.push(aiMsg);

        // Update user metrics slightly on consult complete
        uStore.user.xpPoints += 150;
        saveDatabase();

        return res.json(parsed);
      }
    } catch (apiErr: any) {
      console.error("Groq API chat error, launching failsafe fallback:", apiErr?.message || apiErr);
    }
  }

  // Failsafe Dynamic Advisor Fallback
  let mockText = "I detect typical habits and focus loops that are temporarily distracting you from your goals. Let's work together to make things much easier and clearer.";
  let mockRoot = "Dopamine & Distraction Trap";
  let mockRisks = [
    { factor: "Mental Tiredness", scale: 75, color: "purple" },
    { factor: "Choosing Short-term Fun Over Long-term Goals", scale: 85, color: "indigo" },
    { factor: "Phone & Notification Distractions", scale: 65, color: "cyan" }
  ];
  let mockActions = [
    "Work in a single 25-minute focused slot: turn off your immediate phone notifications.",
    "Prepare your study or work materials the night before to reduce starting friction.",
    "Take a short 5-minute break to sit quietly and rest your mind before jumping in."
  ];
  let mockTime = "48 Hours to feel much clearer and regain control.";

  const textLower = lastMessageText.toLowerCase();
  if (textLower.includes("focus") || textLower.includes("procrastinat") || textLower.includes("start")) {
    mockText = "Procrastination represents starting avoidance rather than an index of laziness. Let's bypass the overthinking loops completely with an ultra-short 5-minute sandbox focus frame.";
    mockRoot = "Anxiety Avoidance Reflex";
    mockRisks = [
      { factor: "Starting Friction", scale: 90, color: "purple" },
      { factor: "Task Complexity Sensation", scale: 75, color: "cyan" }
    ];
    mockActions = [
      "Open the task context immediately and leave it blank.",
      "Clear all notification bubbles or distractions.",
      "Launch a 5-minute timer and write freely without self-critique."
    ];
    mockTime = "24 Hours to break starting blockers.";
  } else if (textLower.includes("health") || textLower.includes("sleep")) {
    mockText = "Protecting your evening wind-down boundaries acts as a force multiplier for focus stamina. Let's settle your physiological rhythms with NSDR static breathing.";
    mockRoot = "Sympathetic Autonomic Dominance";
    mockRisks = [
      { factor: "Evening Blue-light Latency", scale: 85, color: "indigo" },
      { factor: "Elevated Cortisol Levels", scale: 70, color: "purple" }
    ];
    mockActions = [
      "Dim environmental overhead lighting by 50% past 9:30 PM.",
      "Run a 5-minute respiratory breathing pattern.",
      "Read paper boundaries to lower cognitive beta states."
    ];
    mockTime = "12 Hours to induce deep delta sleep.";
  }

  // Update server chats fallback
  uStore.chats.push({
    id: `msg-user-fb-${Date.now()}`,
    sender: "user",
    text: lastMessageText,
    timestamp: "NOW"
  });

  const aiFbMsg: DBChatMessage = {
    id: `msg-ai-fb-${Date.now()}`,
    sender: "ai",
    text: mockText,
    timestamp: "NOW",
    analysis: {
      rootCause: mockRoot,
      riskLevels: mockRisks,
      actionItems: mockActions,
      timeframeEstimation: mockTime
    }
  };
  uStore.chats.push(aiFbMsg);
  uStore.user.xpPoints += 150;
  saveDatabase();

  res.json({
    text: mockText,
    rootCause: mockRoot,
    riskLevels: mockRisks,
    actionItems: mockActions,
    timeframeEstimation: mockTime
  });
});

// Chats retrieval
app.get("/api/chats/history", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);
  res.json(uStore.chats);
});

// ----------------------
// 9. API - SYSTEM TELEMETRY MONITOR & ADMIN ENDPOINT
// ----------------------
let systemLogs: string[] = [
  "SYSTEM_GATEWAY_BOOTSTRAP_COMPLETE",
  "PINE_MEMORY_ROUTINES_ONLINE",
  "ADMIN_DIAGNOSTIC_CHART_PERSISTED"
];

app.get("/api/admin/system", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const uStore = getUserStore(token);

  res.json({
    activePilotCount: Object.keys(db).length + 4, // Simulated additional connected nodes
    systemStatus: "Healthy",
    cpuUsageRatio: "0.08 / 1.00",
    embeddedVectorCount: 382,
    backgroundTaskQueue: "Active",
    logs: [
      ...systemLogs,
      `USER_COCKPIT_SYNCHRONIZED_ID_${uStore.user.id.substring(0, 8).toUpperCase()}`,
      `XP_TELEMETRY_RECORDED_STAMP_${Date.now()}`
    ]
  });
});

// ----------------------
// VITE OR STATIC ASSETS ROUTING
// ----------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("LifePilot AI: Dev Environment loaded on Vite layer.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("LifePilot AI: Serving production dist pipeline.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LifePilot AI Core Running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
