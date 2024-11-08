import pool from '../utils/db_connect';

const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating users table');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                profile_pic VARCHAR(255),
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await client.query(`
            ALTER TABLE users 
            ADD CONSTRAINT unique_username UNIQUE (username),
            ADD CONSTRAINT unique_email UNIQUE (email)
        `);
        console.log('Users table created successfully');

        console.log('Creating posts table');
        await client.query(`
            CREATE TABLE IF NOT EXISTS posts (
                post_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(10) NOT NULL,
                url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await client.query(`
            ALTER TABLE posts 
            ADD CONSTRAINT check_post_type CHECK (type IN ('photo', 'video'))
        `);
        console.log('Posts table created successfully');

        console.log('Creating likes table');
        await client.query(`
            CREATE TABLE IF NOT EXISTS likes (
                like_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                post_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
                UNIQUE(user_id, post_id)
            )
        `);
        console.log('Likes table created successfully');

        await client.query('COMMIT');
        console.log('All tables created successfully');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

const dropTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('Dropping tables...');
        
        await client.query('DROP TABLE IF EXISTS likes');
        await client.query('DROP TABLE IF EXISTS posts');
        await client.query('DROP TABLE IF EXISTS users');
        
        await client.query('COMMIT');
        console.log('All tables dropped successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error dropping tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

const migrate = async () => {
    try {
        console.log('Starting migration...');
        await dropTables();
        await createTables();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

if ((require.main as NodeJS.Module)?.filename === __filename) {
    migrate();
}

export { createTables, dropTables };