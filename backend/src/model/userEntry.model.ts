import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 100,
    },
  },
  { timestamps: true } 
);

export const User = mongoose.model<IUser>('User', UserSchema);
