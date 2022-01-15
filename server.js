const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    // Enter database information
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'amirz1311',
        password : 'S@m12345',
        database : 'smartbrain'
    }
})

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
   db.select('email', 'hash').from('login')
     .where('email', '=', req.body.email)
     .then(data => {
         const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
         if (isValid) {
             return db.select('*').from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('User not found'))
         } else {
             res.status(400).json('Wrong Credentials')
         }
     })
     .catch(err => res.status(400).json('Wrong Credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body
    const hash = bcrypt.hashSync(password);
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('Unable to Register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
      .then(user => {
          if (user.length) {
              res.json(user[0])
          } else {
              res.status(400).json('Not Found')
          }
      })
      .catch(err => res.status(400).json('Error getting user'))
})

app.post('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(3000, () => {
    console.log('Application running on port 3000');
})
