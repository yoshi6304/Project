const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 8000;

// MongoDB Atlas connection URL
const mongoURI = 'mongodb+srv://HITMAN:HITMAN2025@cluster0.mo4bh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => console.error(err));

// Define schemas and models
const fileSchema = mongoose.Schema({
  name: String,
  filename: String,
  data: Buffer,
  contentType: String,
  sem: Number,
  branch: String,
  regulation: String
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const File = mongoose.model('File', fileSchema);
const User = mongoose.model('User', userSchema);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes for file management
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login_page.html'));
});

app.get('/file-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'file-management.html'));
});

app.get('/regulations',async(req,res) =>
{
  res.sendFile(path.join(__dirname,'regulations.html'));
});

app.get('/branch', async (req, res) => {
  res.sendFile(path.join(__dirname, 'branch.html'));
});

app.get('/regulations/:regulation/branch/:branch', async (req, res) => {
  const regulation = req.params.regulation;
  const branch = req.params.branch;
  res.sendFile(path.join(__dirname, 'semesters.html'));
});

app.get('/regulations/:regulation',async(req,res)=>
{
  res.sendFile(path.join(__dirname,'branch.html'))
  res.sendStatus
});

app.get('/semesters', async (req, res) => {
  res.sendFile(path.join(__dirname, 'semesters.html'));
});

// Route to serve branches based on regulation
app.get('/:regulation/branch', async (req, res) => {
  res.sendFile(path.join(__dirname, 'branch.html'));
});

// Route to serve semesters based on regulation and branch
app.get('/:regulation/branch/:branch', async (req, res) => {
  res.sendFile(path.join(__dirname, 'semesters.html'));
});

// Route to serve files based on regulation, branch, and semester
app.get('/:regulation/branch/:branch/sem/:sem', async (req, res) => {
  const regulation = req.params.regulation;
  const branch = req.params.branch;
  const sem = req.params.sem;

  try {
    const files = await File.find({ regulation: regulation, sem: sem, branch: branch }, 'filename _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Files for Regulation ${regulation}, Branch ${branch}, and Semester ${sem}</title>
        <style>
          body { color: red; }
          table { width: 100%; border-collapse: collapse; }
          table, th, td { border: 1px solid black; }
          th, td { padding: 10px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Files for Regulation ${regulation}, Branch ${branch}, and Semester ${sem}</h1>
        <table>
          <tr>
            <th>File Name</th>
            <th>Action</th>
          </tr>
    `;

    files.forEach(file => {
      fileListHTML += `
        <tr>
          <td>${file.filename}</td>
          <td><a href="/view-file/${file._id}">View</a></td>
        </tr>
      `;
    });

    fileListHTML += `
        </table>
      </body>
      </html>
    `;

    res.send(fileListHTML);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/regulation/:/regulation/branch/sem/:sem', async (req, res) => {
  const sem = req.params.sem;
  const branch = req.params.branch;
  const regulation = req.params.regulation;
  try {
    // Modify the query to include both semester and branch conditions
    const files = await File.find({ regulations: regulation ,sem: sem, branch: branch }, 'filename _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Files for Branch ${branch} and Semester ${sem}</title>
        <style>
          body {
            color: red;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>Files for Branch ${branch} and Semester ${sem}</h1>
        <table>
          <tr>
            <th>File Name</th>
            <th>Action</th>
          </tr>
    `;

    files.forEach(file => {
      fileListHTML += `
        <tr>
          <td>${file.filename}</td>
          <td><a href="/view-file/${file._id}">View</a></td>
        </tr>
      `;
    });

    fileListHTML += `
        </table>
      </body>
      </html>
    `;

    res.send(fileListHTML);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/sem/:sem', async (req, res) => {
  const sem = req.params.sem;
  const branch = req.query.branch; // Capture the branch from query parameters
  try {
    // Modify the query to include both semester and branch conditions
    const files = await File.find({ sem: sem, branch: branch }, 'name _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Files for Branch ${branch} and Semester ${sem}</title>
        <style>
        body {
          color: red;
        }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>Files for Branch ${branch} and Semester ${sem}</h1>
        <table>
          <tr>
            <th>File Name</th>
            <th>Action</th>
          </tr>
    `;

    files.forEach(file => {
      fileListHTML += `
        <tr>
          <td>${file.name}</td>
          <td><a href="/view-file/${file._id}">View</a></td>
        </tr>
      `;
    });

    fileListHTML += `
        </table>
      </body>
      </html>
    `;

    res.send(fileListHTML);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const sem = req.body.sem;
  const branch = req.body.branch;
  const regulation = req.body.regulation;
  const filename = req.body.filename;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const newFile = new File({
    name: file.originalname,
    filename: filename,
    data: file.buffer,
    contentType: file.mimetype,
    sem: sem,
    branch: branch,
    regulation: regulation
  });

  newFile.save()
    .then(savedFile => res.send(`File uploaded and inserted successfully! File ID: ${savedFile._id}`))
    .catch(err => {
      console.error('Error saving file:', err);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/view-file/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send('File not found');
    }
    res.contentType(file.contentType);
    res.send(file.data);
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a file by ID
app.delete('/delete-file/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).send('File not found');
    }
    res.status(200).send('File deleted successfully');
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/files', async (req, res) => {
  try {
    const files = await File.find({}, 'filename _id');
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Routes for user management and authentication
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login_page.html'));
});

app.post('/submit', (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password });
  newUser.save()
    .then(() => {
      res.status(200).send(`Username: ${username}, Password: ${password} saved successfully`);
    })
    .catch(err => {
      res.status(500).send('Error saving user data');
    });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username, password })
    .then(user => {
      if (user) {
        if (username === 'vijay') {
          res.redirect('/file-management'); 
        } else {
          res.redirect('/regulations');
        }
      } else {
        res.status(401).send(`
          <html>
            <head><title>Login Status</title></head>
            <body>
              <h1>Invalid username or password</h1>
            </body>
          </html>
        `);
      }
    })
    .catch(err => {
      res.status(500).send('Error logging in');
    });
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
