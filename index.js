const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const dotenv = require("dotenv");
dotenv.config();
// require('dotenv').config();
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
const mongoose = require("mongoose");
const {name , priority} = require("ejs");
 const DB_URL = process.env.atlas_URL;
 mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

mongoose.set("strictQuery", true);

const trySchema = new mongoose.Schema({
    name: String,
    priority: String
});
const item = mongoose.model("tasks",trySchema);
const todo = new item({
    name:"read something",
    priority: "High"
});
const todo1 = new item({
    name:"solve problem",
    priority: "urgent"
});
// todo.save();
// todo1.save();


async function getItems() {
    const items = await item.find({});
    return items;
}
app.get("/",async function(req,res){
    try{
        const foundItems = await getItems();
        res.render("list",{ejes:foundItems});
    }catch (err){
        console.log(err);
        res.status(500).send("internal error");
    }
});

app.post("/add", async function(req, res) {
  const itemName = req.body.ele1;
  const itemPriority = req.body.priority;
  try {
    const todo3 = new item({
      name: itemName,
      priority: itemPriority
    });
    await todo3.save();  // Wait for the item to save
    res.redirect("/");
  } catch (error) {
    console.error("Error saving item:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, priority } = req.body;

  try {
    await item.findByIdAndUpdate(id, { name, priority });
    res.redirect("/");
  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).send("Failed to edit item.");
  }
});

app.post("/delete", async function(req, res) {
  const checkedId = req.body.checkbox1;
  try {
    if (Array.isArray(checkedId)) {
      await item.deleteMany({ _id: { $in: checkedId } });
    } else {
      await item.findByIdAndDelete(checkedId);     
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Error deleting item.");
  }
});

app.listen(3000,function(){
    console.log("server is running");
});

