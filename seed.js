const mongoose = require('mongoose');
const Disease = require('./models/Disease');
const User = require('./models/User');
require('dotenv').config();

const diseases = [
  {
    name: 'Apple Scab',
    imageLabel: 'apple_scab',
    affectedCrops: ['Apple', 'Crabapple'],
    severity: 'High',
    symptoms: ['Olive-green or brown spots on leaves', 'Velvety texture on lesions', 'Premature leaf drop', 'Scabby lesions on fruit'],
    causes: ['Fungus Venturia inaequalis', 'Wet spring weather', 'Poor air circulation'],
    prevention: ['Plant resistant varieties', 'Rake and destroy fallen leaves', 'Prune for air circulation', 'Apply dormant sprays'],
    organicTreatment: ['Neem oil spray', 'Sulfur-based fungicide', 'Copper spray', 'Baking soda solution'],
    chemicalTreatment: ['Captan fungicide', 'Myclobutanil', 'Thiophanate-methyl'],
    sustainablePractices: ['Crop rotation', 'Composting fallen leaves away from orchard', 'Biological control agents']
  },
  {
    name: 'Tomato Late Blight',
    imageLabel: 'tomato_late_blight',
    affectedCrops: ['Tomato', 'Potato'],
    severity: 'Critical',
    symptoms: ['Water-soaked lesions on leaves', 'White mold on leaf undersides', 'Brown-black stem lesions', 'Rapid plant collapse'],
    causes: ['Oomycete Phytophthora infestans', 'Cool humid weather', 'Overhead irrigation'],
    prevention: ['Use certified disease-free seeds', 'Avoid overhead watering', 'Ensure good drainage', 'Space plants for airflow'],
    organicTreatment: ['Copper-based fungicide', 'Bordeaux mixture', 'Remove infected plants immediately'],
    chemicalTreatment: ['Chlorothalonil', 'Mancozeb', 'Metalaxyl'],
    sustainablePractices: ['Drip irrigation', 'Mulching', 'Resistant variety selection']
  },
  {
    name: 'Powdery Mildew',
    imageLabel: 'powdery_mildew',
    affectedCrops: ['Wheat', 'Cucumber', 'Squash', 'Grapes', 'Roses'],
    severity: 'Medium',
    symptoms: ['White powdery coating on leaves', 'Yellowing of affected areas', 'Distorted new growth', 'Premature leaf drop'],
    causes: ['Various fungal species', 'Warm dry days with cool nights', 'High humidity', 'Dense planting'],
    prevention: ['Plant resistant varieties', 'Avoid excess nitrogen fertilizer', 'Ensure good air circulation', 'Water at base of plants'],
    organicTreatment: ['Potassium bicarbonate', 'Neem oil', 'Milk spray (1:9 ratio)', 'Sulfur dust'],
    chemicalTreatment: ['Trifloxystrobin', 'Myclobutanil', 'Propiconazole'],
    sustainablePractices: ['Companion planting', 'Proper spacing', 'Morning watering']
  },
  {
    name: 'Bacterial Leaf Spot',
    imageLabel: 'bacterial_leaf_spot',
    affectedCrops: ['Pepper', 'Tomato', 'Peach', 'Plum'],
    severity: 'Medium',
    symptoms: ['Small water-soaked spots', 'Yellow halos around spots', 'Spots turn brown/black', 'Leaf tearing and drop'],
    causes: ['Xanthomonas bacteria', 'Warm wet weather', 'Infected seeds or transplants', 'Overhead irrigation'],
    prevention: ['Use disease-free seeds', 'Avoid working with wet plants', 'Crop rotation', 'Resistant varieties'],
    organicTreatment: ['Copper hydroxide spray', 'Copper octanoate', 'Remove infected leaves'],
    chemicalTreatment: ['Copper-based bactericides', 'Streptomycin (limited use)'],
    sustainablePractices: ['Drip irrigation', 'Sanitation practices', 'Proper plant spacing']
  },
  {
    name: 'Corn Rust',
    imageLabel: 'corn_rust',
    affectedCrops: ['Corn', 'Maize'],
    severity: 'High',
    symptoms: ['Circular to elongated brown pustules', 'Pustules on both leaf surfaces', 'Yellowing around pustules', 'Premature drying'],
    causes: ['Puccinia sorghi fungus', 'Cool moist weather', 'Wind-dispersed spores'],
    prevention: ['Plant resistant hybrids', 'Early planting', 'Monitor fields regularly'],
    organicTreatment: ['Sulfur-based fungicides', 'Neem oil application'],
    chemicalTreatment: ['Azoxystrobin', 'Propiconazole', 'Trifloxystrobin'],
    sustainablePractices: ['Crop rotation', 'Balanced fertilization', 'Timely harvesting']
  },
  {
    name: 'Healthy Leaf',
    imageLabel: 'healthy',
    affectedCrops: [],
    severity: 'Low',
    symptoms: ['No disease symptoms detected'],
    causes: [],
    prevention: ['Continue good agricultural practices', 'Regular monitoring', 'Proper irrigation and nutrition'],
    organicTreatment: ['No treatment needed'],
    chemicalTreatment: [],
    sustainablePractices: ['Maintain soil health', 'Balanced fertilization', 'Integrated pest management']
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Disease.deleteMany();
  await Disease.insertMany(diseases);
  console.log('✅ Diseases seeded');

  const adminExists = await User.findOne({ email: 'admin@leafapp.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@leafapp.com', password: 'admin123', role: 'admin' });
    console.log('✅ Admin user created: admin@leafapp.com / admin123');
  }

  mongoose.disconnect();
}

seed().catch(console.error);
