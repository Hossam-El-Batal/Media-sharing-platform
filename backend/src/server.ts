import express from 'express'
import pool from './utils/db_connect'
import exp from 'constants'


const app = express()
const PORT = process.env.PORT

app.use(express.json())

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