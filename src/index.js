const express = require('express');
const app = express();

//definir os body params como json;
app.use(express.json());

app.get("/", (request, response) => {
    return response.json({
        message: "Hello worlasdasdd ignite"
    });
});

app.listen(3333, () => console.log('Server is running on port 3333'));