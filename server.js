const express = require('express');
const dbOp = require('./model/posts')
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('API Homepage');
});

// Get all posts - READ (R)
app.get('/posts', async (req, res) => {
  //回應所有post給訪客
  try {
    const dbRes = await dbOp.findManyDocuments({})
    res.json(dbRes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/posts/:id', async (req, res) => {
  //回應特定#id X post給訪客
  try {
    const dbRes = await dbOp.findOneDocument(req.params.id);
    res.json(dbRes);
} catch (error) {
    // Handle any errors that occur during the asynchronous operation
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

//創建新資料 (寫入)
app.post('/posts', async (req, res) => {

  const newPost = {
      "title": req.body.title,
      "views": req.body.views,
      "content": req.body.content
  }

  try {
      const dbRes = await dbOp.createDocument(newPost);
      res.status(201).json(dbRes);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.listen(3001, () => {
  console.log('Server listening on port 3001!');
});