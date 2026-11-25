# dashboard

Table of contents:
1. **[What is this app](#what-is-this-app)**
2. **[Dependencies](#dependencies)**
3. **[Setting up the app](#setting-up-the-app)**
4. **[Starting the app](#starting-the-app)**
5. **[Seeing the DB](#seeing-the-database)**
6. **[Tests](#auto-tests)**


# What is this app

it's a dashboard. \
On this dashboard you can create widgets from available services, these widgets include but are not limited to:
- current sky conditions
- current temperature
- sunrise & sunset times
- atmospheric pressure
- weather forecast over the next 5 days
- your steam library
- your recent activity on steam
- your github repositories
- your github contributions

You may read about the **[technical choices here](./doc/technical_choices.md)**. \
You may also read about the **[database here](./doc/db_info.md)**.


# Dependencies

- docker

# Setting up the app

### Main .env

if you're just testing, you may simply copy the .env.example to .env \
Otherwise, there is atleast 2 values you need to change, the 2 passwords. \
You may generate a password with the following command: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`, or use another method.

This .env is only setting up the db.
```.env
DB_ROOT_PASSWORD=changme
DB_NAME=dashboardDB
DB_USER=dashy
DB_PASSWORD=changeme
```

### backend .env

checkout the **[related readme](./back/README.md)**

### frontend .env

checkout the **[related readme](./front/README.md)**


# Starting the app

At the project's root:
```sh
docker compose up --build
```

Your app will now be availble at **[localhost:5173](http://localhost:5173)**
The backend is available at **[localhost:8080](http://localhost:8080)**


# Seeing the Database

because we're using drizzle-orm, we have access to drizzle kit studio to see and edit the db on the fly from the browser :D \
after [starting the app](#starting-the-app):
```sh
docker compose run --rm -p 4983:4983 backend npm run db:studio
```
then open your browser on **[local.drizzle.studio](https://local.drizzle.studio)**.

> [!NOTE]
> upon starting drizzle kit studio, you might see a line saying something like:
> Drizzle Studio is up and running on `https://local.drizzle.studio?host=0.0.0.0`
> you do NOT want to add the `?host=0.0.0.0`, it doesn't work


# Auto tests

At the project's root, after [starting the app](#starting-the-app):
```sh
docker compose exec backend npm test
```

