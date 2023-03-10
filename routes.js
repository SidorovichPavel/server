const mysql = require('mysql')
var pool = mysql.createPool({
  connectionLimit: 20,
  host: 'localhost',
  user: 'root',
  password: 'rayes2070DEF',
  database: 'lab1db',
  debug: false
});

function executeQuerySelect(query, args) {
  return new Promise((resolve, reject) => {
    pool.query(query, args, (error, rows, fields) => {
      if (error)
        return reject(error);
      return resolve(rows);
    });
  });
}

function executeQueryInsert(query, args) {
  return new Promise((resolve, reject) => {
    pool.query(query, args, (error, result) => {
      if (error)
        return reject(error);
      return resolve(result.insertID);
    });
  });
}

const express = require('express');
const router = express.Router()
const urlencodedParser = express.urlencoded({ extended: false });
const url = require('url');
const fileUpload = require('express-fileupload');
router.use(fileUpload());

const fs = require('fs');

router.get('/', async (req, res) => {
  try {
    var query_data = await executeQuerySelect('SELECT * FROM Tasks', []);
    res.render('index', { trows: query_data });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

});

router.post('/add/', urlencodedParser, async (req, res) => {
  if (!req.body) return res.sendStatus(400);

  try {
    var query_data = await executeQueryInsert('INSERT INTO Tasks (Description) VALUES (?)', [req.body.Description]);

    res.redirect(url.format({ pathname: '/' }));
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

});

router.post('/upload/:id', async (req, res) => {
  const id = req.params.id;
  if (!req.params.id) return res.sendStatus(400);

  var query_data;
  try {
    query_data = await executeQuerySelect('SELECT * FROM Tasks WHERE id = ?', [id]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }

  if (!query_data) {
    console.log('query is empty');
    res.sendStatus(400);
    return;
  }

  if (query_data[0].FileName) {
    try {
      await fs.unlink(__dirname + '/uploads/' + query_data[0].FileName, error=>{ if (error) console.log(error); });
      console.log('successfully deleted: ' + __dirname + '/uploads/' + query_data[0].FileName);
    } catch (error) {
      console.error('there was an error:', error.message);
    }
  }

  if (req.files && Object.keys(req.files).length !== 0) {
    const uploadedFile = req.files.uploadFile;

    console.log('Upload file: ', uploadedFile);
    pool.query('UPDATE Tasks SET FileName = ? WHERE id = ?', [uploadedFile.name, id]);

    const uploadPath = __dirname + '/uploads/' + uploadedFile.name;

    uploadedFile.mv(uploadPath);
  }
  res.redirect(url.format({ pathname: '/' }));
})

router.get('/download/:fileName', (req, res) => {
  console.log('Download request. File: ', req.params.fileName);

  if (req.params.fileName) {
    res.download(__dirname + '/uploads/' + req.params.fileName, error => {
      if (error) console.log(error);
    });
  }

});

router.get('/download/', (req, res) => {
  res.redirect(url.format({ pathname: '/' }));
});

router.post('/remove/:id', async (req, res) => {
  const id = req.params.id;
  if (!req.params.id) return res.sendStatus(400);

  try {
    query_data = await executeQuerySelect('SELECT * FROM Tasks WHERE id = ?', [id]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }

  if (!query_data) {
    console.log('query is empty');
    res.sendStatus(400);
    return;
  }

  if (query_data[0].FileName) {
    try {
      await fs.unlink(__dirname + '/uploads/' + query_data[0].FileName, error=>{ if (error) console.log(error); });
      console.log('successfully deleted: ' + __dirname + '/uploads/' + query_data[0].FileName);
    } catch (error) {
      console.error('there was an error:', error.message);
    }
  }

  try {
    pool.query('DELETE FROM Tasks WHERE id = ?', [id]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

  res.redirect(url.format({ pathname: '/' }));
})

module.exports = router