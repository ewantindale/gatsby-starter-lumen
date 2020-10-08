---
title: Fullstack React Node.js Tutorial (Part 1)
date: "2020-10-01T09:00"
template: "post"
draft: false
slug: "fullstack-react-nodejs-tutorial-part1"
category: "Software Development"
tags:
  - "Technology"
  - "Tutorials"
  - "Software Development"
description: "Learn how to build a simple fullstack web application using Node.js and React. In the first part of this tutorial we will create our frontend app using React, Redux and Chakra UI."
socialImage: "/photo.jpg"
---

# Introduction

In this tutorial I am going to take you through the process of building a fullstack web application using React (frontend) and Node.js (backend).

Our app will be a simple Contact List that allows us to keep a list of contacts names, email addresses and phone numbers.

The recommended prerequisites for this tutorial are:

- A basic understanding of HTML, CSS, JavaScript (or another programming language) and React
- [Node.js](https://nodejs.org/en/) and an IDE or text editor of your choice (I use [Visual Studio Code](https://code.visualstudio.com/)) installed on your machine.
- A package manager. I will be using [Yarn](https://yarnpkg.com/) but you could alternatively use npm which comes included with Node.js.

You can view the full source code for this application [here](https://github.com/ewantindale/contact-list-tutorial).

# Structure

There are three main steps we are going to take to build our application:

- Create the frontend (Part 1 - you are here!)
- Create the backend ([Part 2](/posts/fullstack-react-nodejs-tutorial-part2))
- Connect the frontend and backend ([Part 3](/posts/fullstack-react-nodejs-tutorial-part3))

# Create the frontend

The very first thing we will do is to create an empty folder for our entire project.

I've called mine `contact-list`.

## Initialize using Create React App

Inside your project folder, run the following command:

```
yarn create react-app frontend
```
<br>

This will create a minimalist starter app for us to build upon.

However, it also creates a few things which we aren't going to need in our application, so let's clean those up before we begin.

Open up the `frontend/src` folder and delete everything except for the following files:

```
App.js
index.js
```
<br>

Next, open `index.js` and remove the references to the files we just deleted.

It should now look something like this:

```javascript
import React from "react"
import ReactDOM from "react-dom"
import App from "./App"

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)
```
<br>

Next, do the same with `App.js`. Delete all the references to the deleted files as well as everything inside the return function apart from the outermost `<div>`. Replace it with a friendly message.

Our `App.js` file should now look like so:

```javascript
import React from "react"

function App() {
  return <div>Hello World</div>
}

export default App
```
<br>

Now you can run your app by running the following command inside of the `frontend` folder:

```
yarn start
```
<br>

You should see this in your browser:

![Hello World Screenshot](/media/fullstack-react-nodejs-tutorial/helloworld.png)

You can leave the app running and it will automatically reload whenever we make changes to our code.

## Install Chakra

We are going to use [Chakra UI](https://chakra-ui.com/), a React component library that will provide us with some ready-made components and save us a lot of development time.

To install Chakra, ensure you are inside the `frontend` folder then run the following command:

```
yarn add @chakra-ui/core @emotion/core @emotion/styled emotion-theming
```
<br>

Now we will modify `index.js` so that it looks like so:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider, CSSReset, theme } from "@chakra-ui/core";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CSSReset />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

```
<br>

This is everything we need to start using Chakra. 

`<ThemeProvider>` will provide us access to the default theme and `<CSSReset/>` will ensure that our webpage looks the same across different browsers.

That's enough setup! Now we can start to actually build our application.

## Container and Title

Open up `App.js` and modify it with the following code:

```javascript
import React from "react";
import { Heading, Box } from "@chakra-ui/core";

function App() {
  return (
    <Box maxW="500px" mx="auto">
      <Heading>Contact List</Heading>
    </Box>
  );
}

export default App;

```
<br>

`<Box>` acts as a container for our page content, giving it a maximum width and setting its horizontal margins to fill the remaining space on either side which has the effect of centering our content on larger screens. 

We also have a page heading which will be the title for our application.

## ContactForm

Now let's create the form that will be used to add new contacts to the list.

We're going to call this ContactForm, because later on we will also be using this form to *update* existing contacts.

Create a new folder inside `src` called `components` and inside that folder a new file called `ContactForm.js` with the following contents:

```javascript
import React from "react";
import { Input, FormControl, FormLabel, Button } from "@chakra-ui/core";

export default function ContactForm() {
  return (
    <form>
      <FormControl mt={4}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input name="name" placeholder="name" />
      </FormControl>
      <Button type="submit" variantColor="teal" mt={4}>
        Add Contact
      </Button>
    </form>
  );
}

```
<br>

Go back to `App.js` and add the component we just created to it:

```javascript
import React from "react";
import { Heading, Box } from "@chakra-ui/core";
import ContactForm from "./components/ContactForm";

function App() {
  return (
    <Box maxW="500px" mx="auto">
      <Heading>Contact List</Heading>
      <ContactForm />
    </Box>
  );
}

export default App;

```
<br>

Your app should now look like this:

![](/media/fullstack-react-nodejs-tutorial/contactlist1.png)

As you can see, we have a form consisting of an input field and a submit button. We will add email and phone fields later on. 

For now, this is just a nice (enough) looking interface which doesn't actually do anything. 

Let's add some functionality.

## React Hook Form

We're going to use the [React Hook Form](https://react-hook-form.com/) library to help us store our form state and handle input validation.

Make sure you're in the `frontend` folder and run the following command:

```
yarn add react-hook-form
```
<br>

Next, modify `ContactForm.js` like so:

```javascript
import { useForm } from "react-hook-form";
import React from "react";
import {
  FormErrorMessage,
  FormLabel,
  Input,
  FormControl,
  Button,
} from "@chakra-ui/core";

export default function ContactForm() {
  const { handleSubmit, errors, register, formState, reset } = useForm();

  function onSubmit(values) {
    alert("Hello " + values.name);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={errors.name} mt={4}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          name="name"
          placeholder="name"
          ref={register({ required: "Name is required" })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>
      <Button
        type="submit"
        variantColor="teal"
        isLoading={formState.isSubmitting}
        mt={4}
      >
        Add Contact
      </Button>
    </form>
  );
}
```
<br>

There's a lot going on here so let's take a minute to go through it.

The `useForm` hook from `react-hook-form` gives us `register` which we use to register our 'name' field, and pass a validation option to indicate that the field is required, along with an error message to display to the user if they don't enter a value.

It also gives us `handleSubmit` which takes our function `onSubmit` as an argument. When the form successfully validates, `onSubmit` is called with the user entered values and we can do whatever we want with them. Right now, we're just displaying an alert and saying hello. Soon we'll be adding them to our list of contacts.

It also gives us access to any `errors` in our form as well as the `formState`, allowing us to affect the rest of our UI based on what's happening within the form. We use this to display an error message if the user fails to enter a name before submitting the form, and to display a loading icon in place of the submit button if the form is *currently* submitting.

The `reset` function is called to clear the input fields after the form is submitted.

## Redux

Now that our ContactForm component is ready, we need somewhere to store our contacts. We could do this using local state inside one of our components, but this can become difficult to manage as our application grows in size and complexity.

[Redux](https://redux.js.org) is the standard solution to this problem as it allows us to keep a global state, easily accessible from any component within our application. [Redux Toolkit](https://redux-toolkit.js.org/) is a wrapper around Redux that makes it easier to write Redux applications, and that's what we are going to be using.

Run the following command inside the `frontend` folder to install the Redux packages we need:

```
yarn add @reduxjs/toolkit react-redux
```
<br>

Next, create a new file inside `src` and name it `contactListSlice.js`:

```javascript
import { createSlice } from "@reduxjs/toolkit";

export const contactListSlice = createSlice({
  name: "contactList",
  initialState: {
    contacts: [],
    idCounter: 0,
  },
  reducers: {
    addContact: (state, action) => {
      state.contacts.push({ ...action.payload, id: state.idCounter++ });
    },
  },
});

export const { addContact } = contactListSlice.actions;

export default contactListSlice.reducer;

```
<br>

Here we use the createSlice function provided by `redux-toolkit` to create a slice of state inside our Redux store.

We give it a name, pass it some initial values, and define a list of *action-specific* reducers for handling different actions that we can dispatch to affect our store's state.

The `addContact` reducer will add a new contact to our list using the values we provide to it.

It also gives the new contact an auto-incrementing ID using the `idCounter` value. This is a temporary solution - later our database will be responsible for generating this ID.

Finally we are exporting the *action creator* for `addContact` which we will use elsewhere in our application to dispatch the action to our reducer, and the *slice reducer* which we will pass to our store.

Don't worry too much about the difference between a reducer, an action creator and the action itself. A simple way of looking at it is just to think of an action that you can use to affect the state.

To make our newly created global state and reducer available across our application, we need to create a store.

Make a new file inside `src` called `store.js`:

```javascript
import { configureStore } from "@reduxjs/toolkit";
import contactListReducer from "./contactListSlice";

const store = configureStore({
  reducer: {
    contactList: contactListReducer,
  },
});

export default store;

```
<br>

Here you can see we are importing the reducer from the slice we just created and using it in our store. If we had other reducers, we would put them here too.

Finally, modify your `index.js` file to include the following:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider, CSSReset, theme } from "@chakra-ui/core";
import store from "./store";
import { Provider } from "react-redux";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

```
<br>

Here we wrap our entire application using the `Provider` component from `react-redux` and pass it our `store` object. This allows us to access the store from anywhere in our application.

Now that Redux is set up and ready for us to use, let's create our list of contacts.

## ContactList + useSelector

Now we are going to create a component called ContactList which will display our contacts.

In a moment we're going to add the email and phone fields to our form, so let's go ahead and include those when we display the contact information.

Create a new file inside the `components` folder called `ContactList.js`:

```javascript
import React from "react";
import { Box, Text } from "@chakra-ui/core";
import { useSelector } from "react-redux";

export default function ContactList() {
  const contacts = useSelector((state) => state.contactList.contacts);

  return (
    <Box mt={8} borderTop="1px solid lightgrey">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Box key={contact.id} py={4}>
            <Text>{contact.name}</Text>
            <Text>{contact.email}</Text>
            <Text>{contact.phone}</Text>
          </Box>
        ))
      ) : (
        <Text py={4}>You haven't added any contacts yet.</Text>
      )}
    </Box>
  );
}

```
<br>

Here we are using the `useSelector` hook provided by `react-redux` to give us access to the list of contacts inside our Redux store.

Then we check to see if there are any contacts in the list, and if so we display them, otherwise we show a message indicating that the contact list is empty.

Open up `App.js` and add the component we just created:

```javascript
import React from "react";
import { Heading, Box } from "@chakra-ui/core";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";

function App() {
  return (
    <Box maxW="500px" mx="auto">
      <Heading>Contact List</Heading>
      <ContactForm />
      <ContactList />
    </Box>
  );
}

export default App;

```

## Adding a contact

Now we need to setup our ContactForm component to actually allow the user to add a new contact.

We do this by dispatching actions to be picked up by our reducer, which will in turn affect our global state.

We're going to use the `useDispatch` hook from `react-redux` and pass in our `addContact` action containing the form values.

Let's also copy and paste the code for our name field and modify it slightly to create the email and phone number fields.

Open up `components/ContactForm.js` and modify it like so:

```javascript
import { useForm } from "react-hook-form";
import React from "react";
import {
  FormErrorMessage,
  FormLabel,
  Input,
  FormControl,
  Button,
} from "@chakra-ui/core";

import { useDispatch } from "react-redux";
import { addContact } from "../contactListSlice";

export default function ContactForm() {
  const { handleSubmit, errors, register, formState, reset } = useForm();
  const dispatch = useDispatch();

  function onSubmit(values) {
    dispatch(addContact({ ...values }));
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={errors.name} mt={4}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          name="name"
          placeholder="name"
          ref={register({ required: "Name is required" })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.email} mt={4}>
        <FormLabel htmlFor="name">Email</FormLabel>
        <Input
          name="email"
          placeholder="email"
          ref={register({ required: "Email is required" })}
        />
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.phone} mt={4}>
        <FormLabel htmlFor="phone">Phone</FormLabel>
        <Input
          name="phone"
          placeholder="phone"
          ref={register({ required: "Phone is required" })}
        />
        <FormErrorMessage>
          {errors.phone && errors.phone.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        variantColor="teal"
        isLoading={formState.isSubmitting}
        mt={4}
      >
        Add Contact
      </Button>
    </form>
  );
}


```
<br>

Notice that we are calling `addContact` and passing it an object containing the values from the form as the "payload". We use this object inside the reducer we created earlier to add a new contact with the correct values.

Our application should now look and function like so:

![](/media/fullstack-react-nodejs-tutorial/contactlist2.png)

Completing the form with valid information should now add a contact to the list below.

## Removing a contact

Let's add a button to remove a contact.

First we'll edit `contactListSlice.js` and add a reducer to handle our `removeContact` action (don't forget to export it too):

```javascript
import { createSlice } from "@reduxjs/toolkit";

export const contactListSlice = createSlice({
  name: "contactList",
  initialState: {
    contacts: [],
    idCounter: 0,
  },
  reducers: {
    addContact: (state, action) => {
      state.contacts.push({
        ...action.payload,
        id: state.idCounter++,
      });
    },
    removeContact: (state, action) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addContact, removeContact } = contactListSlice.actions;

export default contactListSlice.reducer;

```
<br>

The `removeContact` reducer filters the list of contacts, removing the one with an ID that matches the value provided in action.payload.

Next we will modify our `components/ContactList.js` file like so:

```javascript
import React from "react";
import { Box, Text, Button } from "@chakra-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { removeContact } from "../contactListSlice";

export default function ContactList() {
  const contacts = useSelector((state) => state.contactList.contacts);
  const dispatch = useDispatch();

  return (
    <Box mt={8} borderTop="1px solid lightgrey">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Box key={contact.id} py={4}>
            <Button
              onClick={() => dispatch(removeContact(contact.id))}
              variantColor="red"
              float="right"
            >
              Remove
            </Button>
            <Text>{contact.name}</Text>
            <Text>{contact.email}</Text>
            <Text>{contact.phone}</Text>
          </Box>
        ))
      ) : (
        <Text py={4}>You haven't added any contacts yet.</Text>
      )}
    </Box>
  );
}


```
<br>

Now we have a button to remove contacts from the list.

![](/media/fullstack-react-nodejs-tutorial/contactlist3.png)

## Updating a contact

Let's add a way to update an existing contact.

First, we'll edit our `contactListSlice.js` file and create a new action for updating a contact:

```javascript
import { createSlice } from "@reduxjs/toolkit";

export const contactListSlice = createSlice({
  name: "contactList",
  initialState: {
    contacts: [],
    idCounter: 0,
  },
  reducers: {
    addContact: (state, action) => {
      state.contacts.push({
        ...action.payload,
        id: state.idCounter++,
      });
    },
    removeContact: (state, action) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
    },
    updateContact: (state, action) => {
      state.contacts = state.contacts.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
    },
  },
});

export const {
  addContact,
  removeContact,
  updateContact,
} = contactListSlice.actions;

export default contactListSlice.reducer;

```
<br>

The `updateContact` action loops through our list of contacts and when it finds one that matches the provided ID, replaces it using the provided name, email and phone values.

Next, create a new file inside `components` called `UpdateContactModal.js`:

```javascript
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/core";
import React from "react";
import ContactForm from "./ContactForm";

export default function UpdateContactModal({ contact }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} variantColor="blue" float="right" mr={2}>
        Update
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Contact</ModalHeader>
          <ModalBody>
            <ContactForm contact={contact} onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
```
<br>


This component displays a button to toggle our modal open and closed. 

The modal itself contains an instance of the `ContactForm` that we created earlier, and passes in some props which are not currently being used. 

Let's fix that now by editing `components/ContactForm.js`:

```javascript
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/core";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addContact, updateContact } from "../contactListSlice";

export default function ContactForm({ contact, onClose }) {
  const { handleSubmit, errors, register, formState, reset } = useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (contact) {
      reset({ ...contact });
    }
  }, [reset, contact]);

  function onSubmit(values) {
    if (contact) {
      dispatch(updateContact({ ...values, id: contact.id }));
      reset({ ...contact });
      onClose();
    } else {
      dispatch(addContact({ ...values }));
      reset();
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={errors.name} mt={4}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          name="name"
          placeholder="name"
          ref={register({ required: "Name is required" })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.email} mt={4}>
        <FormLabel htmlFor="name">Email</FormLabel>
        <Input
          name="email"
          placeholder="email"
          ref={register({ required: "Email is required" })}
        />
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.phone} mt={4}>
        <FormLabel htmlFor="phone">Phone</FormLabel>
        <Input
          name="phone"
          placeholder="phone"
          ref={register({ required: "Phone is required" })}
        />
        <FormErrorMessage>
          {errors.phone && errors.phone.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        variantColor="teal"
        isLoading={formState.isSubmitting}
        mt={4}
      >
        {contact ? "Save" : "Add Contact"}
      </Button>
      {contact && (
        <Button mt={4} ml={2} onClick={onClose} variantColor="red">
          Cancel
        </Button>
      )}
    </form>
  );
}

```
<br>

Now we have modified our `ContactForm` component to change its behavior from a 'create contact' form to an 'update contact' form depending on whether or not it receives a `contact` prop.

Open up `ContactList.js` and add the component we just created:

```javascript
import React from "react";
import { Box, Text, Button } from "@chakra-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { removeContact } from "../contactListSlice";
import UpdateContactModal from "./UpdateContactModal";

export default function ContactList() {
  const contacts = useSelector((state) => state.contactList.contacts);
  const dispatch = useDispatch();

  return (
    <Box mt={8} borderTop="1px solid lightgrey">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Box key={contact.id} py={4}>
            <Button
              onClick={() => dispatch(removeContact(contact.id))}
              variantColor="red"
              float="right"
            >
              Remove
            </Button>
            <UpdateContactModal contact={contact} />
            <Text>{contact.name}</Text>
            <Text>{contact.email}</Text>
            <Text>{contact.phone}</Text>
          </Box>
        ))
      ) : (
        <Text py={4}>You haven't added any contacts yet.</Text>
      )}
    </Box>
  );
}

```
<br>

Our application now looks like this:

![](/media/fullstack-react-nodejs-tutorial/contactlist4.png)

Clicking the Update button opens a modal which allows us to update the contact's details:

![](/media/fullstack-react-nodejs-tutorial/contactlist6.png)

That's our frontend finished for now. 

We can create, update and delete contacts from our list, but no data is being persisted, so every time we refresh the page everything gets reset.

In the second part of this tutorial we will create our backend application to allow us to interact with the database and persist our data: [Fullstack React Node.js Tutorial (Part 2)](/posts/fullstack-react-nodejs-tutorial-part2)