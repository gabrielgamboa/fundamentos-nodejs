const express = require('express');
const {v4: uuidv4} = require('uuid');

const app = express();

const consumers = [];

//definir os body params como json;
app.use(express.json());

//adicionar uma conta
app.post("/account", (request, response) => {
    const {cpf, name} = request.body;
    const uuid = uuidv4();

    consumers.push({
        cpf,
        name,
        uuid,
        statement: []
    });

    return response.status(201).send("Conta criada.");
});

app.listen(3333, () => console.log('Server is running on port 3333'));