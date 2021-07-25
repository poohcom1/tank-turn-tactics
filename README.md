# Tank Turn Tactics

## Setup
1. Copy the `sample.env` file and rename it to `.env` to set up environment variables
2. Run `npm install` to install dependencies
3. Run `npm run start` to start server

## Project Structure
```
root
├── controllers # db controllers
├── libs        # utility modules
├── models      # db schema
├── public      # static resources
│   ├── css
│   └── js
├── routes      # routes
├── tests       # unit tests
├── views       # ejs and html
```

## Libraries

| Dependency | Description 
|------------|-------------
| express | Framework 
| ejs | Templating engine
| passport | Authentication middleware
| passport-local | Using local authentication
| bcryptjs | Password encryption
| mongoose | Database controller
| express-session | Authenticated session

| Testing | Description
|------------|-------------
| jest | Framework
| mongodb-memory-server| Database testing


## Game Design

### Design Points

