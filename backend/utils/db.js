import Pool from 'pg';

const pool = new Pool.Pool({
  user: 'root',
  host: 'localhost',         
  database: 'calendar', 
  password: 'password', 
  port: 5432,                
});

const query = (text, params) => pool.query(text, params)

export { query }