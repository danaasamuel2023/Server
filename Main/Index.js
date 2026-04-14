require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');

const ConnectDB = require('../Connection/Connect');
const Users = require('../Routes/User.js');
const CreateUser = require('../Routes/UserCreate');
const UploadItem = require('../Routes/Upload');
const Getall = require('../Routes/Getall');
const GetSchoolByname = require('../Routes/GetbyName');
const AddSchool = require('../Routes/Addschool');
const AllSchools = require('../Routes/Allschools');
const AuthRoute = require('../Routes/authRoutes');
const GetUserbyId = require('../Routes/UserByid');
const SchoolbyId = require('../Routes/Schoolbyid');
const ProductById = require('../Routes/ProductById');
const messageRoutes = require('../Routes/MessagesRoutes');
const MessagesForProduct = require('../Routes/Conversation.js');
const CommentSection = require('../Routes/Comment.js');
const ProductByUserId = require('../Routes/ProductByUserId.js');
const CommentEnable = require('../Routes/CommentEnable.js');
const Instock = require('../Routes/InStock.js');
const ProfileUpload = require('./Upload.js');
const DeleteProduct = require('../Routes/DelectProduct.js');
const BioUpdate = require('../Routes/Bio.js');
const views = require('../Routes/Views.js');
const Rating = require('../Routes/rating.js');
const PassReset = require('../Routes/PassReset.js');
const Contact = require('../Routes/Contact.js');
const UserPic = require('../Routes/UserPic.js');

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
  })
);

ConnectDB();

app.use('/api', CreateUser);
app.use('/api', Users);
app.use('/api', UploadItem);
app.use('/api', Getall);
app.use('/api', GetSchoolByname);
app.use('/api', AddSchool);
app.use('/api', AllSchools);
app.use('/api', AuthRoute);
app.use('/api', GetUserbyId);
app.use('/api', SchoolbyId);
app.use('/api', ProductById);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', MessagesForProduct);
app.use('/api/comments', CommentSection);
app.use('/api/products', ProductByUserId);
app.use('/api', CommentEnable);
app.use('/api/product', Instock);
app.use('/apis/profile', ProfileUpload);
app.use('/api/delect', DeleteProduct);
app.use('/api/bio', BioUpdate);
app.use('/api', views);
app.use('/api', Rating);
app.use('/api', PassReset);
app.use('/api', Contact);
app.use('/api', UserPic);

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err && err.message === 'Not allowed by CORS')
    return res.status(403).json({ message: 'CORS blocked' });
  if (err && err.name === 'MulterError')
    return res.status(400).json({ message: err.message });
  if (err && (err.message === 'Invalid file type' || err.message === 'Invalid file extension'))
    return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
