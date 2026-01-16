import * as functions from "firebase-functions";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";
import axios from "axios";
import type { Request, Response, NextFunction } from "express";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const db = admin.firestore();

const DEFAULT_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    billingPeriod: "month",
    features: ["Gym access", "Locker room", "1 guest pass/month"]
  },
  {
    id: "pro",
    name: "Pro Membership",
    price: 59,
    billingPeriod: "month",
    features: ["All Basic features", "Group classes", "2 guest passes/month"]
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    billingPeriod: "month",
    features: ["All Pro features", "Personal training", "Pool access"]
  }
];

const DEFAULT_CATEGORIES = [
  { id: "crossfit", name: "CrossFit" },
  { id: "pool", name: "Pool" },
  { id: "yoga", name: "Yoga" },
  { id: "hiit", name: "HIIT" }
];

const DEFAULT_SCHEDULE = [
  {
    id: "s1",
    title: "Morning CrossFit",
    dayOfWeek: "monday",
    startTime: "06:00",
    endTime: "07:00",
    category: "CrossFit",
    room: "Studio A",
    coach: { name: "John Smith", specialties: ["CrossFit", "HIIT"] }
  },
  {
    id: "s2",
    title: "Power Yoga",
    dayOfWeek: "tuesday",
    startTime: "08:00",
    endTime: "09:00",
    category: "Yoga",
    room: "Studio B",
    coach: { name: "Sarah Johnson", specialties: ["Yoga", "Meditation"] }
  },
  {
    id: "s3",
    title: "Lap Swimming",
    dayOfWeek: "wednesday",
    startTime: "10:00",
    endTime: "11:00",
    category: "Pool",
    coach: { name: "Mike Davis", specialties: ["Swimming", "Water Aerobics"] }
  },
  {
    id: "s4",
    title: "Afternoon HIIT",
    dayOfWeek: "thursday",
    startTime: "17:00",
    endTime: "18:00",
    category: "HIIT",
    room: "Main Floor",
    coach: { name: "Emily Brown", specialties: ["HIIT", "Cardio"] }
  }
];

const authEmulatorHost = process.env.AUTH_EMULATOR_HOST;
if (authEmulatorHost && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = authEmulatorHost;
}

const API_KEY = process.env.WEB_API_KEY || "";

const normalizeCode = (code: string) => code.trim().toUpperCase();

const getIdToken = async (email: string, password: string) => {
  const emulatorHost =
    process.env.AUTH_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST; // 127.0.0.1:9099

  // Base URL
  const baseUrl = emulatorHost
    ? `http://${emulatorHost}/identitytoolkit.googleapis.com`
    : "https://identitytoolkit.googleapis.com";

  // 🔴 IMPORTANT : clé spéciale pour l’emulator
  const key = emulatorHost ? "fake-api-key" : API_KEY;

  if (!key) {
    throw new Error("Missing FIREBASE_API_KEY");
  }

  const url = `${baseUrl}/v1/accounts:signInWithPassword?key=${key}`;

  const response = await axios.post(url, {
    email,
    password,
    returnSecureToken: true,
  });

  return response.data.idToken as string;
};



const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as Request & { user?: admin.auth.DecodedIdToken }).user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid auth token" });
  }
};

app.get("/api/public/plans", async (_req, res) => {
  const snapshot = await db.collection("plans").get();
  if (snapshot.empty) {
    return res.json(DEFAULT_PLANS);
  }

  const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json(plans);
});

app.get("/api/public/categories", async (_req, res) => {
  const snapshot = await db.collection("categories").get();
  if (snapshot.empty) {
    return res.json(DEFAULT_CATEGORIES);
  }

  const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json(categories);
});

app.post("/api/visits", async (req, res) => {
  const { fullName, phone, preferredDate, preferredTime, message } = req.body || {};

  if (!fullName || !phone || !preferredDate || !preferredTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  await db.collection("visits").add({
    fullName,
    phone,
    preferredDate,
    preferredTime,
    message: message || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.status(201).json({ ok: true });
});

app.post("/api/contract-codes/validate", async (req, res) => {
  const { contractCode } = req.body || {};
  if (!contractCode) {
    return res.status(400).json({ valid: false, reason: "Contract code is required" });
  }

  const code = normalizeCode(contractCode);
  const codeSnap = await db.collection("contractCodes").doc(code).get();

  if (!codeSnap.exists) {
    return res.json({ valid: false, reason: "Contract code not found" });
  }

  const data = codeSnap.data() || {};
  if (data.status !== "ACTIVE") {
    return res.json({ valid: false, reason: "Contract code is not active" });
  }

  const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
  if (expiresAt && expiresAt < new Date()) {
    return res.json({ valid: false, reason: "Contract code expired" });
  }

  return res.json({ valid: true });
});

app.post("/api/auth/signup", async (req, res) => {
  const {
    contractCode,
    firstName,
    lastName,
    dateOfBirth,
    trainingFrequency,
    email,
    password,
    confirmPassword
  } = req.body || {};

  if (!contractCode || !firstName || !lastName || !dateOfBirth || !trainingFrequency || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (confirmPassword && confirmPassword !== password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const code = normalizeCode(contractCode);
  const codeRef = db.collection("contractCodes").doc(code);
  const codeSnap = await codeRef.get();

  if (!codeSnap.exists) {
    return res.status(400).json({ message: "Invalid contract code" });
  }

  const codeData = codeSnap.data() || {};
  if (codeData.status !== "ACTIVE") {
    return res.status(400).json({ message: "Contract code is not active" });
  }

  const expiresAt = codeData.expiresAt?.toDate ? codeData.expiresAt.toDate() : null;
  if (expiresAt && expiresAt < new Date()) {
    return res.status(400).json({ message: "Contract code expired" });
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });
  } catch (error: any) {
    if (error?.code === "auth/email-already-exists") {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Failed to create user" });
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const batch = db.batch();
  batch.set(db.collection("users").doc(userRecord.uid), {
    userId: userRecord.uid,
    email,
    firstName,
    lastName,
    dateOfBirth,
    trainingFrequency,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.set(db.collection("subscriptions").doc(userRecord.uid), {
    userId: userRecord.uid,
    planId: codeData.planId || null,
    status: "ACTIVE",
    startDate: now.toISOString(),
    endDate: endDate.toISOString()
  });
  batch.update(codeRef, {
    status: "USED",
    usedBy: userRecord.uid,
    usedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();

  try {
    const idToken = await getIdToken(email, password);
    return res.status(201).json({ token: idToken });
  } catch (error) {
    return res.status(500).json({ message: "Signup succeeded, but login failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  let idToken: string;
  try {
    idToken = await getIdToken(email, password);
  } catch (error: any) {
    const message = error?.response?.data?.error?.message || "Invalid credentials";
    return res.status(401).json({ message });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const subscriptionSnap = await db.collection("subscriptions").doc(decoded.uid).get();
    const subscription = subscriptionSnap.exists ? subscriptionSnap.data() : null;

    if (subscription && subscription.status !== "ACTIVE") {
      return res.status(403).json({ message: "Your subscription is not active. Please contact support." });
    }

    return res.json({ token: idToken });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = (req as Request & { user?: admin.auth.DecodedIdToken }).user;
  if (!user) {
    return res.status(401).json({ message: "Missing user" });
  }

  const userSnap = await db.collection("users").doc(user.uid).get();
  const subscriptionSnap = await db.collection("subscriptions").doc(user.uid).get();

  const subscription = subscriptionSnap.exists ? subscriptionSnap.data() : null;
  const planId = subscription?.planId || null;
  const planSnap = planId ? await db.collection("plans").doc(planId).get() : null;

  return res.json({
    user: userSnap.exists ? { id: user.uid, ...userSnap.data() } : { id: user.uid, email: user.email },
    subscription: subscription ? { id: subscriptionSnap.id, ...subscription } : null,
    plan: planSnap?.exists ? { id: planSnap.id, ...planSnap.data() } : null
  });
});

app.get("/api/member/schedule", requireAuth, async (req, res) => {
  const dayOfWeek = typeof req.query.dayOfWeek === "string" ? req.query.dayOfWeek : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";

  let query: FirebaseFirestore.Query = db.collection("schedule");
  if (dayOfWeek) {
    query = query.where("dayOfWeek", "==", dayOfWeek);
  }
  if (category) {
    query = query.where("category", "==", category);
  }

  const snapshot = await query.get();
  let sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (snapshot.empty) {
    sessions = DEFAULT_SCHEDULE.filter((session) => {
      if (dayOfWeek && session.dayOfWeek !== dayOfWeek) return false;
      if (category && session.category !== category) return false;
      return true;
    });
  }

  return res.json(sessions);
});

app.get("/api/health", (_req, res) => {
  return res.json({ ok: true });
});

export const api = functions.https.onRequest(app);
