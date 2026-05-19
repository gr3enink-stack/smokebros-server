import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product';

dotenv.config();

// Mock cigar products data
const mockProducts = [
  // Cuban Cigars
  {
    name: 'Cohiba Robusto',
    brand: 'Cohiba',
    description: 'The flagship of Cuban cigars, Cohiba Robusto offers a rich, complex flavor profile with notes of cedar, leather, and subtle sweetness. Hand-rolled in Havana using the finest tobacco leaves.',
    strength: 'Full',
    size: 'Robusto',
    origin: 'Cuba',
    price: 185.00,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1528659578160-fdd34111957d?w=400',
    ],
  },
  {
    name: 'Montecristo No. 2',
    brand: 'Montecristo',
    description: 'A classic torpedo-shaped cigar with medium to full body. Features creamy notes of coffee, cocoa, and toasted almonds. Perfect for special occasions.',
    strength: 'Medium',
    size: 'Torpedo',
    origin: 'Cuba',
    price: 165.00,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1594285889613-8a478b0eb1a9?w=400',
    ],
  },
  {
    name: 'Romeo y Julieta Churchill',
    brand: 'Romeo y Julieta',
    description: 'Named after Winston Churchill himself, this elegant cigar delivers a smooth, aromatic smoke with hints of wood, spice, and a touch of sweetness.',
    strength: 'Medium',
    size: 'Churchill',
    origin: 'Cuba',
    price: 150.00,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
  },
  {
    name: 'Partagás Serie D No. 4',
    brand: 'Partagás',
    description: 'A robust robusto with intense flavors of dark chocolate, espresso, and earthy undertones. A favorite among experienced cigar enthusiasts.',
    strength: 'Full',
    size: 'Robusto',
    origin: 'Cuba',
    price: 145.00,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400',
    ],
  },
  {
    name: 'H. Upmann Magnum 46',
    brand: 'H. Upmann',
    description: 'An elegant cigar with a refined character. Smooth and creamy with notes of cedar, vanilla, and a hint of citrus. Perfect for afternoon smoking.',
    strength: 'Mild',
    size: 'Corona Gorda',
    origin: 'Cuba',
    price: 135.00,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1528659578160-fdd34111957d?w=400',
    ],
  },

  // Dominican Cigars
  {
    name: 'Arturo Fuente Hemingway',
    brand: 'Arturo Fuente',
    description: 'A premium Dominican cigar with a unique perfecto shape. Delivers complex flavors of cedar, nuts, and subtle spice with a smooth finish.',
    strength: 'Medium',
    size: 'Perfecto',
    origin: 'Dominican Republic',
    price: 125.00,
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1594285889613-8a478b0eb1a9?w=400',
    ],
  },
  {
    name: 'Davidoff Grand Cru',
    brand: 'Davidoff',
    description: 'The epitome of luxury and refinement. Elegant, smooth, and sophisticated with notes of cream, white pepper, and toasted bread.',
    strength: 'Mild',
    size: 'Corona',
    origin: 'Dominican Republic',
    price: 220.00,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
  },
  {
    name: 'Ashton Classic Corona',
    brand: 'Ashton',
    description: 'A Connecticut shade wrapped masterpiece with a silky smooth character. Features creamy, nutty flavors with hints of cedar and a clean finish.',
    strength: 'Mild',
    size: 'Corona',
    origin: 'Dominican Republic',
    price: 95.00,
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400',
    ],
  },

  // Nicaraguan Cigars
  {
    name: 'Padrón 1964 Anniversary',
    brand: 'Padrón',
    description: 'A box-pressed masterpiece with rich, complex flavors. Notes of chocolate, coffee, earth, and a long, satisfying finish. Highly acclaimed.',
    strength: 'Full',
    size: 'Torpedo',
    origin: 'Nicaragua',
    price: 195.00,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1528659578160-fdd34111957d?w=400',
    ],
  },
  {
    name: 'Oliva Serie V Melanio',
    brand: 'Oliva',
    description: 'A bold Nicaraguan puro with Ecuadorian Sumatra wrapper. Features rich flavors of espresso, dark chocolate, and pepper with excellent balance.',
    strength: 'Full',
    size: 'Figurado',
    origin: 'Nicaragua',
    price: 110.00,
    stock: 65,
    images: [
      'https://images.unsplash.com/photo-1594285889613-8a478b0eb1a9?w=400',
    ],
  },
  {
    name: 'Drew Estate Liga Privada No. 9',
    brand: 'Drew Estate',
    description: 'A boutique cigar with a Connecticut Broadleaf maduro wrapper. Intense flavors of dark chocolate, espresso, and sweet spice.',
    strength: 'Full',
    size: 'Robusto',
    origin: 'Nicaragua',
    price: 130.00,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
  },

  // Premium Selection
  {
    name: 'My Father Le Bijou 1922',
    brand: 'My Father',
    description: 'A Nicaraguan gem with Habano Oscuro wrapper. Bold and complex with notes of pepper, cocoa, coffee, and a long, satisfying finish.',
    strength: 'Full',
    size: 'Torpedo',
    origin: 'Nicaragua',
    price: 115.00,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400',
    ],
  },
  {
    name: 'Rocky Patel Vintage 1990',
    brand: 'Rocky Patel',
    description: 'A sophisticated cigar with Broadleaf Maduro wrapper. Smooth and rich with flavors of chocolate, coffee, and subtle sweetness.',
    strength: 'Medium',
    size: 'Robusto',
    origin: 'Honduras',
    price: 85.00,
    stock: 70,
    images: [
      'https://images.unsplash.com/photo-1528659578160-fdd34111957d?w=400',
    ],
  },
  {
    name: 'Perdomo Reserve Champagne',
    brand: 'Perdomo',
    description: 'A smooth and creamy Connecticut-wrapped cigar with delicate flavors of cream, nuts, and light cedar. Perfect for beginners and veterans alike.',
    strength: 'Mild',
    size: 'Robusto',
    origin: 'Nicaragua',
    price: 75.00,
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1594285889613-8a478b0eb1a9?w=400',
    ],
  },
  {
    name: 'Alec Bradley Prensado',
    brand: 'Alec Bradley',
    description: 'A box-pressed Honduran cigar with rich, full-bodied character. Notes of cocoa, espresso, leather, and a peppery finish.',
    strength: 'Full',
    size: 'Corona',
    origin: 'Honduras',
    price: 100.00,
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Add slugs to products (insertMany doesn't trigger pre-save hooks)
    const productsWithSlugs = mockProducts.map(product => ({
      ...product,
      slug: `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Insert mock products
    const products = await Product.insertMany(productsWithSlugs);
    console.log(`✅ Inserted ${products.length} products`);

    console.log('\n📦 Mock Products Seeded Successfully!');
    console.log('=====================================');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - GHS ${product.price.toFixed(2)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
