const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

const DISEASES = [
  {
    id: '1', name: 'Apple Scab', imageLabel: 'apple_scab',
    affectedCrops: ['Apple', 'Crabapple'], severity: 'High',
    symptoms: ['Olive-green or brown spots on leaves', 'Velvety texture on lesions', 'Premature leaf drop', 'Scabby lesions on fruit'],
    causes: ['Fungus Venturia inaequalis', 'Wet spring weather', 'Poor air circulation'],
    prevention: ['Plant resistant varieties', 'Rake and destroy fallen leaves', 'Prune for air circulation'],
    organicTreatment: ['Neem oil spray', 'Sulfur-based fungicide', 'Copper spray'],
    chemicalTreatment: ['Captan fungicide', 'Myclobutanil', 'Thiophanate-methyl'],
    sustainablePractices: ['Crop rotation', 'Composting fallen leaves away from orchard'],
    products: ['Neem Gold Oil', 'Captan 50WP', 'Copper Oxychloride'],
    weatherRisk: { highHumidity: true, lowTemp: false, highRainfall: true }
  },
  {
    id: '2', name: 'Tomato Late Blight', imageLabel: 'tomato_late_blight',
    affectedCrops: ['Tomato', 'Potato'], severity: 'Critical',
    symptoms: ['Water-soaked lesions on leaves', 'White mold on leaf undersides', 'Brown-black stem lesions', 'Rapid plant collapse'],
    causes: ['Oomycete Phytophthora infestans', 'Cool humid weather', 'Overhead irrigation'],
    prevention: ['Use certified disease-free seeds', 'Avoid overhead watering', 'Ensure good drainage'],
    organicTreatment: ['Copper-based fungicide', 'Bordeaux mixture', 'Remove infected plants immediately'],
    chemicalTreatment: ['Chlorothalonil', 'Mancozeb', 'Metalaxyl'],
    sustainablePractices: ['Drip irrigation', 'Mulching', 'Resistant variety selection'],
    products: ['Bordeaux Mixture', 'Mancozeb 75WP', 'Ridomil Gold'],
    weatherRisk: { highHumidity: true, lowTemp: true, highRainfall: true }
  },
  {
    id: '3', name: 'Powdery Mildew', imageLabel: 'powdery_mildew',
    affectedCrops: ['Wheat', 'Cucumber', 'Squash', 'Grapes'], severity: 'Medium',
    symptoms: ['White powdery coating on leaves', 'Yellowing of affected areas', 'Distorted new growth'],
    causes: ['Various fungal species', 'Warm dry days with cool nights', 'High humidity'],
    prevention: ['Plant resistant varieties', 'Avoid excess nitrogen fertilizer', 'Ensure good air circulation'],
    organicTreatment: ['Potassium bicarbonate', 'Neem oil', 'Milk spray (1:9 ratio)'],
    chemicalTreatment: ['Trifloxystrobin', 'Myclobutanil', 'Propiconazole'],
    sustainablePractices: ['Companion planting', 'Proper spacing', 'Morning watering'],
    products: ['Sulfex WP', 'Bavistin DF', 'Neem Karanj Oil'],
    weatherRisk: { highHumidity: true, lowTemp: false, highRainfall: false }
  },
  {
    id: '4', name: 'Bacterial Leaf Spot', imageLabel: 'bacterial_leaf_spot',
    affectedCrops: ['Pepper', 'Tomato', 'Peach'], severity: 'Medium',
    symptoms: ['Small water-soaked spots', 'Yellow halos around spots', 'Spots turn brown/black'],
    causes: ['Xanthomonas bacteria', 'Warm wet weather', 'Infected seeds'],
    prevention: ['Use disease-free seeds', 'Avoid working with wet plants', 'Crop rotation'],
    organicTreatment: ['Copper hydroxide spray', 'Remove infected leaves'],
    chemicalTreatment: ['Copper-based bactericides', 'Streptomycin'],
    sustainablePractices: ['Drip irrigation', 'Sanitation practices'],
    products: ['Kocide 3000', 'Agrimycin 17', 'Copper Oxychloride 50WP'],
    weatherRisk: { highHumidity: true, lowTemp: false, highRainfall: true }
  },
  {
    id: '5', name: 'Corn Rust', imageLabel: 'corn_rust',
    affectedCrops: ['Corn', 'Maize'], severity: 'High',
    symptoms: ['Circular brown pustules on leaves', 'Yellowing around pustules', 'Premature drying'],
    causes: ['Puccinia sorghi fungus', 'Cool moist weather', 'Wind-dispersed spores'],
    prevention: ['Plant resistant hybrids', 'Early planting', 'Monitor fields regularly'],
    organicTreatment: ['Sulfur-based fungicides', 'Neem oil application'],
    chemicalTreatment: ['Azoxystrobin', 'Propiconazole', 'Trifloxystrobin'],
    sustainablePractices: ['Crop rotation', 'Balanced fertilization'],
    products: ['Amistar Top', 'Tilt 250EC', 'Nativo 75WG'],
    weatherRisk: { highHumidity: true, lowTemp: true, highRainfall: false }
  },
  {
    id: '6', name: 'Healthy Leaf', imageLabel: 'healthy',
    affectedCrops: [], severity: 'Low',
    symptoms: ['No disease symptoms detected'],
    causes: [],
    prevention: ['Continue good agricultural practices', 'Regular monitoring'],
    organicTreatment: ['No treatment needed'],
    chemicalTreatment: [],
    sustainablePractices: ['Maintain soil health', 'Balanced fertilization'],
    products: [],
    weatherRisk: { highHumidity: false, lowTemp: false, highRainfall: false }
  }
];

const REGION_CROPS = {
  'Andhra Pradesh': ['Rice', 'Tobacco', 'Cotton', 'Sugarcane', 'Chilli'],
  'Tamil Nadu': ['Rice', 'Banana', 'Sugarcane', 'Groundnut', 'Coconut'],
  'Maharashtra': ['Sugarcane', 'Cotton', 'Soybean', 'Onion', 'Grapes'],
  'Punjab': ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane'],
  'Karnataka': ['Coffee', 'Ragi', 'Maize', 'Sunflower', 'Coconut'],
  'Kerala': ['Coconut', 'Rubber', 'Tea', 'Coffee', 'Pepper'],
  'Uttar Pradesh': ['Wheat', 'Sugarcane', 'Rice', 'Potato', 'Mustard'],
  'West Bengal': ['Rice', 'Jute', 'Tea', 'Potato', 'Mustard'],
  'Gujarat': ['Cotton', 'Groundnut', 'Wheat', 'Bajra', 'Castor'],
  'Rajasthan': ['Bajra', 'Wheat', 'Mustard', 'Jowar', 'Maize'],
  'Default': ['Rice', 'Wheat', 'Maize', 'Tomato', 'Potato']
};

const CHATBOT_RESPONSES = {
  'yellow leaves': { answer: 'Yellow leaves can indicate nitrogen deficiency, overwatering, or early fungal infection. Check soil moisture and consider a nitrogen-rich fertilizer. If spots appear, it may be Bacterial Leaf Spot or Powdery Mildew.', disease: 'powdery_mildew' },
  'brown spots': { answer: 'Brown spots are commonly caused by fungal diseases like Apple Scab or Bacterial Leaf Spot. Ensure good air circulation, avoid overhead watering, and apply copper-based fungicide.', disease: 'bacterial_leaf_spot' },
  'white powder': { answer: 'White powdery coating is a classic sign of Powdery Mildew. Apply neem oil or potassium bicarbonate spray. Improve air circulation around plants.', disease: 'powdery_mildew' },
  'wilting': { answer: 'Wilting can be caused by root rot, drought stress, or Tomato Late Blight. Check soil drainage and look for dark lesions on stems.', disease: 'tomato_late_blight' },
  'black spots': { answer: 'Black spots often indicate fungal infection. Could be Apple Scab or advanced Bacterial Leaf Spot. Remove affected leaves and apply fungicide immediately.', disease: 'apple_scab' },
  'rust': { answer: 'Orange/brown rust pustules indicate Corn Rust or similar rust diseases. Apply azoxystrobin or propiconazole fungicide. Plant resistant varieties next season.', disease: 'corn_rust' },
  'treatment': { answer: 'For most leaf diseases: 1) Remove infected leaves, 2) Apply neem oil for organic treatment, 3) Use copper-based fungicide for bacterial issues, 4) Ensure proper spacing for air circulation.', disease: null },
  'prevention': { answer: 'Key prevention tips: Use disease-resistant varieties, practice crop rotation, avoid overhead irrigation, maintain proper plant spacing, and monitor regularly for early signs.', disease: null },
  'organic': { answer: 'Organic treatments include: Neem oil spray, Copper-based fungicides, Bordeaux mixture, Potassium bicarbonate, Milk spray (1:9 ratio with water), and Sulfur dust.', disease: null },
  'default': { answer: 'I can help with plant disease questions! Try asking about: yellow leaves, brown spots, white powder, wilting, rust, treatment options, or prevention methods.', disease: null }
};

db.defaults({ users: [], scans: [], forum: [], notifications: [] }).write();

// Seed users
const adminExists = db.get('users').find({ email: 'admin@leafapp.com' }).value();
if (!adminExists) {
  db.get('users').push({ id: 'admin1', name: 'Admin', email: 'admin@leafapp.com', password: bcrypt.hashSync('admin123', 10), role: 'admin', createdAt: new Date().toISOString() }).write();
}
const swathiExists = db.get('users').find({ email: 'swathi.bt23@bitsaty.ac.in' }).value();
if (!swathiExists) {
  db.get('users').push({ id: 'user_swathi', name: 'Swathi', email: 'swathi.bt23@bitsaty.ac.in', password: bcrypt.hashSync('swatzz_2005', 10), role: 'user', createdAt: new Date().toISOString() }).write();
} else {
  db.get('users').find({ email: 'swathi.bt23@bitsaty.ac.in' }).assign({ password: bcrypt.hashSync('swatzz_2005', 10) }).write();
}

const JWT_SECRET = process.env.JWT_SECRET || 'leafsecret2024';
const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.get('users').find({ id: decoded.id }).value();
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Auth ──────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (db.get('users').find({ email }).value()) return res.status(400).json({ message: 'Email already exists' });
  const user = { id: `u_${Date.now()}`, name, email, password: bcrypt.hashSync(password, 10), role: 'user', createdAt: new Date().toISOString() };
  db.get('users').push(user).write();
  res.status(201).json({ token: genToken(user.id), user: safeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: genToken(user.id), user: safeUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => res.json(safeUser(req.user)));

// ── Diseases ──────────────────────────────────────────────
app.get('/api/diseases', (req, res) => res.json(DISEASES.map(d => ({ id: d.id, _id: d.id, name: d.name, imageLabel: d.imageLabel, affectedCrops: d.affectedCrops, severity: d.severity }))));
app.get('/api/diseases/:id', (req, res) => {
  const d = DISEASES.find(d => d.id === req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json({ ...d, _id: d.id });
});
app.post('/api/diseases', auth, adminOnly, (req, res) => {
  const d = { ...req.body, id: `d_${Date.now()}`, _id: `d_${Date.now()}` };
  DISEASES.push(d);
  res.status(201).json(d);
});
app.put('/api/diseases/:id', auth, adminOnly, (req, res) => {
  const idx = DISEASES.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  DISEASES[idx] = { ...DISEASES[idx], ...req.body };
  res.json(DISEASES[idx]);
});
app.delete('/api/diseases/:id', auth, adminOnly, (req, res) => {
  const idx = DISEASES.findIndex(d => d.id === req.params.id);
  if (idx !== -1) DISEASES.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// ── Scans (bulk support) ──────────────────────────────────
app.post('/api/scans', auth, upload.array('images', 10), (req, res) => {
  const files = req.files || [];
  const diseases = Array.isArray(req.body.detectedDisease) ? req.body.detectedDisease : [req.body.detectedDisease];
  const confidences = Array.isArray(req.body.confidence) ? req.body.confidence : [req.body.confidence];

  const results = files.map((file, i) => {
    const detectedDisease = diseases[i] || diseases[0];
    const confidence = confidences[i] || confidences[0];
    const diseaseInfo = DISEASES.find(d => d.imageLabel === detectedDisease);
    const status = detectedDisease === 'healthy' ? 'healthy' : diseaseInfo ? 'diseased' : 'unknown';
    const scan = {
      id: `s_${Date.now()}_${i}`, _id: `s_${Date.now()}_${i}`,
      user: req.user.id, imageUrl: `/uploads/${file.filename}`,
      detectedDisease, confidence: parseFloat(confidence), status,
      diseaseInfo: diseaseInfo ? { _id: diseaseInfo.id, name: diseaseInfo.name, severity: diseaseInfo.severity } : null,
      createdAt: new Date().toISOString()
    };
    db.get('scans').push(scan).write();
    return scan;
  });

  // fallback for single scan without file
  if (files.length === 0) {
    const detectedDisease = req.body.detectedDisease;
    const confidence = req.body.confidence;
    const diseaseInfo = DISEASES.find(d => d.imageLabel === detectedDisease);
    const status = detectedDisease === 'healthy' ? 'healthy' : diseaseInfo ? 'diseased' : 'unknown';
    const scan = {
      id: `s_${Date.now()}`, _id: `s_${Date.now()}`,
      user: req.user.id, imageUrl: '', detectedDisease,
      confidence: parseFloat(confidence), status,
      diseaseInfo: diseaseInfo ? { _id: diseaseInfo.id, name: diseaseInfo.name, severity: diseaseInfo.severity } : null,
      createdAt: new Date().toISOString()
    };
    db.get('scans').push(scan).write();
    return res.status(201).json(scan);
  }

  res.status(201).json(results.length === 1 ? results[0] : results);
});

app.get('/api/scans', auth, (req, res) => {
  const scans = db.get('scans').filter({ user: req.user.id }).value().reverse();
  res.json(scans);
});

app.get('/api/scans/stats', auth, (req, res) => {
  const scans = db.get('scans').filter({ user: req.user.id }).value();
  const byDisease = {};
  scans.forEach(s => {
    const name = s.diseaseInfo?.name || s.detectedDisease || 'Unknown';
    byDisease[name] = (byDisease[name] || 0) + 1;
  });
  const trend = scans.slice(-30).reduce((acc, s) => {
    const date = s.createdAt?.slice(0, 10);
    const existing = acc.find(a => a.date === date);
    if (existing) existing.count++;
    else acc.push({ date, count: 1 });
    return acc;
  }, []);
  res.json({ total: scans.length, healthy: scans.filter(s => s.status === 'healthy').length, diseased: scans.filter(s => s.status === 'diseased').length, byDisease, trend });
});

// ── Weather Alerts ────────────────────────────────────────
app.get('/api/weather/alerts', auth, async (req, res) => {
  const { lat, lon, location } = req.query;
  try {
    // Use Open-Meteo (free, no API key needed)
    const url = lat && lon
      ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`
      : `https://api.open-meteo.com/v1/forecast?latitude=15.9&longitude=79.9&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`;

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const data = await response.json();
    const current = data.current;

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const rain = current.precipitation;

    const alerts = [];
    const riskDiseases = [];

    if (humidity > 75) {
      alerts.push({ type: 'warning', icon: '💧', title: 'High Humidity Alert', message: `Humidity is ${humidity}%. High risk of fungal diseases.` });
      riskDiseases.push(...DISEASES.filter(d => d.weatherRisk?.highHumidity).map(d => d.name));
    }
    if (temp < 15) {
      alerts.push({ type: 'info', icon: '🌡️', title: 'Low Temperature Alert', message: `Temperature is ${temp}°C. Watch for Late Blight conditions.` });
      riskDiseases.push(...DISEASES.filter(d => d.weatherRisk?.lowTemp).map(d => d.name));
    }
    if (rain > 5) {
      alerts.push({ type: 'warning', icon: '🌧️', title: 'Heavy Rainfall Alert', message: `Rainfall ${rain}mm detected. Bacterial infections likely.` });
      riskDiseases.push(...DISEASES.filter(d => d.weatherRisk?.highRainfall).map(d => d.name));
    }
    if (alerts.length === 0) {
      alerts.push({ type: 'success', icon: '☀️', title: 'Good Conditions', message: 'Weather conditions are favorable for plant health.' });
    }

    res.json({ weather: { temp, humidity, rain, wind: current.wind_speed_10m }, alerts, riskDiseases: [...new Set(riskDiseases)], location: location || 'Your Location' });
  } catch (err) {
    // Fallback mock data if API fails
    res.json({
      weather: { temp: 28, humidity: 72, rain: 2, wind: 12 },
      alerts: [{ type: 'warning', icon: '💧', title: 'Moderate Humidity', message: 'Humidity at 72%. Monitor for fungal diseases.' }],
      riskDiseases: ['Powdery Mildew', 'Apple Scab'],
      location: location || 'Your Location'
    });
  }
});

// ── Location / Crop Intelligence ──────────────────────────
app.get('/api/location/crops', (req, res) => {
  const { region } = req.query;
  const crops = REGION_CROPS[region] || REGION_CROPS['Default'];
  const commonDiseases = DISEASES.filter(d => d.affectedCrops.some(c => crops.includes(c))).map(d => ({ id: d.id, name: d.name, severity: d.severity, affectedCrops: d.affectedCrops }));
  res.json({ region: region || 'Default', crops, commonDiseases, regions: Object.keys(REGION_CROPS).filter(r => r !== 'Default') });
});

// ── Chatbot ───────────────────────────────────────────────
app.post('/api/chatbot', auth, (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();
  let response = CHATBOT_RESPONSES['default'];
  for (const [key, val] of Object.entries(CHATBOT_RESPONSES)) {
    if (lower.includes(key)) { response = val; break; }
  }
  const diseaseDetail = response.disease ? DISEASES.find(d => d.imageLabel === response.disease) : null;
  const history = db.get('scans').filter({ user: req.user.id }).value().slice(-3);
  let contextualTip = '';
  if (history.length > 0) {
    const lastDisease = history[0]?.diseaseInfo?.name;
    if (lastDisease) contextualTip = ` Based on your recent scan showing ${lastDisease}, pay extra attention to treatment.`;
  }
  res.json({ answer: response.answer + contextualTip, disease: diseaseDetail ? { name: diseaseDetail.name, severity: diseaseDetail.severity, organicTreatment: diseaseDetail.organicTreatment } : null });
});

// ── Forum ─────────────────────────────────────────────────
app.get('/api/forum', (req, res) => {
  const posts = db.get('forum').value().reverse().map(p => {
    const user = db.get('users').find({ id: p.userId }).value();
    return { ...p, userName: user?.name || 'Anonymous' };
  });
  res.json(posts);
});

app.post('/api/forum', auth, upload.single('image'), (req, res) => {
  const post = {
    id: `f_${Date.now()}`, userId: req.user.id,
    title: req.body.title, content: req.body.content,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    likes: [], replies: [], createdAt: new Date().toISOString()
  };
  db.get('forum').push(post).write();
  res.status(201).json({ ...post, userName: req.user.name });
});

app.post('/api/forum/:id/reply', auth, (req, res) => {
  const post = db.get('forum').find({ id: req.params.id }).value();
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const reply = { id: `r_${Date.now()}`, userId: req.user.id, userName: req.user.name, content: req.body.content, createdAt: new Date().toISOString() };
  db.get('forum').find({ id: req.params.id }).get('replies').push(reply).write();
  res.json(reply);
});

app.post('/api/forum/:id/like', auth, (req, res) => {
  const post = db.get('forum').find({ id: req.params.id }).value();
  if (!post) return res.status(404).json({ message: 'Not found' });
  const likes = post.likes || [];
  const idx = likes.indexOf(req.user.id);
  if (idx > -1) likes.splice(idx, 1); else likes.push(req.user.id);
  db.get('forum').find({ id: req.params.id }).assign({ likes }).write();
  res.json({ likes: likes.length });
});

// ── Notifications ─────────────────────────────────────────
app.get('/api/notifications', auth, (req, res) => {
  const userNotifs = db.get('notifications').filter({ userId: req.user.id }).value().reverse();
  res.json(userNotifs);
});

app.post('/api/notifications/read', auth, (req, res) => {
  db.get('notifications').filter({ userId: req.user.id }).each(n => { n.read = true; }).write();
  res.json({ message: 'Marked as read' });
});

// ── Admin ─────────────────────────────────────────────────
app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const users = db.get('users').filter({ role: 'user' }).value().length;
  const scans = db.get('scans').value();
  const byDisease = {};
  scans.forEach(s => { const n = s.diseaseInfo?.name || 'Unknown'; byDisease[n] = (byDisease[n] || 0) + 1; });
  const recentScans = scans.slice(-10).reverse().map(s => {
    const user = db.get('users').find({ id: s.user }).value();
    return { ...s, user: user ? { name: user.name, email: user.email } : null };
  });
  res.json({ users, scans: scans.length, diseases: DISEASES.length, forum: db.get('forum').value().length, recentScans, byDisease });
});

app.get('/api/admin/users', auth, adminOnly, (req, res) => res.json(db.get('users').value().map(safeUser)));
app.get('/api/admin/scans', auth, adminOnly, (req, res) => res.json(db.get('scans').value().reverse()));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('✅ Login: swathi.bt23@bitsaty.ac.in / swatzz_2005');
});
