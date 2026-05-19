import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  phone: string;
  email?: string;
  password: string;
  role: 'customer' | 'admin';
  name?: string;
  addresses: Array<{
    label?: string;
    street?: string;
    city?: string;
    region?: string;
    gpsAddress?: string;
  }>;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^\+233\d{9}$/, 'Please provide a valid Ghana phone number (+233XXXXXXXXX)'],
    },
    email: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    name: {
      type: String,
    },
    addresses: [
      {
        label: String,
        street: String,
        city: String,
        region: String,
        gpsAddress: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
