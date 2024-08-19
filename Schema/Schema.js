const mongoose = require('mongoose');
const { Schema } = mongoose;

// School Schema
const schoolSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Profile Schema
const profileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  school: { type: Schema.Types.ObjectId, ref: 'School' },
}, { timestamps: true });
// User Schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}, { timestamps: true });

// Product Schema
const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  filePath: {
    type: String,
    default: null
  },
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  phoneNumber: {
    type: String, // Assuming the phone number will be stored as a string
    default: null 
  }
}, { timestamps: true });

// Message Schema
const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Conversation'
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Conversation Schema
const conversationSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Comment Schema
const commentSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  isSeller: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Export Models
module.exports = {
  User: mongoose.model('User', userSchema),
  School: mongoose.model('School', schoolSchema),
  Product: mongoose.model('Product', productSchema),
  Message: mongoose.model('Message', messageSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Comment: mongoose.model('Comment', commentSchema),
  Profile: mongoose.model('Profile', profileSchema)
};
