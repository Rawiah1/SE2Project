const express = require('express')
const app = express();
const bodyParser = require('body-parser');
var FastText = require('node-fasttext');
const cors = require('cors');

app.use(bodyParser.urlencoded({extended : true}));

app.use(cors());


let config = { 
  dim: 100,
  input: "train.txt",
  output: "model"
}



FastText.train("supervised", config, function (success, error) {

  if(error) {
    console.log(error)
    return;
  }
  
  console.log(success)
  
})
app.use(express.static('public'));
app.set('view engine', 'ejs');
var textItems = [];
var labelsItems = [];

app.get('/', (req, res) => {
  res.render("index", {listOfTextItems : textItems, listOfLabelsItems : labelsItems});
});


app.post('/', function(req, res) {
  var statement = req.param('statement');
  var item = req.body.statement;
  
  textItems.push(item);
  labelsItems.push(getFastTextResults(statement));
  res.redirect('/', {listOfTextItems : textItems}, {listOfLabelsItems : labelsItems});
});

function getFastTextResults(statement) {
	//predict returns an array with the input and predictions for best cateogires

  var scsVar;

  FastText.predict(
    "model.bin", 3, [statement],
    function(success, error){
      if(error){
        console.log(error)
        return;
      }
      
      console.log(success);
      scsVar = success;
    }
  )
  var items = [];
  for (i=0; i< scsVar.length; i++){
    let lbl = scsVar[i]["label"];
    items.push(lbl.replace("__label__",""));
  }
  return items;

}

app.listen(8000, () => {
  console.log('Listening on port 8000!')
});