# Tank Turn Tactics

## Workflow
The `master` branch is only for deployment. All pull requests that directly affects the internal code should be merged into the `develop`. It is also recommended to fork the `develop` rather than `master` for the latest code.

## Setup
1. Copy the `sample.env` file and rename it to `.env` to set up environment variables.
2. Run `npm install` to install dependencies.
3. Start the server with `npm run start:dev` or `npm run start:debug` if you want stack trace.

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

 - All mechanics should build either trust or distrust.
 - Dead players should continue to have a role in the game.

### Features

#### The Default Game

 - The game is played asynchronously on a grid.
 - Each player controls a tank which start with 3 health points. If the health of the tank reaches zero, they lose.
 - They each gain action points at regular intervals.
 - Action points can be spent in 3 ways:
    - Attack another player within the range of the tank
    - Move one square
    - Upgrade the range of the tank by one square
 - Dead players vote each day on which alive player to award an action point to.

#### Extra Features

- [ ] **Action Queue**: Actions are performed all at once at the end of the day.
- [ ] **Fog of war**: Sight is included as a stat alongside range. Player can only see up to their sight stat, even if their range is greater.
- [ ] **Spying**: In action queue mode, actions are not known until they are executed at the end of the day. However, actions will be broadcasted to 
   anyone online at the moment. This would add the possibility of 'spying' on other players.
- [x] **Loot**: Players are awarded all of the action points of those they kill.
- [ ] **Bounty**: Each day, players are assigned the name of another random player. If they kill said player, they will receive all of that player's action points.
