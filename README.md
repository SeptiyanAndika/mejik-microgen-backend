# Microgen

Microgen is a smart microservices and graphql generator based on NodeJs. Instead developing backend by Your own from scratch, with Microgen your work will be much easier. It also had microservices and event driven development in mind, so it will suitable for large scale applications! 

Although Microgen code are generated, it code are easy to read. So it is easy to maintain and also easy to modify. 

## Features

Microgen use cote (https://github.com/dashersw/cote) for the microservices api, feathersJs (https://feathersjs.com) for DB ORM, redis for service discovery, and apollo graphql (https://www.apollographql.com) for the gateway. Microgen use the best practice of implementing microservices:

- **Zero dependency:** Microservices with only JavaScript and Node.js
- **Zero-configuration:** no IP addresses, no ports, no routing to configure
- **Decentralized:** No fixed parts, no "manager" nodes, no single point of failure
- **Auto-discovery:** Services discover each other without a central bookkeeper
- **Fault-tolerant:** Don't lose any requests when a service is down
- **Scalable:** Horizontally scale to any number of machines
- **Performant:** Process thousands of messages per second
- **Humanized API:** Extremely simple to get started with a reasonable API!

## Getting Started

Here are simple steps to generate your code in outputs folder:

- write your schema in schema.graphql (Readmore about how to make Schema, on [schema section](#Schema))

- run 
```
$ node index.js
```

- check outputs folder, and play along with it (follow more instruction inside outputs/README.md)


## Schema

**Default Generated Schema**

Microgen generate User schema for You although You don't specify it on "schema.graphql". The User Schema generated are look like this:

```
type User {
    _id: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
}

```

if you want to add some field inside user, you can simply set in on "schema.graphql" like this:

```
type User {
    phoneNumber: String
}
```

don't worry about the other fields, the default email, password, etc are still generated for You.

**Custom Directives**

- Default value
    ```
    @default(value: "someValue")
    ```
- Relation Delete Strategy
    - CASCADE: when related parent deleted, also delete its child
        ```
        @relation(onDelete: CASCADE)
        ```
    - RESTRICT: can't delete parent, when it had children
        ```
        @relation(onDelete: RESTRICT)
        ```
    - SET_NULL: when related parent deleted, set null to the FK relation
        ```
        @relation(onDelete: SET_NULL)
        ```
- Role
    - onCreate Own: means that every data created by logged in user, it automatically input userId in db table field (the userId are from token decryption)
        ```
        @role(onCreate: "own")
        ```
    - onUpdateDelete Own: means user only able delete or update his/her own data
        ```
        @role(onUpdateDelete: "own")
        ```
    - or you can specify both
        ```
        @role(onCreate: "own", onUpdateDelete: "own")
        ```
- File Type: Specify whether a field is a file type. Note that it should be followed with String type beforehand, and any schema type that related to this, should set it as hasMany. (Look at usage example for more detail)
    ```
    String! @File
    ```

**Usage Example**

```
type Post{
    _id: String!
    text: String!
    comments: [Comment] @relation(onDelete: RESTRICT)
    author: User!  @role(onCreate: "own", onUpdateDelete: "own")
    images: [Image] @relation(onDelete: CASCADE)
}

type Image {
    id: String
    name: String
    url: String! @File
}

type UserFriend{
    _id: String
    user: User!
    friend: User!
}

# Customize User fields
type User{
    phoneNumbers: String!
}

type Comment {
    _id: String
    post: Post!
    text: String!
    author: User!  @role(onCreate: "own", onUpdateDelete: "own")
}
```

## Outputs

### Run app

Simply click RUN button on the top navigation

### Basic CRUDSS GQL Usage

for each service generated, it already available on the gql docs. The basic functionality are (for example we have post service):

**queries**

- posts: list of posts
    ```javascript
    posts {
        _id
        text
    }
    ```
- postsConnection: list of posts with aggregate and pagination info
    ```javascript
    postsConnection {
        data {
            _id
            text
        }
        total
        limit
        skip       
    }
    ```
- post: post detail
    ```javascript
    post (_id: "5d73013deefb420523f31ae0") {
        _id
        text
    }
    ```

**mutations**

- createPost: create a post
    ```javascript
    createPost (input: {
        text: "Post 1"
    }) {
        _id
        text
    }
    ```
- updatePost: update a post
    ```javascript
    updatePost (_id: "5d73013deefb420523f31ae0", input: {
        text: "Post 1"
    }) {
        _id
        text
    }
    ```
- deletePost: delete a post
    ```javascript
    deletePost (_id: "5d73013deefb420523f31ae0") {
        _id
        text
    }
    ```

### Authentication and Users GQL

because User services are generated by default, You also have ability to do basic functionality for this service, such as CRUDSS and Authentication:

**queries**

- users: list of users
    ```javascript
    users {
        _id
        email    
    }
    ```
- usersConnection: list of users with aggregate and pagination info
    ```javascript
    usersConnection {
        data {
            _id
            text
        }
        total
        limit
        skip       
    }
    ```
- user: user detail
    ```javascript
    user (_id : "5d73013deefb420523f31ae0") {
        _id
        email
        firstName
        lastName
    }
    ```

**mutations**

- login: authenticate a user, and return a token and user obj
    ```javascript
    login (input: {
        email: "someone@microgen.com"
        password: "secret"
    }) {
        user {
            _id
            email
        }
        token
    }
    ```
- register: register a user, and return a token and user obj
    ```javascript
    # Note: the first user registered on microgen, by default had admin role
    register (input: {
        email: "someone@microgen.com"
        password: "secret"
        firstName: "someone"
    }) {
        user {
            _id
            email
            firstName
        }
        token
    }
    ```
- verifyEmail: send email to user, when they are registering as new user
    ```javascript
    verifyEmail (input: {
        token: "token-from-email-link-params"
    }) {
        message
    }
    ```
- forgetPassword: send email to user, when they are forgetting their password
    ```javascript
    forgetPassword (input: {
        email: "someone@microgen.com"
    }) {
        message
    }
    ```
- resetPassword: resetting an user password, and sending them email
    ```javascript
    resetPassword (input: {
        newPassword: "newSecret"
        token: "user-someone-current-token"
    }) {
        message
    }
    ```
- changeProfile: update a user (everyone but its own data)
    ```javascript
    changeProfile (_id: "5d73013deefb420523f31ae0", input: {
        firstName: "Lucinta"
        lastName: "Luna"
    }) {
        user {
            _id
            firstName
        }        
    }
    ```
- createUser: create a user (admin only)
    ```javascript
    createUser (input: {
        email : "someuser@microgen.com"
        password: "secret"
        firstName: "someuser"
    }) {
        user {
            _id
            email
        }
        token
    }
    ```
- updateUser: update a user (admin only)
    ```javascript
    updateUser (_id: "5d73013deefb420523f31ae0", input: {
        firstName: "Lucinta"
        lastName: "Luna"
    }) {
        user {
            _id
            firstName
        }        
    }
    ```
- deleteUser: delete a user (admin only)
    ```javascript
    deleteUser (_id: "5d73013deefb420523f31ae0") {
        user {
            _id
            email
        }
    }
    ```

### Queries

- list query with params
    ```
    query posts ($query: JSON){
        posts (query: $query) {
            _id
            text
        }
    }    

    #variables
    {
        "query": {
            "$limit": 10,            
            "$skip": 1,
            "$regex": {
                "text": "post 1",
                "$options": "i",
            },              
        }
    }
    ```
    more queries are available on feathers docs (https://docs.feathersjs.com/api/databases/querying.html#limit)

### Socket

Microgen is battery included, socket is one of them. To use it, simply use graphql subscription tag. There are 3 types of subscriptions (for example You have post service, it will generate):


- postAdded: triggered when post added
    ```
    subscription {
        postAdded {
            _id
                text
        }
    }
    ```

- postUpdated: triggered when post updated
    ```
    subscription {
        postUpdated {
            _id
                text
        }
    }
    ```

- postDeleted: triggered when post deleted
    ```
    subscription {
        postDeleted {
            _id
                text
        }
    }
    ```

### Role & Permissions

Microgen had already defined role & permissions for You. To change the default permissions, You can change on "services/users/permission.js"


```javascript
const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'post:find', 'post:get', 'post:create', 'post:update', 'post:remove', 'post:patch',
    ],
    public: [
        'post:find', 'post:get',
    ],
}
module.exports = {
    permissions
}
```

on the example above, it means that: 
- admin able to access everything
- authenticated users, able to do everything on post-service
- public (unauthenticated users) only able to use post-service on find and get methods

Note: the first user registered on microgen, are registered as admin role

### Email

Email functionality by default are attached to another service such as forgetPassword, register, etc. But if you want use it as standalone, you should loggedIn as "admin" role, then execute some of these mutation below:

**mutation**

- sendEmail: Sending email to any email(s)
    ```
    mutation {
        sendEmail(input:{
            to:"someone@gmail.com;anotherone@gmail.com"
            body:"hahaha"
            subject: "test"
        }){
            message
        }
    }
    ```

- sendEmailToUsers: Sending email to all registered users
    ```
    mutation {
        sendEmailToUsers(input:{            
            body:"hahaha"
            subject: "test"
        }){
            message
        }
    }
    ```

### Files Storage

Documentation WIP

### Push Notification

Documentation WIP

### Social Media Auth

Documentation WIP