const scrapeIt = require("scrape-it");

var all_info = [];

var inorder = [];
var url = "http://shirts4mike.com/shirt.php";

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

var the_date = formatDate();
var the_file_name = "data/" + the_date + ".csv"; // the csv file path
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
	append: true,
    path: the_file_name,
    header: [
        {id: 'title', title: 'Title'},
        {id: 'price', title: 'Price'},
        {id: 'image', title: 'Image'},
        {id: 'link', title: 'Link'},
        {id: 'time', title: 'Time'},
    ]
});
scrapeIt(url, {
    // Fetch the shirts infomation
    shirts: {
        listItem: ".products li"
      , data: {
 
          title: {
          	selector: "img",
          	attr: "alt"
          }
          , link: {
              selector: "a",
              attr: "href"
           }
          , image: {
		        selector: "li img"
		      , attr: "src"
           }
        }
    }
}, (err, { data }) => {
	data["shirts"].forEach(function(every){
		every.link = "http://shirts4mike.com/" + every.link;
		every.image = "http://shirts4mike.com/" + every.image;
	})
	all_info = data["shirts"].slice();
	//get the price for each shirt
    for(let i=0; i<8; i++)
    {
	    scrapeIt(all_info[i].link, {
	    title: "head title"
	  , price: ".shirt-details h1 span"
	  , image: {
	        selector: ".shirt-picture span img"
	      , attr: "src"
	    }
	}).then(({ data, response }) => {
	    all_info[i]["price"] = data["price"];
	    all_info[i]["time"] = new Date();
	    var new_set = {};
	    //keep the records in this order: title, price, imageURL, URL, time
	    new_set["title"] = all_info[i]["title"];
	    new_set["price"] = all_info[i]["price"];
	    new_set["image"] = all_info[i]["image"];
	    new_set["link"] = all_info[i]["link"];
	    new_set["time"] = all_info[i]["time"];
	    inorder.push(new_set)
	    if(i === 7){
	    csvWriter.writeRecords(inorder)       // returns a promise
        .then(() => {
        console.log(inorder);
        });
       }
    });
  }
  })
