const express = require('express');
const http = require('http')
const path = require('path');
var fs = require('fs');

const app = express();


app.use(express.static(path.join(__dirname, '')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const port = process.env.PORT || 8080;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log('running'));


var getClientConfig = function () {
  var result = {};


  if(!process.env.BROWSEAPI_URI) throw new Error("undefined in environment: BROWSEAPI_URI");
  if(!process.env.ONEDRIVE_APPINFO) throw new Error("undefined in environment: ONEDRIVE_APPINFO");
  
  result.BROWSEAPI_URI = process.env.BROWSEAPI_URI;
  result.ONEDRIVE_APPINFO = process.env.ONEDRIVE_APPINFO;

  return result;
}

var writeClientConfig = function(config){
  var client_config = config;
  client_config = "var client_config = " + JSON.stringify(client_config);
  fs.writeFileSync('./client_config.js',client_config);
}

writeClientConfig(getClientConfig());