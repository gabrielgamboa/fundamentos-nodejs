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
        return next();
    }

    return response.status(400).json({error: 'Customer not found.'})
}

function getBalance(statement) {
    const balance = statement.reduce((accumulator, operation) => {
        if (operation.type === 'credit') {
            return accumulator + operation.amount;
        } else {
            return accumulator - operation.amount;
        }
    }, 0);

    return balance;
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

//realizar um depósito em uma conta já existente
app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const newStatementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    };

    customer.statement.push(newStatementOperation);

    return response.status(201).send();
});

//realizar saque em uma conta já existente
app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.json({error: 'Você não possui saldo suficiente para realizar saque.'});
    }

    const newStatementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    };

    customer.statement.push(newStatementOperation);

    return response.status(201).send();
});

//mostrar extrato de um cliente através do cpf , por data
app.get('/statement/date', verifyIfExistsAccountCPF, (request,response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");
    console.log(dateFormat);

    const statement = customer.statement.filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString());
    
    return response.json(statement);
});

//atualizar uma conta pelo cpf
app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

//trazer uma conta pelo cpf
app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer);
});

//deletar uma conta pelo cpf e retornar a lista
app.delete('/account', verifyIfExistsAccountCPF, (request, response) => {
    const {customer} = request;
    const indexAccount = customers.indexOf(customer);
    
    customers.splice(indexAccount, 1);

    return response.json(customers);
});

//retornar o saldo do cliente pelo cpf
app.get('/balance', verifyIfExistsAccountCPF, (request, response) => {
    const {customer} = request;
    const balance = getBalance(customer.statement);
    return response.json(balance);
});

app.listen(3333, () => console.log('Server is running on port 3333'));