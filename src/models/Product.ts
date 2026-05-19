import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  brand: string;
  strength: 'Mild' | 'Medium' | 'Full';
  size?: 'Robusto' | 'Corona' | 'Toro' | 'Churchill' | 'Panatela' | 'Gordo';
  origin?: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  category?: string;
  isActive: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      index: true,
    },
    strength: {
      type: String,
      enum: ['Mild', 'Medium', 'Full'],
      required: [true, 'Strength is required'],
    },
    size: {
      type: String,
      enum: ['Robusto', 'Corona', 'Toro', 'Churchill', 'Panatela', 'Gordo', 'Torpedo', 'Perfecto', 'Figurado', 'Petit Corona', 'Lonsdale', 'Corona Gorda'],
    },
    origin: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Index for search and filter
ProductSchema.index({ brand: 1, strength: 1, price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
