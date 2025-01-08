import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  defaultCurrency: string;
  language: string;
  notificationPreferences: {
    defaultEnabled: boolean;
    defaultDaysInAdvance: number;
    defaultTime: {
      hour: number;
      minute: number;
    };
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  defaultCurrency: {
    type: String,
    required: true,
    default: 'TRY',
  },
  language: {
    type: String,
    required: true,
    default: 'en',
    enum: ['en', 'tr'],
  },
  notificationPreferences: {
    defaultEnabled: {
      type: Boolean,
      default: true,
    },
    defaultDaysInAdvance: {
      type: Number,
      default: 1,
    },
    defaultTime: {
      hour: {
        type: Number,
        default: 12,
      },
      minute: {
        type: Number,
        default: 0,
      },
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 