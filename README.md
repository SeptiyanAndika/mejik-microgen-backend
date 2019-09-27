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
    id: String!
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
    text: String!
    comments: [Comment] @relation(onDelete: RESTRICT)
    author: User!  @role(onCreate: "own", onUpdateDelete: "own")
    images: [Image] @relation(onDelete: CASCADE)
}

type Image {
    name: String
    url: String! @File
}

type UserFriend{
    user: User!
    friend: User!
}

# Customize User fields
type User{
    phoneNumbers: String!
}

type Comment {
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
        id
        text
    }
    ```
- postsConnection: list of posts with aggregate and pagination info
    ```javascript
    postsConnection {
        data {
            id
            text
        }
        total
        limit
        skip       
    }
    ```
- post: post detail
    ```javascript
    post (id: "5d73013deefb420523f31ae0") {
        id
        text
    }
    ```

**mutations**

- createPost: create a post
    ```javascript
    createPost (input: {
        text: "Post 1"
    }) {
        id
        text
    }
    ```
- updatePost: update a post
    ```javascript
    updatePost (id: "5d73013deefb420523f31ae0", input: {
        text: "Post 1"
    }) {
        id
        text
    }
    ```
- deletePost: delete a post
    ```javascript
    deletePost (id: "5d73013deefb420523f31ae0") {
        id
        text
    }
    ```

### Authentication and Users GQL

because User services are generated by default, You also have ability to do basic functionality for this service, such as CRUDSS and Authentication:

**queries**

- users: list of users
    ```javascript
    users {
        id
        email    
    }
    ```
- usersConnection: list of users with aggregate and pagination info
    ```javascript
    usersConnection {
        data {
            id
            text
        }
        total
        limit
        skip       
    }
    ```
- user: user detail
    ```javascript
    user (id : "5d73013deefb420523f31ae0") {
        id
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
            id
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
            id
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
    changeProfile (id: "5d73013deefb420523f31ae0", input: {
        firstName: "Lucinta"
        lastName: "Luna"
    }) {
        user {
            id
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
            id
            email
        }
        token
    }
    ```
- updateUser: update a user (admin only)
    ```javascript
    updateUser (id: "5d73013deefb420523f31ae0", input: {
        firstName: "Lucinta"
        lastName: "Luna"
    }) {
        user {
            id
            firstName
        }        
    }
    ```
- deleteUser: delete a user (admin only)
    ```javascript
    deleteUser (id: "5d73013deefb420523f31ae0") {
        user {
            id
            email
        }
    }
    ```

### Queries

- list query with params
    ```
    query posts ($query: JSON){
        posts (query: $query) {
            id
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
            id
                text
        }
    }
    ```

- postUpdated: triggered when post updated
    ```
    subscription {
        postUpdated {
            id
                text
        }
    }
    ```

- postDeleted: triggered when post deleted
    ```
    subscription {
        postDeleted {
            id
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

- Upload file(s) to storage. (in this example, we use service called image)
    ```
    mutation {
        createImage(input:{
            name: "an Image"
            url: **Upload Scalar**
        }){
            url
        }
    }    
    ```
    note that createImage mutation is returning an url, this url String can be used to be saved on your related service as a file path.

### Push Notification

- Subscribe playerId (a device) to receive all push notification
    ```
    mutation {
        subscribePushNotificatiton(input:{
            playerId: "cde97568-d73e-4daf-97e6-18f5d869deba"
        }){
            message
        }
    }    
    ```
- Subscribe playerId (a device) to receive push notification on a segment
    ```
    mutation {
        subscribePushNotificatiton(input:{
            playerId: "cde97568-d73e-4daf-97e6-18f5d869deba"
            segment: "room-1"
        }){
            message
        }
    }    
    ```
- Send push notification to all
    ```
    mutation{
        sendPushNotification(input:{
            contents:"Testing cuk 123"
        }){
            message
        }
    }  
    ```
- Send push notification to all players on a segment
    ```
    mutation {
        sendPushNotificationBySegment(input:{
            contents:"testing by segment"
        }, segment: "room-1"){
            message
        }
    }
    ```
- Send push notification to specific userId (in all of his devices/playerIds). UserId here is the real id that registered on database, and not playerId.
    ```
    mutation {
        sendPushNotificationByUserId(input:{
            contents:"testing by segment"
        }, userId: "5d84d7038a65db26a8633701"){
            message
        }
    }
    ```
- Unsubscribe playerId (device) from all push notifications
    ```
    mutation {
        unsubscribePushNotification(input:{
            playerId: "cde97568-d73e-4daf-97e6-18f5d869deba"
        }){
            message
        }
    }
    ```
- Unsubscribe playerId (device) on receiving push notification from a segment
    ```
    mutation {
        unsubscribePushNotification(input:{
            playerId: "cde97568-d73e-4daf-97e6-18f5d869deba"
            segment: "room-1"
        }){
            message
        }
    }
    ```

### Social Media Auth

- Login with Google Account (jwtToken are received when a dialog closed, search about google login third party at client side)
    ```
    mutation {
        loginWithGoogle(input: {
            jwtToken: "cde97568d73e-4daf-97e6-18f5d869deba"
        }){
            token
            user {
                id
                email
            }
        }
    }
    ```
- Login with Facebook Account (jwtToken are received when a dialog closed, search about facebook login third party at client side)
    ```
    mutation {
        loginWithFacebook(input: {
            jwtToken: "cde97568d73e-4daf-97e6-18f5d869deba"
        }){
            token
            user {
                id
                email
            }
        }
    }
    ```



## Hooks - Code Customization

You can fully customize Your code directly on outputs, but that's not the best practice! Output will always replacing your code with a new code, and its ignored from our versioning tools. 

Hooks are the best place to custom Your code, and will not harm the outputs. Your code will stay clean, and less dependant. To use it, Microgen automatically generate "hooks" folder for You. Inside it, there are the hook for each services generated.

**Basic Usage Example**

```javascript
module.exports = (app) => ({
    before: {
        ...
        create: async (context) => {
            //do something before create request
            
            //accessing current payload (this is mutable)
            const headers = context.params.headers
            const body = context.data
            const query = context.params.query
            
            //modify the value
            context.params.query = {$limit: 2}
            
            //accessing user
            const user = context.params.user

            //accessing event sourcing (own & related service only)
            app.get('ownServiceRequester').send({
                type: 'create' //more documentation WIP
            })
            app.get('relatedServiceRequester').send({
                type: 'create' //more documentation WIP
            })
        },
        ...       
    },
    after:{
        find: async (context) => {
            //do something after find request

            //all of above before context and service also can be used here

            //accessing result
            const result = context.result
        },
        ...      
    },
})

```

**Usage Example on User Service with Custom Permissions**

```javascript
module.exports = (app) => ({
    before: ...,
    after: ...,
    //customize your permissions here
    permissions: {
        admin: ['admin:*'],
        authenticated: [
            'user:find', 'user:get'
        ],
        ...
    }
})

```