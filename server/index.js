
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOADS_DIR)); // Serve uploaded files

// Configure Multer
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Helper to read DB
// Helper to read DB (Estructura robusta por si faltan claves)
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) return { users: [], classes: [], products: [] };
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        return {
            users: data.users || [],
            classes: data.classes || [],
            products: data.products || [],
            lastResetDate: data.lastResetDate || ""
        };
    } catch (e) {
        return { users: [], classes: [], products: [] };
    }
};

// Helper to write DB (Protegido para Vercel)
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('Vercel Read-Only: No se pudo escribir en db.json de forma permanente.');
    }
};
// --- ROUTES ---

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    
    // Admin Check
    if (email === 'admin' && password === 'admin123') {
        return res.json({ success: true, user: { name: 'Administrator', email: 'admin@trainx.com', role: 'admin' } });
    }

    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        return res.json({ success: true, user: { ...user, role: 'member' } });
    }
    
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Register
app.post('/api/register', (req, res) => {
    const newUser = req.body;
    const db = readDB();

    if (db.users.some(u => u.email === newUser.email)) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const createdUser = {
        ...newUser,
        id: Date.now(),
        role: 'member',
        plan: null,
        paymentStatus: 'Paid',
        attendance: 0,
        routine: '',
        notifications: [],
        payments: [],
        progress: []
    };

    db.users.push(createdUser);
    writeDB(db);
    res.json({ success: true, user: createdUser });
});

// Get All Users (Admin)
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users);
});

// Update User (Generic)
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = readDB();
    
    const index = db.users.findIndex(u => u.id == id);
    if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

    db.users[index] = { ...db.users[index], ...updates };
    writeDB(db);
    res.json({ success: true, user: db.users[index] });
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.users = db.users.filter(u => u.id != id);
    writeDB(db);
    res.json({ success: true });
});

// --- Classes Routes ---

// --- BLOCK DE RUTAS DE CLASES (Adaptado para Vercel Read-Only) ---

app.get('/api/classes', (req, res) => {
    const db = readDB();
    const today = new Date().toLocaleDateString();

    // Check for Daily Reset
    if (db.lastResetDate !== today) {
        console.log('Resetting classes for new day...');
        db.lastResetDate = today;
        db.classes = db.classes.map(c => ({
            ...c,
            slots: c.total,
            attendees: []
        }));
        
        try {
            writeDB(db);
        } catch (error) {
            console.log('Vercel read-only: No se pudo persistir el reset diario, pero continuamos.');
        }
    }

    res.json(db.classes || []);
});

// Update Class (Capacity/Total)
app.put('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const { total } = req.body;
    const db = readDB();
    
    const classIdx = db.classes.findIndex(c => c.id == id);
    if (classIdx === -1) return res.status(404).json({ message: 'Class not found' });

    // Update total and recalculate slots based on current attendees
    const currentAttendees = db.classes[classIdx].attendees ? db.classes[classIdx].attendees.length : 0;
    db.classes[classIdx].total = parseInt(total);
    db.classes[classIdx].slots = parseInt(total) - currentAttendees;

    try {
        writeDB(db);
    } catch (error) {
        console.log('Vercel read-only: No se pudo guardar la modificacion de la clase.');
    }
    
    res.json({ success: true, class: db.classes[classIdx] });
});

// Remove Attendee from Class (Admin)
app.delete('/api/classes/:classId/attendees/:userId', (req, res) => {
    const { classId, userId } = req.params;
    const db = readDB();

    const classIdx = db.classes.findIndex(c => c.id == classId);
    if (classIdx === -1) return res.status(404).json({ message: 'Class not found' });

    const initialLength = db.classes[classIdx].attendees ? db.classes[classIdx].attendees.length : 0;
    db.classes[classIdx].attendees = db.classes[classIdx].attendees.filter(u => u.id != userId);
    
    // If a user was removed, increase slots
    if (db.classes[classIdx].attendees.length < initialLength) {
        db.classes[classIdx].slots += 1;
    }

    try {
        writeDB(db);
    } catch (error) {
        console.log('Vercel read-only: No se pudo guardar la eliminacion del alumno.');
    }

    res.json({ success: true, class: db.classes[classIdx] });
});

app.post('/api/classes/book', (req, res) => {
    const { classId, userId } = req.body;
    const db = readDB();
    
    // Find class
    const classIdx = db.classes.findIndex(c => c.id == classId);
    if (classIdx === -1) return res.status(404).json({ message: 'Class not found' });
    
    const targetClass = db.classes[classIdx];
    
    // Check slots
    if (targetClass.slots <= 0) return res.status(400).json({ message: 'Class full' });
    
    // Check if valid user
    const user = db.users.find(u => u.id == userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update DB
    db.classes[classIdx].slots -= 1;
    if (!db.classes[classIdx].attendees) db.classes[classIdx].attendees = [];
    db.classes[classIdx].attendees.push(user); // Saving full user object for easier display in Admin
    
    try {
        writeDB(db);
    } catch (error) {
        console.log('Vercel read-only: No se pudo guardar la reserva en el archivo.');
    }

    res.json({ success: true, class: db.classes[classIdx] });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, filePath: `/uploads/${req.file.filename}` });
});

// Add Progress Entry
app.post('/api/users/:id/progress', (req, res) => {
    const userId = parseInt(req.params.id);
    const { weight, date } = req.body;
    const db = readDB();
    
    const userIdx = db.users.findIndex(u => u.id === userId);
    if (userIdx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (!db.users[userIdx].progress) db.users[userIdx].progress = [];
    
    db.users[userIdx].progress.push({ date, weight: parseFloat(weight) });
    writeDB(db);
    
    res.json({ success: true, progress: db.users[userIdx].progress });
});



// Check-in (QR Scan)
app.post('/api/check-in', (req, res) => {
    const { userId } = req.body;
    const db = readDB();
    const userIdx = db.users.findIndex(u => u.id === parseInt(userId)); // ParseInt just in case
    
    if (userIdx === -1) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    // Logic: Increment attendance, check payment status maybe?
    const user = db.users[userIdx];
    
    // Optional: Check if Paid
    if (user.paymentStatus === 'Overdue') {
        return res.json({ success: false, message: 'ABONO VENCIDO. Por favor regularizar.' });
    }

    // Increment attendance
    db.users[userIdx].attendance = (db.users[userIdx].attendance || 0) + 1;
    
    // Basic Gamification: Check Streak (Simulated for now)
    // In real app, check dates. Here we just increment for fun.
    
    writeDB(db);
    res.json({ success: true, message: `¡Bienvenido ${user.name}!`, user: db.users[userIdx] });
});

// Leaderboard Endpoint
app.get('/api/leaderboard', (req, res) => {
    const db = readDB();
    const users = db.users || [];
    
    // Sort by attendance (desc)
    // We can also add points for badges if we want more complexity
    // For now simple attendance
    const leaderboard = users
        .filter(u => u.role !== 'admin') // Exclude admins
        .sort((a, b) => (b.attendance || 0) - (a.attendance || 0))
        .slice(0, 10) // Top 10
        .map(u => ({
            id: u.id,
            name: u.name,
            attendance: u.attendance || 0,
            badges: u.badges || []
        }));

    res.json(leaderboard);
});

// Dashboard Stats Endpoint
app.get('/api/dashboard', (req, res) => {
    const db = readDB();
    const users = db.users || [];
    const classes = db.classes || [];
    const payments = users.flatMap(u => u.payments || []);

    // 1. Basic Counts
    const totalUsers = users.length;
    const activeMembers = users.filter(u => u.paymentStatus === 'Paid').length;
    
    // 2. Revenue Calculation (Simple sum of all recorded payments)
    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    // 3. Class Popularity
    const classStats = classes.map(c => ({
        name: c.name,
        count: c.attendees ? c.attendees.length : 0
    })).sort((a, b) => b.count - a.count);

    // 4. Plan Distribution
    const planStats = {
        'Común': users.filter(u => u.plan === 'Común').length,
        'Personalizado (Pro)': users.filter(u => u.plan === 'Personalizado (Pro)').length,
        'Sin Plan': users.filter(u => !u.plan).length
    };

    res.json({
        success: true,
        stats: {
            totalUsers,
            activeMembers,
            totalRevenue,
            classStats,
            planStats
        }
    });
});



// --- STORE ENDPOINTS ---

// Get Products
app.get('/api/products', (req, res) => {
    const db = readDB();
    res.json(db.products || []);
});

// Add Product (Admin)
app.post('/api/products', (req, res) => {
    const { name, price, stock, image } = req.body;
    const db = readDB();
    if (!db.products) db.products = [];
    
    const newProduct = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        image
    };
    
    db.products.push(newProduct);
    writeDB(db);
    res.json({ success: true, product: newProduct });
});

// Delete Product (Admin)
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDB();
    if (!db.products) return res.json({ success: true });
    
    db.products = db.products.filter(p => p.id !== id);
    writeDB(db);
    res.json({ success: true });
});

// Buy Product
app.post('/api/store/buy', (req, res) => {
    const { userId, productId } = req.body;
    const db = readDB();
    
    const productIdx = db.products.findIndex(p => p.id === parseInt(productId));
    const userIdx = db.users.findIndex(u => u.id === parseInt(userId));
    
    if (productIdx === -1 || userIdx === -1) {
        return res.status(404).json({ success: false, message: 'Producto o Usuario no encontrado' });
    }
    
    const product = db.products[productIdx];
    
    if (product.stock <= 0) {
        return res.status(400).json({ success: false, message: 'Sin stock' });
    }
    
    // Decrement Stock
    db.products[productIdx].stock -= 1;
    
    // Add to User Purchases
    if (!db.users[userIdx].purchases) db.users[userIdx].purchases = [];
    db.users[userIdx].purchases.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        date: new Date().toLocaleDateString()
    });
    
    writeDB(db);
    res.json({ success: true, message: `Has comprado: ${product.name}` });
});

// --- LEVANTAR EL SERVIDOR (Adaptado para Vercel) ---

// Solo levanta el puerto de manera tradicional si NO estás en producción (entorno local)
if (process.env.NODE_ENV !== 'production') {
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        console.error('Server Error:', err);
    });
}

// MANTENER PROCESO ACTIVO (Solo en local, Vercel no lo necesita)
if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
        // Heartbeat local
    }, 10000);
}

// ESTO ES LO MÁS IMPORTANTE: Exportar la app para que Vercel la maneje
export default app;
