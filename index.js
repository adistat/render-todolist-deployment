const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.json());
app.use((err, req, res, next) => {
  console.error("   uncaught error:", err.stack);
  res.status(500).send(" something broke: " + err.message);
});

const mongoose = require("mongoose");
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

async function getItems() {
    const items = await item.find({});
    return items;
}
app.get("/",async function(req,res){
    try{
        const foundItems = await getItems();
        console.log("Items from DB:", foundItems); 
        res.render("list",{ejes:foundItems});
    }catch (err){
        console.log(err);
        res.status(500).send("internal error");
    }

  
});

app.post("/add", async function(req, res) {
  const {ele1: name, priority}=req.body;
  try {
     const newItem = new item({name, priority});
     await newItem.save();
    res.redirect("/");
  } catch (error) {
    console.error("error saving item:", error);
    res.status(500).send("internal Server Error");
  }
});

app.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, priority } = req.body;
  try {
    await item.findByIdAndUpdate(id, { name, priority });
    res.redirect("/");
  } catch (err) {
    console.error("edit error:", err);
    res.status(500).send("failed to edit item.");
  }
});

app.delete("/delete/:id", async function(req, res) {
  const {id}=req.params;
  try {
   if (Array.isArray(id)) {
   await item.deleteMany({ _id: { $in: id } });
   } else {
      await item.findByIdAndDelete(id);     
   }
    res.redirect("/");
  } catch (err) {
    console.error("error deleting item:", err);
    res.status(500).send("error deleting item.");
  }
});



app.listen(3000,function(){
    console.log("server is running on port 3000");
});
