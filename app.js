//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();
const PORT = process.env.PORT || 3000
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://Ganesh:Kick9110@cluster0.w2z84eu.mongodb.net/ToDoListDB');

const itemsSchema = mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema);

const task1 = new Item({
  name: "Welcome to ToDoList !"
});
const task2 = new Item({
  name: "Hit on  + to add new item."
});
const task3 = new Item({
  name: " <-- Hit the box to delete an item"
});
const defaulItems = [task1, task2, task3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

const items = [];
const workItems = [];


app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find(function (err, itemsArr) {
    if (itemsArr.length === 0) {
      Item.insertMany(defaulItems, function (err) {
        if (err) {
          console.log("Error Found");
        }
        else {
          console.log("Saved");
          res.redirect('/')
        }
      })
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: itemsArr });
    }
  })



});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const list = req.body.list;
  const newTask = new Item({
    name: item
  })
  if (list == "Today") {
    newTask.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:list},function(err,foundList){
      if(foundList){
        foundList.items.push(newTask);
        foundList.save();
        res.redirect("/"+list)
      }
      else{
        console.log(err);
      }
    })
  }



});

app.post("/delete", function (req, res) {
  const Id = req.body.Id;
  const listName =req.body.listName;
  if(listName == "Today"){
    Item.deleteOne({ _id: Id }, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(Id + " Deleted");
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:Id}}},function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/"+listName);
      }
    })
  }
  
})

app.get("/:listTitle", function (req, res) {
  const listName = _.capitalize(req.params.listTitle);

  List.findOne({ name: listName }, function (err, list) {
    if (!err) {
      if (list) {
        res.render("list", { listTitle: listName, newListItems: list.items });
      }
      else {
        const list = new List({
          name: listName,
          items: defaulItems
        });
        list.save();
        res.redirect("/" + listName);

      }
    }
  })


  // res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});
