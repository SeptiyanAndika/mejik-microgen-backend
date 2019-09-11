# Microgen

Microgen is a smart microservices and graphql generator based on NodeJs. Instead developing backend by Your own from scratch, with Microgen your work will be much easier. It also had microservices and event driven development in mind, so it will suitable for large scale applications! 

Although Microgen code are generated, it code are easy to read. So it is easy to maintain and also easy to modify. 

## Getting Started

Here are simple steps to generate your code in outputs folder:

- write your schema in schema.graphql (Readmore about how to make Schema, on schema section)

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

**Usage Example**
```
type Post{
    _id: String!
    text: String!
    comments: [Comment] @relation(onDelete: RESTRICT)
    author: User!  @role(onCreate: "own", onUpdateDelete: "own")
}

type UserFriend{
    _id: String
    user: User!
    friend: User!
}

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