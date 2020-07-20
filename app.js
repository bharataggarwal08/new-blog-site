var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  methodOverride = require('method-override'),
  expressSanitizer = require('express-sanitizer'),
  env = require('dotenv').config()
// PORT = process.env.PORT || 3000
const db =
  'mongodb+srv://' +
  process.env.DB_USER +
  ':' +
  process.env.DB_PASS +
  // '@cluster0.gcotx.mongodb.net/test_DB?retryWrites=true&w=majority'
  '@cluster0.gcotx.mongodb.net/' +
  process.env.DB_NAME +
  '?retryWrites=true&w=majority'

mongoose
  .connect(
    db,
    // 'mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gcotx.mongodb.net/test_DB?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('Error while Connecting to DB: ' + err))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(expressSanitizer())

// CREATING SCHEMA FOR BLOG POST (MONGOOSE/MODEL)
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now },
})

var blog = mongoose.model('blog', blogSchema)

// blog.create({
//   title: 'test',
//   image:
//     'https://media.gettyimages.com/photos/woman-lifts-her-arms-in-victory-mount-everest-national-park-picture-id507910624?s=612x612',
//   body: 'this is a test image',
// })

app.get('/', (req, res) => {
  res.redirect('/blogs')
})

// INDEX ROUTE
app.get('/blogs', (req, res) => {
  blog.find({}, (err, blogs) => {
    if (err) {
      console.log('ERROR')
    } else {
      res.render('index', { blogs: blogs })
    }
  })
})

// NEW ROUTE
app.get('/blogs/new', (req, res) => {
  res.render('new')
})

// CREATE ROUTE
app.post('/blogs', (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body)
  blog.create(req.body.blog, (err, newBlog) => {
    if (err) {
      res.render('new')
    } else {
      res.redirect('/blogs')
    }
  })
})

// SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
  blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs')
    } else {
      res.render('show', { blog: foundBlog })
    }
  })
})

// EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
  blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs')
    } else {
      res.render('edit', { blog: foundBlog })
    }
  })
})

// UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
  req.body.uBlog.body = req.sanitize(req.body.uBlog.body)
  blog.findByIdAndUpdate(
    req.params.id,
    req.body.uBlog,
    { useFindAndModify: false },
    (err, updateBlog) => {
      if (err) {
        res.redirect('/blogs')
      } else {
        res.redirect('/blogs/' + req.params.id)
      }
    },
  )
})

// DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
  blog.findByIdAndDelete(req.params.id, { useFindAndModify: false }, (err) => {
    if (err) {
      res.redirect('/blogs')
    } else {
      res.redirect('/blogs')
    }
  })
})

// ABOUT PAGE
app.get('/about', (req, res) => {
  res.render('about')
})

app.listen(process.env.PORT, () => {
  console.log('Server is running.' + process.env.PORT)
})
