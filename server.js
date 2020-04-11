var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

// to open index.html on browser
app.use(express.static(__dirname))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

mongoose.Promise = Promise;

var dburl = 'mongodb://user:user@ds255347.mlab.com:55347/learning-node'

var Message = mongoose.model('Message',{
	name: String,
	message: String
})

/*var messages = [
	{name:"Tim", message:"hi"},
	{name:"Jane", message:"hello"}
]*/

app.get('/messages', (req,res) => {
	Message.find({},(err,messages)=>{
		res.send(messages);
	})
})

app.get('/messages/:user', (req,res) => {
	var user = req.param.user;
	
	Message.find({name:user},(err,messages)=>{
		res.send(messages);
	})
})

app.post('/messages', async(req,res) => {
	try {
		//throw 'error'
		var message = new Message(req.body)
		var savedMessage = await message.save()
		//messages.push(req.body)
		console.log('saved')
		var censored = await Message.findOne({message: 'badword'})
			if(censored)
				await Message.remove({_id: censored.id})
			else
				io.emit('message',req.body);
		res.sendStatus(200);
	}catch(error){
		res.sendStatus(500)
		return console.error(err);
	}finally{
		console.log('message post called')
	}
	
	//.catch((err)=>{
	//	res.sendStatus(500)
	//	return console.error(err);
	//});
	
})
		
io.on('connection', (socket)=>{
	console.log('a user connected')
})

mongoose.connect(dburl, { useMongoClient:true},(err)=>{
	console.log('mongo DB connection', err)
})

var server = http.listen(3000, ()=>{
	console.log('server is listening on port',server.address().port)
})