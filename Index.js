const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const ConnectDB = require('./Connection/Connect.js');
const Users = require('./Routes/User.js');
const CreateUser = require('./Routes/UserCreate');
const UploadItem = require('./Routes/Upload');
const Getall = require('./Routes/Getall');
const GetSchoolByname = require('./Routes/GetbyName');
const AddSchool = require('./Routes/Addschool');
const AllSchools = require('./Routes/Allschools');
const AuthRoute = require('./Routes/authRoutes');
const GetUserbyId = require('./Routes/UserByid');
const SchoolbyId = require('./Routes/Schoolbyid');
const ProductById = require('./Routes/ProductById');
const messageRoutes = require('./Routes/MessagesRoutes');
const MessagesForProduct = require('./Routes/Conversation.js');
const CommentSection = require('./Routes/Comment.js');
const ProductByUserId = require('./Routes/ProductByUserId.js');
const { ProfilePic, User } = require('./Schema/Schema'); // Import ProfilePic and User models
const CommentEnable = require('./Routes/CommentEnable.js');
const Instock = require('./Routes/InStock.js');
const ProfileUpload = require('./Main/Upload.js');
const DeleteProduct = require('./Routes/DelectProduct.js');
const BioUpdate = require('./Routes/Bio.js');
const views = require('./Routes/Views.js');
const Rating = require('./Routes/rating.js');
const PassReset = require('./Routes/PassReset.js');
const Contact = require('./Routes/Contact.js')
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Profile bio update route
const { Profile } = require('./Schema/Schema.js');
app.put('/api/bio/profile/:id/update-bio', async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: id },
      { bio },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect to the database
ConnectDB();

// Use routes
app.use('/api', CreateUser);
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
app.use('/api', views);
app.use('/api', Rating);
app.use('/api', PassReset);
app.use('/api', Contact);

// Serve the React app for all other routes
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
