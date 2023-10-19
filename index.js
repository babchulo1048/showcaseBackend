const express = require("express");
const mongoose = require("mongoose");
const { AdminRouter } = require("./router/admin");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/admin", AdminRouter);
mongoose
  .connect(
    // "mongodb://127.0.0.1:27017/showcase",
    // "mongodb+srv://yadaeyu23:yada23eyu1048@products.zin701o.mongodb.net/products?retryWrites=true&w=majority",
    "mongodb+srv://eyoeldemis3:github1bab2eyu@cluster0.zswwugc.mongodb.net/Showcase-Products?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    // "mongodb://127.0.0.1:27017/showcase"
  )
  .then(() => console.log("mongodb connected"))
  .catch((ex) => console.error(ex));

app.listen(3001, () => {
  console.log("server listening to port 3001");
});
