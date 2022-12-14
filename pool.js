import pg from 'pg';

const connectDatabase = () => {
  return new pg.Pool({
    user: 'postgres',
    password: 'Mariagianne0420',
    database: 'capstone',
    host: 'localhost',
  });
};

export { connectDatabase };