# Auth and Backend API

Provides authentication api using passport.js and JWT token

### Prerequisites

Make sure you have these installed on your machine

* [Node.js](https://nodejs.org/en/download/)
* [MongoDB](https://www.mongodb.com)
* [Redis](https://redis.io/)

### Installing packages
Install packages

```
npm i or yarn install
```

### Running the app

To run the app.
```
npm start
```
#### Project API's

##### Configure the server and databse port's in app.js


All API routes are accessible under /api
  * set Header as Content-Type: application/json for all the request's
  * [PROTECTED] route with authentication required Authorization (Bearer Token) will return the user details
  * users/ -- user specific routes
      1. api/users/  [POST]-- root route without authentication for user registration
          * request body should have the format
            ```
            {"user":{
                "username": "username",
                "password": "password"
              }}
            ```

      2. api/users/login/ [POST]-- route which accepts username and password and return's authentication session-token
          * request body should have the format
            ```
            {"user":{
                "username": "username",
                "password": "password"
              }}
            ```
          * both the routes api/ and api/login/ will return same output if registration or login is successfull
              ```
              {
                user: {
                  _id: "uniqueUserId",
                  username: "username"
                  token: "token"
                }
              }
              ```
      3. api/users/current/ [GET] [PROTECTED]-- route requires Authorization (Bearer Token) will return the user details

  * followers/ -- follow/unfollow specific routes
      1. api/followers/follow [POST] [PROTECTED]: request body should have the format
          ```
          {
            followUser :"username"
          }
          ```
      2. api/followers/follow [DELETE] [PROTECTED]: request body should have the format
          ```
          {
            followUser :"username"
          }
          ```