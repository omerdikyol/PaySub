import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  id: string;
  name: string;
  logo: string;
  defaultPrice?: number;
  defaultCurrency?: string;
  category: string;
}

export interface IServiceCategory extends Document {
  id: string;
  name: string;
  services: mongoose.Types.ObjectId[];
}

const ServiceSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  defaultPrice: Number,
  defaultCurrency: String,
  category: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const ServiceCategorySchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
  }],
}, {
  timestamps: true,
});

// Indexes
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ name: 'text' });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
export const ServiceCategory = mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema); 