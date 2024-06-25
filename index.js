const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const groupRoutes = require('./routes/groupRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const  errorHandler  = require('./middleware/errorHandler.js');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const User = require('./models/User.js');

const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require('cookie-parser');
const ejsMate = require("ejs-mate");
const Group = require("./models/Group.js");
const jwtAuthMiddleware = require('./middleware/jwtAuth.js');
const attachCurrentUser = require('./middleware/attachCurrentUser.js')
const jwt = require('jsonwebtoken');

// Apply this middleware globally or to specific routes

dotenv.config();

connectDB();

const app = express();
// app.use(authMiddleware);
app.use(jwtAuthMiddleware);
app.use(attachCurrentUser);
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For storing sessions in MongoDB


app.use(errorHandler);
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // Use MongoDB to store sessions
}));


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Token in Socket.io:", token);
  if (token) {
      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.user = decoded.id;
          next();
      } catch (err) {
          console.error('Invalid token:', err);
          next(new Error('Authentication error'));
      }
  } else {
      console.error('No token provided');
      next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
 
socket.on('joinGroup', async (groupId) => {
  socket.join(groupId);
  socket.groupId = groupId;
  await User.findByIdAndUpdate(socket.user, { onlineStatus: true });
 
  const group = await outputUsers(groupId);

  io.to(groupId).emit('groupUser',{
    group: group,
  });
});

socket.on('leaveGroup', async (groupId) => {
  socket.leave(groupId);
  await User.findByIdAndUpdate(socket.user, { onlineStatus: false });
  
});


  socket.on('sendMessage', async ({ groupId, content }) => {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Sender or group not found' });
        }
        // Create the message object
        const message = {
            content,
            sender: socket.user,
            createdAt: new Date(),
        };
        // Push the message to the group's messages array
        group.messages.push(message);
        console.log(group);
        // Save the updated group document
        await group.save();
        const user = await User.findById(message.sender);
        
    io.to(groupId).emit('newMessage', {
    content: message.content,
    sender: user.username, // Assuming sender is populated with username
    createdAt: message.createdAt,
});
  });

  socket.on('disconnect', async () => {
    if (!socket.user) {
        return; 
    }
    try {
        // Update user's online status to false
        await User.findByIdAndUpdate(socket.user, { onlineStatus: false });

        // Remove user from group members array
        await Group.findByIdAndUpdate(socket.groupId, {
            $pull: { members: socket.user }
        });

        console.log(`User ${socket.user} left the group ${socket.groupId}.`);
        // Emit updated group details to clients
        const updatedGroup = await outputUsers(socket.groupId);
        console.log("Line146",updatedGroup);
        io.to(socket.groupId).emit('groupUser', { group: updatedGroup });

    } catch (error) {
        console.error('Error handling disconnect:', error);
    }
});
});


app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.get('/',jwtAuthMiddleware,attachCurrentUser,async (req,res)=>{

    const groups = await Group.find();
   const  currentUser=res.locals.currentUser;
   
    res.render('index', { groups,  currentUser});
    
})


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.all("*", (req, res, next) => {
  next(new ExError(404, "Page Not Found !!!"));
});

// Wrong Data Insert Error Handling Middle Ware ↓
app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Something Went Wrong..."} = err;
  res.status(statusCode).render("error.ejs", { message });
});


async function outputUsers(group) {
  try {
      const populatedGroup = await Group.findById(group).populate('members');
      if (!populatedGroup) {
          console.error('Group not found');
          return;
      }
     return populatedGroup;
  } catch (err) {
      console.error('Error fetching group users:', err);
  }
}