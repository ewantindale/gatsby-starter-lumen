---
title: Fullstack React Node.js Tutorial (Part 2)
date: "2020-10-01T09:01"
template: "post"
draft: false
slug: "fullstack-react-nodejs-tutorial-part2"
category: "Software Development"
tags:
  - "Technology"
  - "Tutorials"
  - "Software Development"
description: "Learn how to build a simple fullstack web application using Node.js and React. In the second part of this tutorial we create our backend using Node.js, PostgreSQL and the Knex query builder."
socialImage: "/photo.jpg"
---

# Introduction

In the [first part](/posts/fullstack-react-nodejs-tutorial-part1) of this tutorial we created our frontend application which allows users to create, update and delete contacts from the list.

![](/media/fullstack-react-nodejs-tutorial/contactlist4.png)

However as soon as the user refreshes the page, the data is lost! This is because we're storing everything in the app's local state. 

Obviously, for the application to be useful we need to be able to persist data between page loads and even across different devices.

For this we're going to use a database and our backend is going to act as a kind of 'middleman' between our frontend (what the user sees and interacts with) and the database (where the data is stored). The backend is also where we would handle things like authentication and data processing. 

## Node.js and Express

We'll begin by creating a new folder inside our main project folder called `backend`.

Inside this folder run the following command:

```
yarn init -y
```
<br>

This will initialize our Node.js app by creating a `package.json` file with the default options.

We are going to be using [Express](https://expressjs.com/) as our web framework so go ahead and install it:

```
yarn add express
```
<br>

Now create a new folder `src` and inside that folder create an `index.js` file and populate it with the following:

```javascript
const express = require("express");

const app = express();

app.use("/", (req, res) => {
  res.send("Hello from Express");
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

```
<br>

Here we are simply importing and initializing Express with a basic route which will respond with "Hello from Express".

To run our app, we simply run the command:

```
node src/index.js
```
<br>

You should now see this in your terminal:

```
Server listening on http://localhost:4000
```
<br>

And if you go to http://localhost:4000 in your browser, you will see the message response from Express:

![](/media/fullstack-react-nodejs-tutorial/hello.png)

While developing, we don't want to have to stop our server and run this command every time we make a change, so we're going to use a package called nodemon to watch our files for changes and automatically restart the server when necessary.

Run this command:
```
yarn add -D nodemon
```
<br>

We are using the -D option to install nodemon as a development dependency, because we only need it while we're developing, not once our app is actually live.

Edit the `package.json` file we created and add a new script like so:

```javascript
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.4"
  },
  "scripts": {
    "dev": "nodemon src/index.js"
  },
}

```
<br>

Now when we run the following command, our app will run and every time we make a change it will automatically restart with the changes we just made.

```
yarn dev
```

## Database setup

We're going to use a PostgreSQL database for our application. 

If you already have PostgreSQL installed on your machine, feel free to use that. 

I'm going to use a cloud-hosted database from [ElephantSQL](https://www.elephantsql.com/) because it saves us having to install anything.

Simply create an account then go to Create New Instance, name it whatever you like and choose the Tiny Turtle (Free) plan. Pick the data center closest to you and then click Review and Create Instance.

Now that we have our database ready, we need to connect it to our backend app.

Run the following command inside the `backend` folder:

```
yarn add knex pg
```
<br>

`knex` is the query builder we're going to use to interact with our database and `pg` is the database driver for PostgreSQL.

Run the following command to install the Knex CLI globally:

```
yarn global add knex
```
<br>

Next, initialize Knex by running this command inside the `backend` folder:

```
yarn knex init
```
<br>

This will generate a file named `knexfile.js`. Replace the contents of this file with the following:

```javascript
module.exports = {
  client: "pg",
  connection:
    "postgres://username:password@host:port/dbname",
};
```
<br>

Replace the connection string with your own database connection URL. If you used ElephantSQL it will be under URL in the Details section of the instance you just created.

This file is where Knex will look for the database connection settings when executing migrations. We're also going to import it and use it in our app when we initialize Knex.

Now create a file inside `backend/src` named `knex.js`:

```javascript
const client = require("../knexfile");
module.exports = require("knex")(client);
```
<br>

Here we are initializing Knex using the configuration file we just created, and exporting it to be used in the rest of our application.

Now we need to create a database migration which will initialize our "contacts" table in the database.

Run the following command:

```
yarn knex migrate:make initial
```
<br>

This will create a migrations folder inside the `backend` folder with our new migration inside. Open the migration file and modify it like so:

```javascript
exports.up = function (knex) {
  return knex.schema.createTable("contacts", (table) => {
    table.increments("id").primary();
    table.string("name").unique();
    table.string("email").unique();
    table.string("phone").unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("contacts");
};

```
<br>

Now whenever our migration is run it will create a new table in our database named "contacts". 

It will create four columns in this table. 

The first is an auto-incrementing ID field which will be our primary key and the remaining three are strings that will hold the contact's name, email and phone number. 

These columns are specified as unique, meaning our database will throw an error if we attempt to insert duplicate data (for example, entering two contacts with the same name).

If we decide to rollback the migration, it will delete the "contacts" table again.

Save the file, and use the following command to run our migration:

```
yarn knex migrate:latest
```
<br>

Now we are ready to start using our database.

## API routes

Open up `index.js` and make the following changes:

```javascript
const express = require("express");
const app = express();
const knex = require("./knex");

app.get("/api/contacts", async (req, res) => {
  const contacts = await knex("contacts").select();

  res.json(contacts);
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

```
<br>

Here we import the initialized `knex` module and create the endpoint for our API.

Whenever we send a GET request to http://localhost:4000/api/contacts our backend will query the database for all rows within the "contacts" table and respond with the results in JSON format.

Try visiting that URL now and you should see an empty array: []

This is because we haven't yet added any contacts to our database.

To do that, we need to tell our API how to handle POST requests.

Modify `index.js` like so:

```javascript
const express = require("express");
const app = express();
const knex = require("./knex");

app.use(express.json());

app.get("/api/contacts", async (req, res) => {
  const contacts = await knex("contacts").select();

  res.json(contacts);
});

app.post("/api/contacts", async (req, res) => {
  const { name, email, phone } = req.body;

  const newContact = await knex("contacts")
    .insert({ name, email, phone })
    .returning("*");

  res.json(newContact[0]);
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

```
<br>

Now we have a POST request handler that will take the name, email and phone number that we provide, insert it into the database and respond back with the new contact we just created in JSON format.

Note that we've added the `express.json()` middleware to allow us to parse the body that is provided with the request object. 

Eventually our frontend will be responsible for sending requests to our backend, but while we are developing our backend it is helpful to be able to manually send requests and view the response. 

There are many programs that do this but I'm going to use [Insomnia](https://insomnia.rest/).

Go ahead and download Insomnia Core (it's free).

Inside of Insomnia, create two requests: one GET request and one POST request, both using the URL http://localhost:4000/api/contacts

The GET request will produce the same result as visiting the page in your browser.

For the POST request, click Body then select JSON. Enter some test data like so:

```
{
	"name": "ewan",
	"email": "ewan@ewan.com",
	"phone": "12345"
}
```
<br>

Now click Send. You should receive a JSON object as a response containing both the information you provided and an ID field generated by the database.

![](/media/fullstack-react-nodejs-tutorial/insomnia3.png)

Now we'll create a PUT request handler that will allow us to update a contact.

Add the following to `index.js` underneath the POST handler we just created:

```javascript
app.put("/api/contacts/:id", async (req, res) => {
  const { name, email, phone } = req.body;

  const { id } = req.params;

  const updatedContact = await knex("contacts")
    .where("id", "=", id)
    .update({ name, email, phone })
    .returning("*");

  res.json(updatedContact[0]);
});
```
<br>

You'll notice this is fairly similar to the POST request handler. The difference is that we also take an `id` parameter as part of the URL, and then use this to specify which row in the "contacts" table we want to update. We use the `update` command instead of `insert` and finally respond with the updated contact.

You can test the PUT route we created by using Insomnia to send a PUT request to http://localhost:4000/api/contacts/1 with some new values for name, email and phone number.

Finally we will add a handler for DELETE requests.

Add the following to `index.js`:

```javascript
app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;

  await knex("contacts").where("id", "=", id).delete();

  res.status(200).send();
});
```
<br>

Just like when we handled the PUT request, here we are taking the id as a parameter and using it to specify which row (contact) to delete. We then send a response containing the contact we just deleted.

You can test the DELETE route we created by using Insomnia to send a DELETE request to http://localhost:4000/api/contacts/1

Unlike the POST and PUT requests, this DELETE request does not require a body.

Your complete `index.js` file should now be as follows:

```javascript
const express = require("express");
const app = express();
const knex = require("./knex");

app.use(express.json());

app.get("/api/contacts", async (req, res) => {
  const contacts = await knex("contacts").select();

  res.json(contacts);
});

app.post("/api/contacts", async (req, res) => {
  const { name, email, phone } = req.body;

  const newContact = await knex("contacts")
    .insert({ name, email, phone })
    .returning("*");

  res.json(newContact[0]);
});

app.put("/api/contacts/:id", async (req, res) => {
  const { name, email, phone } = req.body;

  const { id } = req.params;

  const updatedContact = await knex("contacts")
    .where("id", "=", id)
    .update({ name, email, phone })
    .returning("*");

  res.json(updatedContact[0]);
});

app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;

  await knex("contacts").where("id", "=", id).delete();

  res.status(200).send();
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

```

## Error handling

When we created our contacts table, we specified that the name, email and phone columns must be unique. This means that whenever we insert or update a contact, if the name, email or phone number we provide matches one that already exists our database will throw an error.

Right now that will crash our backend and our frontend will not receive any response, causing it to break as well. 

Let's add some error handling to gracefully handle these errors and pass them to the frontend to display to the user.

Edit `index.js` and change the POST and PUT routes like so:

```javascript
const getErrorResponse = require("./utils/getErrorResponse");

//...

app.post("/api/contacts", async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const newContact = await knex("contacts")
      .insert({ name, email, phone })
      .returning("*");
    res.status(201).json(newContact[0]);
  } catch (error) {
    const errorResponse = getErrorResponse(error);

    res.status(400).json(errorResponse);
  }
});

app.put("/api/contacts/:id", async (req, res) => {
  const { name, email, phone } = req.body;

  const { id } = req.params;

  try {
    const updatedContact = await knex("contacts")
      .where("id", "=", id)
      .update({ name, email, phone })
      .returning("*");

    res.json(updatedContact[0]);
  } catch (error) {
    const errorResponse = getErrorResponse(error);

    res.status(400).json(errorResponse);
  }
});
```
<br>

Here we are wrapping our database queries in a try...catch that will catch the error thrown by the database, pass it to our getErrorResponse function which returns an appropriate response, then send that response to the frontend.

Here's what that getErrorResponse function looks like. 

Create a new folder `src/utils` with a file `getErrorResponse.js`:

```javascript
const getErrorResponse = (error) => {
  if (error.code === "23505") {
    if (error.detail.includes("name")) {
      return { field: "name", error: "This name is already in use" };
    } else if (error.detail.includes("email")) {
      return { field: "email", error: "This email address is already in use" };
    } else if (error.detail.includes("phone")) {
      return { field: "phone", error: "This phone number is already in use" };
    }
  }
};

module.exports = getErrorResponse;

```
<br>

"23505" is the error code used by PostgreSQL to indicate a "unique_violation".

We then parse error.detail to find out which field caused the error.

You can see all the data provided by the error by including a console log `console.error(error)`

Your complete `index.js` should now be as follows:

```javascript
const express = require("express");
const app = express();
const knex = require("./knex");
const getErrorResponse = require("./utils/getErrorResponse");

app.use(express.json());

app.get("/api/contacts", async (req, res) => {
  const contacts = await knex("contacts").select();

  res.json(contacts);
});

app.post("/api/contacts", async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const newContact = await knex("contacts")
      .insert({ name, email, phone })
      .returning("*");
    res.status(201).json(newContact[0]);
  } catch (error) {
    const errorResponse = getErrorResponse(error);

    res.status(400).json(errorResponse);
  }
});

app.put("/api/contacts/:id", async (req, res) => {
  const { name, email, phone } = req.body;

  const { id } = req.params;

  try {
    const updatedContact = await knex("contacts")
      .where("id", "=", id)
      .update({ name, email, phone })
      .returning("*");

    res.json(updatedContact[0]);
  } catch (error) {
    const errorResponse = getErrorResponse(error);

    res.status(400).json(errorResponse);
  }
});

app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;

  await knex("contacts").where("id", "=", id).delete();

  res.status(200).send();
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

```
<br>

You can test the error handling using Insomnia.

Send a POST request to insert a user, then send another one with the same data. You should receive a response with status code 400 and an error object like so:

![](/media/fullstack-react-nodejs-tutorial/error.png)

That's our backend finished.

In the third part of this tutorial we will connect the frontend to the backend: [Fullstack React Node.js Tutorial (Part 3)](/posts/fullstack-react-nodejs-tutorial-part3)