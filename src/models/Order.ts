import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  guestPhone?: string;
  guestEmail?: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment: {
    method: 'momo';
    provider?: string;
    reference?: string;
    status: 'pending' | 'success' | 'failed';
    paidAt?: Date;
  };
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    region: string;
    gpsAddress?: string;
  };
  isAgeVerified: boolean;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestPhone: {
      type: String,
    },
    guestEmail: {
      type: String,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: [true, 'Order total is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    payment: {
      method: {
        type: String,
        enum: ['momo'],
        default: 'momo',
      },
      provider: {
        type: String,
        enum: ['mtn', 'vodafone', 'airteltigo'],
      },
      reference: {
        type: String,
      },
      status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
      },
      paidAt: {
        type: Date,
      },
    },
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
        match: [/^\+233\d{9}$/, 'Please provide a valid Ghana phone number'],
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      region: {
        type: String,
        required: true,
      },
      gpsAddress: {
        type: String,
      },
    },
    isAgeVerified: {
      type: Boolean,
      required: [true, 'Age verification is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying orders
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'payment.reference': 1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
