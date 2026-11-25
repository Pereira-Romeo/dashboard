# backend setup

# .env

the project will launch even if only copying .env.example to .env \
But by doing so you won't be able to interact with the widgets. \
**All** widgets need an api key. How to get each key is described in their respective sections.

The database related variables all need to be the exact same as the [main .env](../.env.example) \
except for DB_HOST which should be the name of the database service in the docker compose.

You also need to generate a JWT_SECRET, can be done with the following: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

```.env
#backend port
PORT=8080
#frontend domain
CORS_ORIGIN=http://localhost:5173

################### database #######################################
DB_ROOT_PASSWORD=changeme
DB_NAME=dashboardDB
DB_USER=dashy
DB_PASSWORD=changeme
DB_HOST=db

################### authentication #################################
## NEVER CHANGE THE PEPPER ON A USED INSTANCE, IT WILL INVALIDATE EVERY PASSWORD
PASSWORD_PEPPER=""
BCRYPT_SALT_ROUNDS=10
## NEVER CHANGE THE JWT KEY ON A RUNNING INSTANCE, INVALIDATES EVERY ACTIVE SESSION
## you can generate one with this command: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=123456789

################## Email verification ##############################
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
MAIL_FROM="Dashboard <no-reply@dashboard.local>"
BACKEND_URL=http://localhost:8080


####################################################################
################### WIDGETS ########################################
####################################################################

################### weather widget #################################
OPENWEATHER_API_KEY=YOUR_API_KEY
WEATHER_CACHE_MINUTES=10
OPENWEATHER_DAILY_LIMIT=950


################### github widget ##################################
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:8080/auth/github/callback
TOKEN_ENCRYPTION_KEY=123456789

################### steam widget ###################################
STEAM_API_KEY=your_key_here
STEAM_REALM=http://localhost:8080
STEAM_RETURN_TO=http://localhost:8080/auth/steam/callback
```

## email verification

we're using nodemailer so you can hook up your app to any mail server you wish to use, it could be gamil, outlook, your own self-hosted server, the only thing you need to change is the .ennv configuration.

By default we use mailpit to receive the verification mails.\
This means you can verifiy any email on [localhost:8025](http://localhost:8025) without needing a real smtp server.

for example, a setup hooked to gmail would look something like this:
```.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youraddress@gmail.com
SMTP_PASS=abcdefghijklmnop
MAIL_FROM="Dashboard <youraddress@gmail.com>"
```

## weather widget

for the weather api, we used **[open weather](https://openweathermap.org/)**. \
You can have a free key by creating an account, creating a key **[on this page](https://home.openweathermap.org/api_keys)**, like the site says, you may need to wait up to 2hours before it's activated. \
You then just replace the value of `OPENWEATHER_API_KEY`


## github widget

for the github api, you need to go on **[your github account > settings > developer settings > oauth app > new oauth app](https://github.com/settings/developers)** \
Then give it a name, a homepage url (http://localhost:8080), a redirect URI (http://localhost:8080/auth/github/callback \
Then generate a client secret, in the .env, replace the values of `OPENWEATHER_API_KEY` and `GITHUB_CLIENT_SECRET` with the corresponding values from github.


## steam widget

go to **[steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)**, enter your domain name (http://localhost:8080/), create the key, \
Then replace the value of `STEAM_API_KEY`


# file architecture

## Routes

When creating a route, put the file under src/routes/ \
the filename dictates the route name, sub-folders extend that name, examples:
```
routes/about.json.ts => domain/about.json
routes/login.ts => domain/login
routes/auth/steam.ts => domain/auth/steam
```

these are only used for basic routes, if you want to make a service and widgets, read the next section.


## Widgets

You create a service under src/service/ by creating a sub-folder \
e.g.: servce/steam/ will appear as a service at about.json \
below your service folder, you may put any file you like without it being a widget. \
if the file should be a widget, append `.widget.ts` to the file.

> [!IMPORTANT]
> Unlike routes where the filename decides the route name,
> widgets expose a widgetDefinition structure that contains a name
> the name inside that structure is what decides the name of the widget.
> e.g.: service/steam/stuff.widget.ts with a name set to steam_library
> would register a route service/steam/steam_library

any file that doesn't end with .widget.ts won't create a route, e.g.: service/steam/steam_helper is NOT a valid route. it's only used by other files for functions that are needed in different sections.


## About.json

about.json is a route (domain/about.json) whose main purpose is to list widgets and services. \
You do not need to update anything inside about.json when you create new services. \
If you respected the file system architecture, all services and their widgets will be registered upon starting the site.

