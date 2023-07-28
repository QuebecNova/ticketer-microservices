import mongoose from "mongoose";
import { Password } from "../helpers/password";

interface UserAttrs {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build: (attrs: UserAttrs) => UserDoc
}

interface UserDoc extends mongoose.Document {
    email: string,
    password: string,
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "User must have a email"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "lead-guide", "guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
    min: 8,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.password
      delete ret.__v
    }
  }
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);