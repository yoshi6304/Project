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
  data: Buffer,
  contentType: String,
  sem: Number
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

app.get('/semesters',async(req,res)=>
{
  res.sendFile(path.join(__dirname,'practice.html'));
})
app.get('/sem/:sem', async (req, res) => {
  const sem = req.params.sem;
  try {
    const files = await File.find({ sem: sem }, 'name _id');
    let fileListHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Semester ${sem} Files</title>
        <style>
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
        <h1>Files for Semester ${sem}</h1>
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
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const newFile = new File({
    name: file.originalname,
    data: file.buffer,
    contentType: file.mimetype,
    sem: sem
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

app.get('/files', async (req, res) => {
  try {
    const files = await File.find({}, 'name _id');
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
          res.redirect('/file-management'); // Redirect to file management page if the username is vijay
        } else {
          res.redirect('/semesters'); // Redirect to welcome page for other users
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

app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'welcome.html'));
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
