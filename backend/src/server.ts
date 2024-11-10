import express from 'express'
import pool from './utils/db_connect'
import exp from 'constants'
const path = require("path");
const process = require("process");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express()
const PORT = process.env.PORT
app.use(express.json())
app.use(cookieParser());

//import routes 
import authRoutes from "./routes/AuthRoute";
import mediaRoutes from "./routes/MediaRoute"
const likesRoutes = require('./routes/LikesRoute');

app.use(
    cors({
    origin: [
        "http://localhost:5173", 
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow cookies or authentication headers
    })
);

app.use("/api", authRoutes);
app.use("/api",mediaRoutes)
app.use('/api', likesRoutes);




// start server 
const startServer = async () =>{
    try{
        await pool.query('SELECT NOW()');
        console.log('connected to database')
        app.listen(PORT,()=>{
            console.log(`server is running on ${PORT}`)
        })
    }
    catch (err) {
        console.error('Error connecting to database', err)
    }
}
startServer()