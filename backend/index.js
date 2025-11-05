const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
// const {authRouter} = require("./routes/auth")
const {userRouter} = require("./routes/user")
const {adminRouter} = require("./routes/admin")
// const {announcementRouter} = require("./routes/announcement")
// const {eventRouter} = require("./routes/event")

app.use(express.json());
app.use(cors());


app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
// app.use('/api/announcement', announcementRouter);
// app.use('/api/event', eventRouter);
// app.use('/api/auth', authRouter);


app.get('/', (req, res) => {
  res.send('Hello World!');
});


async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected successfully!');
    
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

main();