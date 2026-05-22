import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, "..");
const SOURCE_DB_FILE = path.join(ROOT_DIR, "server", "db.json");
const RUNTIME_DB_FILE = path.join("/tmp", "fitverse-db.json");

const parseBody = async (req) => {
  if (req.body && Object.keys(req.body).length > 0) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    return {};
  }
};

const ensureDbFile = async () => {
  try {
    if (!fs.existsSync(RUNTIME_DB_FILE)) {
      const source = await fsp.readFile(SOURCE_DB_FILE, "utf8");
      await fsp.writeFile(RUNTIME_DB_FILE, source, "utf8");
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      await fsp.writeFile(
        RUNTIME_DB_FILE,
        JSON.stringify({ users: [], classes: [], products: [] }, null, 2),
        "utf8",
      );
    } else {
      throw err;
    }
  }
};

const readDB = async () => {
  await ensureDbFile();
  const content = await fsp.readFile(RUNTIME_DB_FILE, "utf8");
  return JSON.parse(content || "{}");
};

const writeDB = async (data) => {
  await ensureDbFile();
  await fsp.writeFile(RUNTIME_DB_FILE, JSON.stringify(data, null, 2), "utf8");
};

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export default async function handler(req, res) {
  const slug = req.query.slug;
  const segments = Array.isArray(slug) ? slug : [slug];
  const method = req.method;
  const body = await parseBody(req);

  const db = await readDB();

  // --- Authentication ---
  if (segments.length === 1 && segments[0] === "login" && method === "POST") {
    const { email, password } = body;
    if (email === "admin" && password === "admin123") {
      return sendJson(res, 200, {
        success: true,
        user: {
          name: "Administrator",
          email: "admin@trainx.com",
          role: "admin",
        },
      });
    }

    const user = (db.users || []).find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      return sendJson(res, 200, {
        success: true,
        user: { ...user, role: "member" },
      });
    }

    return sendJson(res, 401, {
      success: false,
      message: "Invalid credentials",
    });
  }

  if (
    segments.length === 1 &&
    segments[0] === "register" &&
    method === "POST"
  ) {
    const newUser = body;
    if (!newUser.email || !newUser.password || !newUser.name) {
      return sendJson(res, 400, {
        success: false,
        message: "Nombre, email y contraseña son obligatorios",
      });
    }

    if ((db.users || []).some((u) => u.email === newUser.email)) {
      return sendJson(res, 409, {
        success: false,
        message: "Email already exists",
      });
    }

    const createdUser = {
      ...newUser,
      id: Date.now(),
      role: "member",
      plan: null,
      paymentStatus: "Paid",
      attendance: 0,
      routine: "",
      notifications: [],
      payments: [],
      progress: [],
    };

    db.users = db.users || [];
    db.users.push(createdUser);
    await writeDB(db);
    return sendJson(res, 200, { success: true, user: createdUser });
  }

  // --- User Management ---
  if (segments.length === 1 && segments[0] === "users" && method === "GET") {
    return sendJson(res, 200, db.users || []);
  }

  if (segments.length === 2 && segments[0] === "users" && method === "PUT") {
    const id = parseInt(segments[1]);
    const index = (db.users || []).findIndex((u) => u.id === id);
    if (index === -1)
      return sendJson(res, 404, { success: false, message: "User not found" });
    db.users[index] = { ...db.users[index], ...body };
    await writeDB(db);
    return sendJson(res, 200, { success: true, user: db.users[index] });
  }

  if (segments.length === 2 && segments[0] === "users" && method === "DELETE") {
    const id = parseInt(segments[1]);
    db.users = (db.users || []).filter((u) => u.id !== id);
    await writeDB(db);
    return sendJson(res, 200, { success: true });
  }

  // --- Class Management ---
  if (segments.length === 1 && segments[0] === "classes" && method === "GET") {
    const today = new Date().toLocaleDateString();
    db.classes = db.classes || [];
    if (db.lastResetDate !== today) {
      db.lastResetDate = today;
      db.classes = db.classes.map((c) => ({
        ...c,
        slots: c.total,
        attendees: [],
      }));
      await writeDB(db);
    }
    return sendJson(res, 200, db.classes);
  }

  if (segments.length === 2 && segments[0] === "classes" && method === "PUT") {
    const id = parseInt(segments[1]);
    const classIdx = (db.classes || []).findIndex((c) => c.id === id);
    if (classIdx === -1)
      return sendJson(res, 404, { message: "Class not found" });
    const currentAttendees = db.classes[classIdx].attendees?.length || 0;
    db.classes[classIdx].total = parseInt(body.total);
    db.classes[classIdx].slots = db.classes[classIdx].total - currentAttendees;
    await writeDB(db);
    return sendJson(res, 200, { success: true, class: db.classes[classIdx] });
  }

  if (
    segments.length === 4 &&
    segments[0] === "classes" &&
    segments[2] === "attendees" &&
    method === "DELETE"
  ) {
    const classId = parseInt(segments[1]);
    const userId = parseInt(segments[3]);
    const classIdx = (db.classes || []).findIndex((c) => c.id === classId);
    if (classIdx === -1)
      return sendJson(res, 404, { message: "Class not found" });
    const previous = db.classes[classIdx].attendees?.length || 0;
    db.classes[classIdx].attendees = (
      db.classes[classIdx].attendees || []
    ).filter((u) => u.id !== userId);
    if ((db.classes[classIdx].attendees || []).length < previous) {
      db.classes[classIdx].slots = (db.classes[classIdx].slots || 0) + 1;
    }
    await writeDB(db);
    return sendJson(res, 200, { success: true, class: db.classes[classIdx] });
  }

  if (
    segments.length === 2 &&
    segments[0] === "classes" &&
    segments[1] === "book" &&
    method === "POST"
  ) {
    const { classId, userId } = body;
    const classIdx = (db.classes || []).findIndex(
      (c) => c.id === parseInt(classId),
    );
    if (classIdx === -1)
      return sendJson(res, 404, { message: "Class not found" });
    const targetClass = db.classes[classIdx];
    if (targetClass.slots <= 0)
      return sendJson(res, 400, { message: "Class full" });
    const user = (db.users || []).find((u) => u.id === parseInt(userId));
    if (!user) return sendJson(res, 404, { message: "User not found" });
    targetClass.slots -= 1;
    if (!targetClass.attendees) targetClass.attendees = [];
    targetClass.attendees.push(user);
    await writeDB(db);
    return sendJson(res, 200, { success: true, class: targetClass });
  }

  // --- Progress ---
  if (
    segments.length === 3 &&
    segments[0] === "users" &&
    segments[2] === "progress" &&
    method === "POST"
  ) {
    const userId = parseInt(segments[1]);
    const userIdx = (db.users || []).findIndex((u) => u.id === userId);
    if (userIdx === -1)
      return sendJson(res, 404, { success: false, message: "User not found" });
    db.users[userIdx].progress = db.users[userIdx].progress || [];
    db.users[userIdx].progress.push({
      date: body.date,
      weight: parseFloat(body.weight),
    });
    await writeDB(db);
    return sendJson(res, 200, {
      success: true,
      progress: db.users[userIdx].progress,
    });
  }

  // --- Check-in ---
  if (
    segments.length === 1 &&
    segments[0] === "check-in" &&
    method === "POST"
  ) {
    const userId = parseInt(body.userId);
    const userIdx = (db.users || []).findIndex((u) => u.id === userId);
    if (userIdx === -1)
      return sendJson(res, 404, {
        success: false,
        message: "Usuario no encontrado",
      });
    const user = db.users[userIdx];
    if (user.paymentStatus === "Overdue") {
      return sendJson(res, 200, {
        success: false,
        message: "ABONO VENCIDO. Por favor regularizar.",
      });
    }
    db.users[userIdx].attendance = (db.users[userIdx].attendance || 0) + 1;
    await writeDB(db);
    return sendJson(res, 200, {
      success: true,
      message: `¡Bienvenido ${user.name}!`,
      user: db.users[userIdx],
    });
  }

  // --- Leaderboard ---
  if (
    segments.length === 1 &&
    segments[0] === "leaderboard" &&
    method === "GET"
  ) {
    const users = db.users || [];
    const leaderboard = users
      .filter((u) => u.role !== "admin")
      .sort((a, b) => (b.attendance || 0) - (a.attendance || 0))
      .slice(0, 10)
      .map((u) => ({
        id: u.id,
        name: u.name,
        attendance: u.attendance || 0,
        badges: u.badges || [],
      }));
    return sendJson(res, 200, leaderboard);
  }

  // --- Dashboard ---
  if (
    segments.length === 1 &&
    segments[0] === "dashboard" &&
    method === "GET"
  ) {
    const users = db.users || [];
    const classes = db.classes || [];
    const payments = users.flatMap((u) => u.payments || []);
    const totalUsers = users.length;
    const activeMembers = users.filter(
      (u) => u.paymentStatus === "Paid",
    ).length;
    const totalRevenue = payments.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0,
    );
    const classStats = classes
      .map((c) => ({ name: c.name, count: c.attendees?.length || 0 }))
      .sort((a, b) => b.count - a.count);
    const planStats = {
      Común: users.filter((u) => u.plan === "Común").length,
      "Personalizado (Pro)": users.filter(
        (u) => u.plan === "Personalizado (Pro)",
      ).length,
      "Sin Plan": users.filter((u) => !u.plan).length,
    };
    return sendJson(res, 200, {
      success: true,
      stats: { totalUsers, activeMembers, totalRevenue, classStats, planStats },
    });
  }

  // --- Products ---
  if (segments.length === 1 && segments[0] === "products" && method === "GET") {
    return sendJson(res, 200, db.products || []);
  }

  if (
    segments.length === 1 &&
    segments[0] === "products" &&
    method === "POST"
  ) {
    const { name, price, stock, image } = body;
    db.products = db.products || [];
    const newProduct = {
      id: Date.now(),
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      image,
    };
    db.products.push(newProduct);
    await writeDB(db);
    return sendJson(res, 200, { success: true, product: newProduct });
  }

  if (
    segments.length === 2 &&
    segments[0] === "products" &&
    method === "DELETE"
  ) {
    const productId = parseInt(segments[1]);
    db.products = (db.products || []).filter((p) => p.id !== productId);
    await writeDB(db);
    return sendJson(res, 200, { success: true });
  }

  if (
    segments.length === 2 &&
    segments[0] === "store" &&
    segments[1] === "buy" &&
    method === "POST"
  ) {
    const { userId, productId } = body;
    const productIdx = (db.products || []).findIndex(
      (p) => p.id === parseInt(productId),
    );
    const userIdx = (db.users || []).findIndex(
      (u) => u.id === parseInt(userId),
    );
    if (productIdx === -1 || userIdx === -1) {
      return sendJson(res, 404, {
        success: false,
        message: "Producto o Usuario no encontrado",
      });
    }
    const product = db.products[productIdx];
    if (product.stock <= 0) {
      return sendJson(res, 400, { success: false, message: "Sin stock" });
    }
    db.products[productIdx].stock -= 1;
    db.users[userIdx].purchases = db.users[userIdx].purchases || [];
    db.users[userIdx].purchases.push({
      id: Date.now(),
      productId: product.id,
      name: product.name,
      price: product.price,
      date: new Date().toLocaleDateString(),
    });
    await writeDB(db);
    return sendJson(res, 200, {
      success: true,
      message: `Has comprado: ${product.name}`,
    });
  }

  return sendJson(res, 404, { success: false, message: "Ruta no encontrada" });
}
