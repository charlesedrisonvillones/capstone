import express from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './pool.js';
import bcrypt from 'bcryptjs';
import { generateJWT } from './jwtGenerator.js';
import { auth } from './middlewares/auth.js';

const app = express()
const pool = connectDatabase()
const PORT = 9000



app.use(bodyParser.json())


app.get("/owners", async (req, res) => {
    try {
        const owners = await pool.query(`SELECT * FROM owners`)

        res.json(owners.rows)

    } catch (error) {
        console.log("something wrong")
    }
})

app.post("/owners", async (req,res) => {
    try {

        const { name, email } = req.body
        const newOwner = await pool.query(
        `INSERT INTO owners (name, email) VALUES ('${name}', '${email}')
        RETURNING *`
        )

        res.json(newOwner.rows)

    } catch (error) {
        console.log(error)
    }
})

//* LOGIN SESSIONS
// AUTHENTICATION ROUTES

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      `SELECT * FROM owners WHERE username = '${username}'`
    );

    if (user.rows.length <= 0) {
      res.status(401).send('Username or password is wrong');
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      res.status(401).send('Username or password is wrong');
    }
    const token = generateJWT(user.rows[0]);

    res.json({ token });
  } catch (error) {
    console.log(error);
  }
});

app.post('/register', async (req, res) => {
  try {
    const {

      fullname,
      email,
      password,
      username,
     
    } = req.body;

    const user = await pool.query(
      `SELECT * FROM owners WHERE username = '${username}'`
    );

    if (user.rows.length > 0) {
      res.status(401).send('User already exist');
    }

    // bcrypt
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);

    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO owners(fullname, email, password, username) VALUES ('${fullname}', '${email}', '${bcryptPassword}', '${username}') RETURNING *`
    );

    const token = generateJWT(newUser.rows[0]);

    res.json({ token });
  } catch (error) {
    console.log(error);
  }
});

app.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log(err);
  }
})

pool.connect((err) => {
    if (err) {
      console.log(err.message);
    }
    {
      app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
      });
    }
  });