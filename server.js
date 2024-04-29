const express = require('express');
const dbOp = require('./model/posts')
const userOp = require('./model/user')
const app = express();
const bodyParser = require('body-parser')
const {genHashPassword,comparePassword} = require('./helpers/password')
const cors = require('cors')

app.use(bodyParser.json())

let corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST','OPTIONS', 'PUT', 'DELETE','PATCH']
}
app.use(cors(corsOptions))

// Get all posts - READ (R)
app.get('/posts', async (req, res) => {
  //回應所有post給訪客
  try {
    if (req.query.page) {
      const dbRes = await dbOp.findManyDocumentsWithPagination({},
        parseInt(req.query.page),
        parseInt(req.query.limit)
      )
      res.json(dbRes);
    }
    else {
      const dbRes = await dbOp.findManyDocuments({})
      res.json(dbRes);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all posts - READ (R)
app.get('/search', async (req, res) => {
  //回應所有post給訪客
  try {
    const dbRes = await dbOp.searchDocumentByKeyword(req.query.keyword) //search?keyword=關鍵字
    res.json(dbRes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all hot posts
app.get('/posts/hot', async (req, res) => {
  try {
    const dbRes = await dbOp.getHotPosts(30000)
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

// 對特定ID的document更新部份資料
app.patch('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dbRes = await dbOp.updateDocument(id, req.body);
    res.json(dbRes);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 對特定ID的document進行全部資料更新
app.put('/posts/:id', async (req, res) => {

  //檢查遞交上來的欄位資料齊了沒
  function hasAllRequiredFields(reqBody) {
    const requiredFields = ['title', 'content', 'views'];
    return requiredFields.every(field => reqBody.hasOwnProperty(field));
  }

  if (!hasAllRequiredFields(req.body)) {
    return res.status(400).json({ message: '沒有提交必要欄位資料: title, content, or views' });
  }

  //齊了就讓它進行更新
  try {
    const { id } = req.params;

    const dbRes = await dbOp.updateDocument(id, req.body);
    res.json(dbRes);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post by ID
app.delete('/posts/:id', async (req, res) => {
  try {
    const dbRes = await dbOp.deleteDocument(req.params.id)
    res.json(dbRes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//登記用戶
app.post('/register', async (req, res) => {

  const newUser = {
    "username": req.body.username,
    "password": await genHashPassword(req.body.password)
  }

  try {
    const dbRes = await userOp.createDocument(newUser);
    res.status(201).json(dbRes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

//Check user name and password is correct
app.post('/authenticate', async (req, res) => {

  try {
    //1. 讀取用戶輸入的資料
    const { username, password } = req.body;
    
    //2. 去資料庫讀取該用戶的username的那個document
    const user = await userOp.findUserByUsername(username);

    // 如讓username根本不存在的 => 否決
    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    //3. 有該username存在的話，對比password與DB中的password
    const isPasswordValid = await comparePassword(password, user.password);

    // 如讓password對不上的 => 否決
    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    //4 告訴用戶，此為一個合法用戶
    res.json({ isValidUser: true });

  } catch (error) {
    console.log(error);
  }
});

app.get('/', (req, res) => {
  res.send('API Homepage');
});

app.listen(3001, () => {
  console.log('後端Rest API正在3001號port運行中...');
});