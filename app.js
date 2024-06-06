import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import connectDB from "./config/dbConnection.js"
import userRoutes from "./routes/userRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import tourOperatorRoutes from "./routes/tourOperatorRoutes.js"
import tourAndActivityRoutes from "./routes/tourAndActivityRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import { fileURLToPath } from 'url'
import { dirname, join } from "path";
import Stripe from "stripe"
import { Server } from 'socket.io';
import { createServer } from 'http';

const stripe = new Stripe("sk_test_51PLfemC65sgmj7Mot4O8f4eAXV9TSyKLboHUEsWOejiYSdh2l2ootyy8DQ5m5ZDFuq1dnigb3sCkl3B5gqUwtExn00A42bV8so");
const host = "https://explore-v1-client.vercel.app";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);
dotenv.config()

const app = express()
const server = createServer(app);

// Create a socket.io instance and attach it to the server
// const io = new Server(server);

export const io = new Server(server, {
  cors: {
    origin: host,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const port = process.env.PORT || 5000

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res, next) => 
{
    res.send("Api is Running...!")
})

app.use('/user', userRoutes)
app.use('/touroperator', tourOperatorRoutes)
app.use('/toursandactivities', tourAndActivityRoutes)
app.use('/booking', bookingRoutes)
app.use('/review', reviewRoutes)
app.use('/chat', chatRoutes)
app.use('/', express.static(join(__dirname, 'uploads')))

app.all("*", (req, res) => {
  res.status(405).json({ error: "Method Not Allowed" });
});



// Socket.IO
io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on('sendMessage', (message) => {
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});



server.listen(port, () => console.log(`Server started running on port ${port}`));
