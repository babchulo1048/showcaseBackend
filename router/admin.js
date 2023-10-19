const mongoose = require("mongoose");
const express = require("express");
const Admin = require("../model/Admin");
const Product = require("../model/Product");
const Favorites = require("../model/Favorite");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
// const { default: Favorite } = require("../../client/src/page/Favorite");

router.use(express.json());

const fileSchema = new mongoose.Schema({
  name: String,
  path: String,
  type: String,
  size: Number,
});

const File = mongoose.model("File", fileSchema);

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    // const encodedFileName = file.originalname.replace(/\s/g, "%20");

    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const fileType = file.mimetype;
    if (allowedTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// create a route for file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // get the uploaded file information
    const { originalname, mimetype, size, path } = req.file;
    // create a new file document and save it to the database

    const newFile = new File({
      name: originalname,
      type: mimetype,
      size: size,
      path: path,
    });
    const result = await newFile.save();
    console.log(result.path);
    // const fileId = result._id;
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// create a route for getting all files from the database
router.get("/files", async (req, res) => {
  try {
    const files = await File.find({});
    res.status(200).send(files);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put("/product/:id/files", async (req, res) => {
  const id = req.params.id;
  const { fileId } = req.body;

  try {
    const product = await Product.findOne({ _id: id });
    if (!product) {
      res.status(404).json({ message: "Product Not Found" });
    }

    product.files.push(fileId);
    await product.save();
    res
      .status(200)
      .json({ message: "product associated with files successfully" });
  } catch (ex) {
    res.status(500).json({ message: "Internal server error" });
  }
});
router.put("/favorite/:id/files", async (req, res) => {
  const id = req.params.id;
  const { fileId } = req.body;

  try {
    const favorite = await Favorites.findOne({ _id: id });
    if (!favorite) {
      res.status(404).json({ message: "favorite Not Found" });
    }

    favorite.files.push(fileId);
    await favorite.save();
    res
      .status(200)
      .json({ message: "favorite associated with files successfully" });
  } catch (ex) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { name, password, companyName } = req.body;
  const admin = await Admin.findOne({ name });

  try {
    if (admin) {
      return res.json({ message: "Admin Already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name,
      password: hashPassword,
      companyName,
    });

    await newAdmin.save();
    res.json({ message: "Admin successfully registered!" });
  } catch (ex) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const admin = await Admin.findOne({ name: name });
    console.log(admin);
    if (!admin) {
      return res.status(404).json({ message: "Admin Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "password is Invalid" });
    }

    // const token = jwt.sign({ id: admin._id }, "yadaeyu2023");
    const token = jwt.sign({ id: admin._id }, "yadaeyu2023", {
      expiresIn: "1h",
    });
    // Redirect the user to the admin page
    // res.redirect("/admin");
    res.json({ token, adminId: admin._id });
  } catch (ex) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/addProduct", async (req, res) => {
  const { name, price, description, type } = req.body;

  try {
    const product = new Product({
      name,
      price,
      description,
      type,
    });

    await product.save();
    res
      .status(200)
      .json({ message: "product successfully created", data: product });
  } catch (ex) {
    res.status(500).json({ message: ex });
  }
});

router.get("/viewProduct", async (req, res) => {
  try {
    const products = await Product.find({}).populate("files");
    res.status(200).json({ data: products });
  } catch (ex) {
    res.status(404).json({ message: "Internal Server Error" });
  }
});

router.post("/favorites", async (req, res) => {
  const { data } = req.body;

  // const { _id, name, price, description } = data;

  try {
    const favorite = new Favorites(data);

    await favorite.save();

    res.status(200).json({ data: favorite });
  } catch (ex) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const favorite = await Favorites.find({}).populate("files");
    res.status(200).json({ data: favorite });
  } catch (ex) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/favorites/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const favorite = await Favorites.findByIdAndDelete(id);
    if (!favorite) {
      return res.status(404).json({ message: "favorite with id not found" });
    }

    const favorites = await Favorite.find({});

    res
      .status(200)
      .json({ message: "product successfully deleted", data: favorites });
  } catch (ex) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ _id: id }).populate("files");

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    res.status(200).json({ data: product });
  } catch (ex) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/product/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, description, type } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      {
        name,
        price,
        description,
        type,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newProduct = await Product.findById(id);

    return res
      .status(200)
      .json({ message: "product successfully updated", data: newProduct });
  } catch (ex) {
    res.status(200).json({ message: "Internal server Error" });
  }
});

router.delete("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const products = await product.find({});

    res
      .status(200)
      .json({ message: "product successfully deleted", data: products });
  } catch (ex) {
    res.status(200).json({ message: "Internal server Error" });
  }
});

module.exports = { AdminRouter: router };
