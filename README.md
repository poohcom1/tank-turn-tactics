# Tank Turn Tactics

This project is still in its very early stage of development!


## Setup
1. Copy the `sample.env` file and rename it to `.env` to set up environment variables
2. Run `npm install` to install dependencies
3. Start the server with `npm run start:dev` or `npm run start:debug` if you want stack trace

## Project Structure
```
root
├── config      # setup for libraries
├── controllers # db controllers
├── libs        # utility modules
├── models      # db schema
├── middlewares # routes middlewares
├── public      # static resources
│   ├── css
│   └── js
├── routes      # routes
├── tests       # unit tests
└── views       # ejs and html
```

## Libraries

| Dependency | Description 
|------------|-------------
| express | Framework 
| ejs | Templating engine
| passport | Authentication middleware
| bcryptjs | Password encryption
| mongoose | Database controller
| express-session | Authenticated session
| connect-mongodb-session | MongoDB session storage

| Testing | Description
|------------|-------------
| jest | Framework
| @jest-mock/express | Express mocking
| mongodb-memory-server| Database testing

## Environment Variables

| Key | Value |
|----|-----|
| PORT | Default port |
| DB_URI | MongoDB Uri |
| SESSION_SECRET | Session encryption key |
| INTERVAL_MODE | Unit of interval (hour/minute) |
| ADMIN_EMAIL | Admin email |
| ADMIN_PASSWORD | Admin password |

## Game Design

### Design Philosophy

 - All mechanics should be a tool to build either trust or distrust
 - Dead players should continue to have a role in the game

### Design Points

#### Default

 - Game is played asynchronously on a grid
 - Each player controls a tank with health. If the health reaches zero, they lose
 - Each have actions point which they gain at a certain time every day
 - Actions point can be spent in 3 ways: combat, movement, or upgrades
    - Combat: Attack another player
    - Movement: Move to a different position
    - Upgrade: Upgrade the range of the tank
 - Dead players can vote on an alive player to award an action point to
    
#### Extended Designs

 - **Action Queue**: Actions are performed all at once at the end of the day
 - **Fog of war**: Sight is included as a stat alongside range. Player can only see up to their sight stat, even if their 
   range is greater
 - **Spying**: Actions are not known until they are executed at the end of the day. However, actions will be broadcasted to 
   anyone online at the moment, to add the possibility of 'spying' on other players
 - **Loot**: Players are awarded half the action points of anyone they killed
 - **Bounty**: Each day, players are assigned a bounty of another player at random. If they kill said player, they will 
    received all of the action points of that player
