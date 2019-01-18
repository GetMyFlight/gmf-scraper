const express = require('express');

// Services
const azulHandler = require('./services/azul');

const app = express();
const port = 3001;

app.get('/azul', azulHandler);

app.listen(port, () => console.log(`Server listening on port ${port}!`));
