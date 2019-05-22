var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(express.static('front-end'));

mongoose.Promise = global.Promise;
mongoose.connect(
    'mongodb://localhost:27017/mydb', 
    { useMongoClient: true }
);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected!!!");
});

// Locations
var locationSchema = mongoose.Schema({
    locationName:String
});

var Location = mongoose.model('gemsis_locations', locationSchema);

app.get('/location', function(req, resp){
    var mysort = { locationName: 1 }; 
    Location.find().sort(mysort).exec().then(
        res=>resp.json(res),
        err=>resp.sendStatus(500)
    );
});

app.post('/location', function(req, resp){
    //console.log(req.body);
       new Location(req.body).save().then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
});

app.put('/location', function(req, resp){
    Location.update(
        {_id: req.body._id},
        {
            $set: {
                locationName: req.body.locationName
            }
        }
    ).then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
    
});

app.delete('/location/:id', function(req, resp){
	
	Customer.find({locationId: req.params.id}).exec().then(
        function(res) {
			if (res.length == 0) {
				Location.remove({_id: req.params.id}).then(
					res=>resp.sendStatus(204),
					err=>resp.sendStatus(500)
				);
			} else {
				resp.sendStatus(500);
			}
		},
        err=>resp.sendStatus(500)
    );
});

// Product types
var productTypeSchema = mongoose.Schema({
    typeName:String
});

var ProductType = mongoose.model('gemsis_producttypes', productTypeSchema);

app.get('/producttype', function(req, resp){
    var mysort = { typeName: 1 }; 
    ProductType.find().sort(mysort).exec().then(
        res=>resp.json(res),
        err=>resp.sendStatus(500)
    );
});

var customerSchema = mongoose.Schema({
    insertDate:Date,
    firstName:String,
    lastName:String,
    tel:String,
    locationId:String,
    instagram:String,
    email:String
});
var Customer = mongoose.model('gemsis_customers', customerSchema);

app.post('/customer', function(req, resp){
    //console.log(req.body);
    req.body.insertDate = new Date();
    new Customer(req.body).save().then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
});

app.put('/customer', function(req, resp){
    Customer.update(
        {_id: req.body._id},
        {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                tel: req.body.tel,
                instagram: req.body.instagram,
                email: req.body.email,
                locationId: req.body.locationId
            }
        }
    ).then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
    
});

app.delete('/customer/:id', function(req, resp){
	
	Order.find({customerId: req.params.id}).exec().then(
        function(res) {
			if (res.length == 0) {
				Customer.remove({_id: req.params.id}).then(
					res=>resp.sendStatus(204),
					err=>resp.sendStatus(500)
				);
			} else {
				resp.sendStatus(500);
			}
		},
        err=>resp.sendStatus(500)
    );
});

app.get('/customer', function(req, resp){
    
	var query;
	
	if (req.query.q) {
		query = {
			$or: [
				{
					firstName: new RegExp(req.query.q, "i")
				},
				{
					lastName: new RegExp(req.query.q, "i")
				},
				{
					instagram: new RegExp(req.query.q, "i")
				},
				  {
					email: new RegExp(req.query.q, "i")
				},
				{
					tel: new RegExp(req.query.q, "i")
				},
				{
					"$and": [
					{
						firstName: new RegExp(req.query.q.split(" ")[0], "i")
					},
					{
						lastName: new RegExp(req.query.q.split(" ")[1], "i")
					}
					]
				}
			]
		};
	}
	
    Customer.find(query).exec().then(
        res=>resp.json(res),
        err=>resp.sendStatus(500)
    );
});


var ObjectId = customerSchema.ObjectId;

var orderSchema = mongoose.Schema({
    insertDate:Date,
    customerId:'ObjectId',
    productTypeId:String,
    deliveryDate:Date,
    notes:String
});

var Order = mongoose.model('gemsis_orders', orderSchema);

app.get('/order', function(req, resp){
    
	Order.aggregate([
		{ $lookup:
		   {
			 from: 'gemsis_customers',
			 localField: 'customerId',
			 foreignField: '_id',
			 as: 'customer'
		   }
		 }
		]).exec().then(
			res=>resp.json(res),
			err=>resp.sendStatus(500)
		);
});

app.post('/order', function(req, resp){
    //console.log(req.body);
    req.body.insertDate = new Date();
    new Order(req.body).save().then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
});

app.put('/order', function(req, resp){
    Order.update(
        {_id: req.body._id},
        {
            $set: {
                customerId: req.body.customerId,
                productTypeId: req.body.productTypeId,
                deliveryDate: req.body.deliveryDate,
                notes: req.body.notes
            }
        }
    ).then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
    
});

app.delete('/order/:id', function(req, resp){
    Order.remove({_id: req.params.id}).then(
        res=>resp.sendStatus(204),
        err=>resp.sendStatus(500)
    );
});

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Listening at http://%s:%s", host, port);

});