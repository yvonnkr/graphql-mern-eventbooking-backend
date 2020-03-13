const express = require('express');

const app = express();

//--alternative to using bodyParser --no need to install bodyParser express covers it
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server up on port ${PORT}`);
});
