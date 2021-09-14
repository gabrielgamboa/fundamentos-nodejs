const express = require('express');
const {v4: uuidv4} = require('uuid');

const app = express();

const customers = [];

//definir os body params como json;
app.use(express.json());

//Middleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find(customer => customer.cpf === cpf);

    if (customer) {
        request.customer = customer;
        next();
    }

    return response.status(400).json({error: 'Customer not found.'})
}

//adicionar uma conta
app.post('/account', (request, response) => {
    const {cpf, name} = request.body;
    const uuid = uuidv4();

    const customerAlreadyExists = customers.some(customer => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return response.status(400).json({error: "CPF informado já existe!"});
    }

    customers.push({
        cpf,
        name,
        uuid,
        statement: []
    });

    return response.status(201).send("Conta criada.");
});

//mostrar extrato de um cliente através do cpf
app.get('/statement', verifyIfExistsAccountCPF, (request,response) => {
    const { customer } = request;
    return response.json(customer.statement);
});

app.listen(3333, () => console.log('Server is running on port 3333'));