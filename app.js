const express = require('express');
const cors = require('cors')
const app = express();
const axios = require('axios');
const cities = require('./database').city;
const weather = require('./database').weather;
const path = require('path');


const API_KEY = "776a14b6ed4112ebfca7b47a2a2df82b";

if(process.env.NODE_ENV === "production" ){
  app.use(express.static('client/build'));

  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,"client","build","index.html"))
  });
}


// insert Search Keywords to database
app.post('/saveSearchWords', (req, res) => {
  var city = req.query.city;
  
  var model = new cities({"cityName":city});
  model.save();
  axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}&units=metric`)
  .then(function (response) {
    res.send(response.data)
    console.log(response.data);

  })
  .catch(function (error) {
    console.log(error); 
  })
 
});

// Get city name from database
app.get('/retrieveByCity', async(req, res) => {
  var a = await cities.find({})
  res.send(a)
});

// localhost:5000/getWeather?city=@param1
// @param1 city = London

app.get('/getWeather', async (req, res) => { 
  try { 
    var city = req.query.city 
  
    var model = new cities({"cityName":city});
    model.save();
    await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
      .then(response=>{
        var array = response.data;
        // res.send(array);
        var col = {
          "name": array.name,
          "temp": array.main.temp,
          "speed": array.wind.speed,
          "pressure":array.main.pressure,
          "humidity":array.main.humidity,
          "temp_min": array.main.temp_min,
          "temp_max": array.main.temp_max,
          "all": array.clouds.all,
        };
        // res.send(col)  
        var model2 = new weather(col);
        model2.save();
        res.send(col);
    }).catch(error=>{
        res.status(500).send('City not Found')
    })
  }
  catch (error) {
      res.send(error)
  }
});


app.post('/:city', (req, res) => {
  var city = req.params.city;
  axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}&units=metric`).then(response=>{
    res.send(response.data)
  })

});

app.get('/getAll',async (req,res)=>{
  res.send(await weather.find({}))
})
app.get('/deleteOne',async (req,res)=>{
  res.send(await weather.findByIdAndRemove(req.query.id))
})
app.post('/deleteAll', async (req, res) => {
  res.send(await weather.find({}).remove());
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('server listening on port 5000');
});
