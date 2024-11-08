import pg from "pg"
import dotenv from 'dotenv';

dotenv.config();

const {Client,Pool} = pg

const pool = new Pool ({
    connectionString: process.env.connection_string
})

export default pool