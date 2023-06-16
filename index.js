import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const app = express();
const port = 5001;

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const db = new sqlite3.Database('web_eng.db');

function createUsersTable() {
    db.serialize(function () {
        db.run(`CREATE TABLE IF NOT EXISTS userTable(
            userID INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS userTable (
            userId INTEGER PRIMARY KEY AUTOINCREMENT,
            user VARCHAR(45) NOT NULL,
            password VARCHAR(100) NOT NULL
          );`)
    })
    db.close();
}

createUsersTable();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


//get routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/content', (req, res) => {
    res.render('content');
})

//post routes
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM userTable WHERE username = ?`, [username], (err, results) => {
        console.log("Results: ", results);
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).json({ error: 'An error occurred during login' });
        } else if (results && results.length === 0) {
            console.log('User does not exist');
            res.status(401).json({ error: 'Invalid username or password' });
        } else {
            // User exists, compare the password
            
            const user = results;
            
            if (user && user.password) {
              bcrypt.compare(password, user.password, (error, passwordMatch) => {
                if (error) {
                  console.log('Error comparing passwords:', error);
                  res.status(500).json({ error: 'An error occurred during login' });
                } else if (passwordMatch) {
                  res.status(200).json({ message: 'Login successful' });
                } else {
                  console.log('Invalid password');
                  res.status(401).json({ error: 'Invalid username or password' });
                }
              });
            } else {
              console.log('User or password is undefined');
              res.status(401).json({ error: 'Invalid username or password' });
            }
        }
    })
})


 app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const passwordRepeat = req.body.passwordRepeat;


    if (password === passwordRepeat) {
      const db = new sqlite3.Database('web_eng.db');
  
      db.get("SELECT * FROM userTable WHERE username = ?", [username], async (err, row) => {
        if (err) throw err;
  
        if (row) {
          console.log("------> User already exists");
          res.render('register', { error: "User already exists" });
        } else {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const sqlInsert = "INSERT INTO userTable (username, password) VALUES (?, ?)";
  
            db.run(sqlInsert, [username, hashedPassword], (err) => {
              if (err) throw err;
              console.log("--------> Created new User");
              res.redirect('content');
            });
          } catch (error) {
            console.log("Error occurred during password hashing:", error);
            res.render('register', { error: "Error occurred during password hashing" });
          }
        }
  
        db.close();
      });
    } else {
      console.log("The passwords do not match");
      res.status(401).json({ error: 'The passwords do not match'});
    }
  }); 
  



app.post("/createTheme", (req, res) => {
  const sql = "INSERT INTO contentTable (kuerzel, thema, text) VALUES (?, ?, ?)";
  const values = [req.body.kuerzel, req.body.thema, req.body.text];

  db.run(sql, values, function (err) {
    if (err) {
      console.error(err);
      res.status(500).send("Error creating theme");
    } else {
      console.log("RESULTS:", this.lastID);
      const sqlQuery = "SELECT * FROM contentTable";
      db.all(sqlQuery, (err, result) => {
        if (err) throw err;
        console.log("------> Search Results");
        console.log(result);
        res.render('content', { username: "Diana", content: result });
      });
    }
  });
});

app.get('/text', function (req, res) {
  const id = req.query.id;
  const sql = 'SELECT text FROM contentTable WHERE themaID = ?';

  db.get(sql, id, function (err, row) {
    if (err) throw err;
    const text = row.text;
    res.json({ text: text });
  });
});

app.post('/updateTable/:id', (req, res) => {
  const id = req.params.id;
  const kuerzel = req.body.kuerzel;
  const thema = req.body.thema;
  const text = req.body.text;

  const sql = 'UPDATE contentTable SET kuerzel = ?, thema = ?, text = ? WHERE themaID = ?';
  db.run(sql, [kuerzel, thema, text, id], function (err) {
    if (err) throw err;
    console.log("IDDDD: " + id, kuerzel, thema, text);
    res.send('Data updated successfully');
  });
});

app.get('/contentTableUpdate/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM contentTable WHERE themaID = ?';

  db.get(sql, id, (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      console.log("RESULTSsssssss");
      console.log(row);
      const id = row.themaID;
      const kuerzel = row.kuerzel;
      const thema = row.thema;
      const text = row.text;
      res.json({ id: id, kuerzel: kuerzel, thema: thema, text: text });
    }
  });
});

app.delete('/contentTable/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM contentTable WHERE themaID = ?';

  db.run(sql, id, function (err) {
    if (err) throw err;
    console.log("Result: " + this.changes);
    res.send('OK');
  });
});

app.get('/getUpdateRow/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM contentTable WHERE themaID = ?';
  
    db.get(sql, id, function (err, row) {
      if (err) throw err;
      console.log("The results: ", row);
      res.json({ result: row });
    });
  
    console.log("The Id of the row is: ", id);
  });
  
  app.post('/updateRow/:id', (req, res) => {
    const id = req.params.id;
    const kuerzel = req.body.kuerzel;
    const thema = req.body.thema;
    const text = req.body.text;
  
    const sql = 'UPDATE contentTable SET kuerzel = ?, thema = ?, text = ? WHERE themaID = ?';
    db.run(sql, [kuerzel, thema, text, id], (err) => {
      if (err) throw err;
      console.log('Row updated successfully');
    });
  });
  


  
  
  
  
  
  
  

  
  