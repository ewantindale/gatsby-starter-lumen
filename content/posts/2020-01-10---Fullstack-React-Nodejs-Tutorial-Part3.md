---
title: Fullstack React Node.js Tutorial (Part 3)
date: "2020-10-01T09:02"
template: "post"
draft: false
slug: "fullstack-react-nodejs-tutorial-part3"
category: "Software Development"
tags:
  - "Technology"
  - "Tutorials"
  - "Software Development"
description: "Learn how to build a simple fullstack web application using Node.js and React. In the third part of this tutorial we will connect our frontend and backend."
socialImage: "/photo.jpg"
---

# Connect the frontend to the backend

In the [first part](/posts/fullstack-react-nodejs-tutorial) of this tutorial we created our frontend application. Then in the [second part](/posts/fullstack-react-nodejs-tutorial-part2) we created our backend.

Now we are going to connect the two to make our fully functional application.

The first thing we will do is run the following command inside the `frontend` folder:

```
yarn add axios
```
<br>

[axios](https://github.com/axios/axios) is the HTTP client we're going to use to send requests to our backend.

To make things easier while we develop our application, we're going to use the proxy setting provided by Create React App. 

Open up your frontend's `package.json` file and add a proxy like so:

```javascript
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@chakra-ui/core": "^0.8.0",
    "@emotion/core": "^10.0.35",
    "@emotion/styled": "^10.0.27",
    "@reduxjs/toolkit": "^1.4.0",
    "@testing-library/jest-dom": "^4.2.4",
    "@testing-library/react": "^9.3.2",
    "@testing-library/user-event": "^7.1.2",
    "axios": "^0.20.0",
    "emotion-theming": "^10.0.27",
    "react": "^16.13.1",
    "react-dom": "^16.13.1",
    "react-hook-form": "^6.9.1",
    "react-redux": "^7.2.1",
    "react-scripts": "3.4.3"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:4000"
}


```
<br>

Now whenever we send an HTTP request to /api/contacts it will automatically go to http://localhost:4000/api/contacts

**Note:** You will have to restart the frontend for the proxy to take effect.

Next we need to make some changes to our Redux code.

Open up `contactListSlice.js` and modify it like so:

```javascript
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const contactListSlice = createSlice({
  name: "contactList",
  initialState: {
    contacts: [],
    loading: false,
    error: "",
  },
  reducers: {
    addContact: (state, action) => {
      state.contacts.push({
        ...action.payload,
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
    fetchContactsStart: (state) => {
      state.loading = true;
    },
    fetchContactsSuccess: (state, action) => {
      state.loading = false;
      state.contacts = action.payload;
      state.error = "";
    },
    fetchContactsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addContact,
  removeContact,
  updateContact,
  fetchContactsStart,
  fetchContactsSuccess,
  fetchContactsError,
} = contactListSlice.actions;

export const fetchContactsAsync = () => async (dispatch) => {
  dispatch(fetchContactsStart());

  try {
    const response = await axios({
      method: "get",
      url: "/api/contacts",
    });

    dispatch(fetchContactsSuccess(response.data));
  } catch (error) {
    dispatch(fetchContactsError("could not fetch contacts"));
  }
};

export default contactListSlice.reducer;

```
<br>

We've added two new properties to our state: loading and error, and we've removed the id property we were using to generate IDs on the frontend since that is now the database's job.

We've created three new actions, each of which map to a stage of the request we're going to be making to our API:

* **fetchContactsStart** sets loading to true to indicate that we have made the request and are now awaiting a response.
* **fetchContactsSucccess** sets loading to false, error back to an empty string and populates our local contacts array with the list of contacts we've received from the API.
* **fetchContactsError** sets loading to false and error to a generic error message to indicate that the request failed.

We've also created a new function called fetchContactsAsync. This is called a 'thunk', a special action creator that returns a function instead of an action, and can dispatch its own actions.

Here we're using it to dispatch **fetchContactsStart** when we begin our request, and then conditionally dispatch **fetchContactsSucccess** or **fetchContactsError** depending on the response we receive from the backend.

Now we'll make some changes to our `ContactList` component:

```javascript
import { Box, Button, Spinner, Text } from "@chakra-ui/core";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactsAsync, removeContact } from "../contactListSlice";
import UpdateContactModal from "./UpdateContactModal";

export default function ContactList() {
  const { contacts, loading, error } = useSelector(
    (state) => state.contactList
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchContactsAsync());
  }, [dispatch]);

  if (loading) {
    return (
      <Box mt={8} borderTop="1px solid lightgrey" textAlign="center">
        <Spinner mx="auto" mt={8} size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={8} borderTop="1px solid lightgrey" textAlign="center">
        <Text color="#ff0000" mt={8}>
          Error: {error}
        </Text>
      </Box>
    );
  }

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

We're using the useEffect hook to automatically dispatch fetchContactsAsync whenever the component mounts.

We're destructuring the state.contactList object to get the contacts, loading and error variables and then using them to conditionally render our component. If a request is in progress we will show a loading spinner, if an error has occurred we will display it, and if we have successfully retrieved the list of contacts we will display that.

Make sure your backend is still running and then refresh the page. You should now be able to see any contacts that are in your database (if there aren't any, refer to the previous section and use Insomnia to add some).

Refreshing the page no longer makes them disappear, because they are being fetched from our database instead of kept only in local state.

Note that the Add Contact, Update and Remove buttons won't work because these are still acting only on our *local* data. If you use them and then refresh the page, the changes will not be persisted.

## Add and Update Contacts

Now we'll update our `ContactForm` component to make requests to the backend when submitted:

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
import axios from "axios";

export default function ContactForm({ contact, onClose }) {
  const {
    handleSubmit,
    errors,
    setError,
    register,
    formState,
    reset,
  } = useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (contact) {
      reset({ ...contact });
    }
  }, [reset, contact]);

  async function onSubmit(values) {
    if (contact) {
      try {
        const response = await axios({
          method: "put",
          url: `/api/contacts/${contact.id}`,
          headers: {
            "Content-Type": "application/json",
          },
          data: values,
        });

        dispatch(updateContact(response.data));
        reset({ ...contact });
        onClose();
      } catch (error) {
        setError(error.response.data.field, {
          type: "api",
          message: error.response.data.error,
        });
      }
    } else {
      try {
        const response = await axios({
          method: "post",
          url: "/api/contacts",
          headers: {
            "Content-Type": "application/json",
          },
          data: values,
        });
        dispatch(addContact(response.data));
        reset();
      } catch (error) {
        setError(error.response.data.field, {
          type: "api",
          message: error.response.data.error,
        });
      }
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

Now when our form is submitted it will send a request to the server, then dispatch the appropriate Redux action upon a successful response. If it receives a bad response an error will be thrown, caught by our catch statement and we will use the error object sent from the backend to display the error next to the appropriate field.

Adding and updating contacts should now work correctly.

## Remove contacts

The last thing to do is make our Remove button functional.

To do this we'll edit our `ContactList` component:

```javascript
import { Box, Button, Spinner, Text } from "@chakra-ui/core";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactsAsync, removeContact } from "../contactListSlice";
import UpdateContactModal from "./UpdateContactModal";
import axios from "axios";

export default function ContactList() {
  const { contacts, loading, error } = useSelector(
    (state) => state.contactList
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchContactsAsync());
  }, [dispatch]);

  const remove = async (id) => {
    await axios({
      method: "delete",
      url: `/api/contacts/${id}`,
    });

    dispatch(removeContact(id));
  };

  if (loading) {
    return (
      <Box mt={8} borderTop="1px solid lightgrey" textAlign="center">
        <Spinner mx="auto" mt={8} size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={8} borderTop="1px solid lightgrey" textAlign="center">
        <Text color="#ff0000" mt={8}>
          Error: {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box mt={8} borderTop="1px solid lightgrey">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <Box key={contact.id} py={4}>
            <Button
              onClick={() => remove(contact.id)}
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

We've created a remove function which sends the delete request to the database, and then optimistically removes the contact from local data.

## Summary

The app should now look like this. It should allow contacts to be added, updated and removed and persist all changes between page refreshes and across devices.

![](/media/fullstack-react-nodejs-tutorial/contactlist7.png)

If you've made it this far, well done! You've created a basic fullstack application.

This tutorial is intended to give you a framework to understand how fullstack applications are built using React and Node.js. 

I would encourage you to build on this app by adding additional features, fixing any bugs you find, or to make another application using the same tools we used here.

Making changes and solving problems on your own is a great next step after following a tutorial to help solidify everything you've learned.

You can view the full source code for this application [here](https://github.com/ewantindale/contact-list-tutorial).