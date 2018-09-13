const express = require('express');
const http = require('http')
const path = require('path');

const app = express();



app.use(express.static(path.join(__dirname, '')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

var port = process.argv[2];
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log('running on:', port));



    





