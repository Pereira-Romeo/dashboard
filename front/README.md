# Dashboard Frontend

Web interface for a customizable dashboard: the user creates an
account, logs in, manages their profile and builds their own dashboard with
draggable and resizable widgets (weather, GitHub, Steam, OMGG).

## Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [React Router](https://reactrouter.com) for routing
- [dnd kit](https://dndkit.com) (`@dnd-kit/core`, `@dnd-kit/modifiers`,
  `@dnd-kit/utilities`) for drag and drop
- [re-resizable](https://github.com/bokuweb/re-resizable) for widget
  resizing
- Native CSS with design tokens (no CSS framework)

## Prerequisites

- Docker and Docker Compose, or Node.js and npm

## Getting started

```bash
docker compose up --build
```

The application is available at `http://localhost:5173`.

### Environment variables

| Variable | Role | Example |
| --- | --- | --- |
| `VITE_API_URL` | Backend base URL | `http://localhost:8080` |
| `VITE_SITE_NAME` | Name displayed on the home page (default: `MonSite`) | `Dashboard` |

## Structure

```
src/
  api/
    client.ts     Shared HTTP request, ApiError, error messages
    api.ts        Authentication and profile
    weather.ts    Geocoding and weather data
    services.ts   GitHub and Steam
  assets/         Images (wallpapers, default avatar)
  components/     Base components (Button, InputField, Selectfield)
    ui/           Header, WidgetPicker, draggableWidget/
  context/        React context: user session
  pages/          One page per route
  styles/
    tokens.css    Design tokens (colors, spacing, typography, themes)
    global.css    Shared layout (.page, .card, forms)
  App.tsx         Route declarations and page protection
  main.tsx        Entry point
```

## Pages

| Route | Page | Access | Description |
| --- | --- | --- | --- |
| `/` | Home | Public | Home page (login / sign up) |
| `/login` | Login | Public | Login |
| `/signup` | SignUp | Public | Account creation (email, password of at least 8 characters, confirmation) |
| `/account` | Account | Logged in | End of sign up: photo and username (at least 3 characters) |
| `/dashboard` | Dashboard | Logged in | Widget canvas |
| `/profile` | Profile | Logged in | Photo, name, connection of GitHub and Steam accounts, account deletion |

The "Logged in" pages are protected by `RequireSession` in `App.tsx`:
without a session, the user is redirected to `/`.

## API Client (`src/api/`)

No page calls `fetch` directly. All requests go through
`request()` in `client.ts`, which:

- adds the `Authorization: Bearer <token>` header;
- sends the body as JSON or as `FormData` (avatar upload);
- turns every failure into an `ApiError`, with a `status` and a `message`
  that can be displayed as is.

| File | Functions |
| --- | --- |
| `api.ts` | `signupRequest`, `loginRequest`, `profileRequest`, `updateProfileRequest`, `deleteAccount`, `getAvatarUrl` |
| `weather.ts` | `geocodeRequest` (Open-Meteo), `tempRequest`, `humidityRequest`, `pressureRequest`, `windRequest`, `visibilityRequest`, `skyRequest`, `sunRequest`, `forecastRequest` |
| `services.ts` | `githubConnectUrlRequest`, `githubReposRequest`, `githubContributionsRequest`, `steamConnectUrlRequest`, `steamLibRequest`, `steamRecentActivityRequest` |

### Error handling

| Case | Message |
| --- | --- |
| Server unreachable | `Unable to reach the server, please check your connection` |
| 401 (missing or expired token) | `Session expired, please log in again` |
| 403 | `Access denied` |
| 429 | `Too many requests, please try again in a moment` |
| 401 on GitHub / Steam | `GitHub account not connected` / `Steam account not connected` |
| Unknown city | `City not found` |

Each call can define its own messages per HTTP code (for example
`Incorrect email or password` for a 401 on `/login`).

## Session (`src/context/SessionContext.tsx`)

- On login, the backend returns a JWT token, stored in
  `localStorage` under the `token` key.
- `useSession()` exposes `user`, `loading`, `signIn(email, password)`,
  `login(user)` and `logout()`.
- On page load, if a token exists, the session is restored by
  calling `/profile`.
- Dashboard and Profile recheck the token with the server on every
  arrival on the page. A 401 logs out and redirects to the home page.

## Widgets

The dashboard is a canvas where each widget can be:

- **added** from the "New widget" window, with its settings;
- **moved** by grabbing its top bar (it stays inside the canvas);
- **resized** via the handle at the bottom right (minimum 240 × 160 px);
- **deleted** with the ✕ button;
- **refreshed automatically**, at an interval adjustable by right click.

| Widget | Variants | Settings at creation |
| --- | --- | --- |
| Weather | Conditions, temperature, humidity, wind, pressure, visibility, daylight duration, forecast | City, data to display |
| GitHub | Recent repositories, contributions | Data to display |
| Steam | Library, recent activity | Data to display, click destination |

### Options specific to each widget

- **Weather**: search for another city directly in the widget. A
  failed search keeps the previous city. A click on the widget
  opens the OpenWeatherMap map of the city.
- **GitHub (repositories)**: sort by update date or by name.
- **GitHub (contributions)**: filter by month, 12-month grid.
- **Steam**: sort by playtime or by name; a click on a game opens the
  Steam library, the Store page or launches the game.

### Refresh

| Widget | Default interval |
| --- | --- |
| Weather | 10 minutes |
| GitHub | 60 minutes |
| Steam | None |

A right click on a widget opens the setting: from 10 seconds to 60 minutes,
or 0 to never refresh. Refreshing is paused when
the tab is hidden. It only reloads the data: the searched
city, the sort order and the filters are kept.

### Architecture

```
draggableWidget/
  DraggableWidget.tsx          Frame: moving, size, refresh
  WidgetContent.tsx            Picks the widget according to its settings
  RefreshSettingsPopover.tsx   Interval setting
  widgets/
    shared.tsx                 useWidgetData, WidgetState, RefreshContext
    weather/WeatherWidget.tsx  Shared frame of the 8 weather widgets
    steam/steamShared.tsx      Toolbar and links shared by Steam
```

To add a weather widget: create the component around `WeatherWidget`,
add it to the `WEATHER_WIDGETS` table in `WidgetContent.tsx` and to the list
of the `WidgetPicker`.

**Known limitation**: the dashboard layout is not saved, it
is lost when the page is reloaded.

## Themes

The theme follows the system setting (`prefers-color-scheme`).

All colors, spacing and text sizes are CSS variables
defined in `styles/tokens.css`. Widgets deliberately use
colors inverted from the page (dark widget on a light page, and
the reverse).

## Accessibility

- **Keyboard**: Escape closes the add window and the refresh
  setting; Enter or Space opens a widget from the list.
- **Sizes**: the content of the widgets adapts to their width (container
  queries).

### Color contrast (RGAA)

Ratios computed from the values in `tokens.css`.

#### Light theme
 
| Usage | Text | Background | Ratio | Result |
| --- | --- | --- | --- | --- |
| Text on card | `#242038` | `#F7ECE1` | 13.48:1 | Compliant |
| Text on elevated background | `#242038` | `#EBE1CF` | 12.10:1 | Compliant |
| Muted text on card | `#5b4699` | `#F7ECE1` | 6.49:1 | Compliant |
| Muted text on elevated background | `#5b4699` | `#EBE1CF` | 5.83:1 | Compliant |
| Error on card | `#b3261e` | `#F7ECE1` | 5.62:1 | Compliant |
| Input field text | `#000000` | `#F7ECE1` | 18.04:1 | Compliant |
| Widget text | `#F7ECE1` | `#242038` | 13.48:1 | Compliant |
| Error in a widget | `#ff8a80` | `#242038` | 6.87:1 | Compliant |
| Muted text in a widget | `#b8b0e0` | `#242038` | 7.71:1 | Compliant |
| % of rain (forecast) | `#4da6ff` | `#242038` | 6.14:1 | Compliant |
| White text on error background | `#ffffff` | `#b3261e` | 6.54:1 | Compliant |
 
#### Dark theme
 
| Usage | Text | Background | Ratio | Result |
| --- | --- | --- | --- | --- |
| Text on card | `#F7ECE1` | `#242038` | 13.48:1 | Compliant |
| Text on elevated background | `#F7ECE1` | `#302b4a` | 11.49:1 | Compliant |
| Muted text on card | `#b8b0e0` | `#242038` | 7.71:1 | Compliant |
| Muted text on elevated background | `#b8b0e0` | `#302b4a` | 6.58:1 | Compliant |
| Error on card | `#ff8a80` | `#242038` | 6.87:1 | Compliant |
| Input field text | `#F7ECE1` | `#242038` | 13.48:1 | Compliant |
| Widget text | `#242038` | `#F7ECE1` | 13.48:1 | Compliant |
| Error in a widget | `#b3261e` | `#F7ECE1` | 5.62:1 | Compliant |
| Muted text in a widget | `#5b4699` | `#F7ECE1` | 6.49:1 | Compliant |
| % of rain (forecast) | `#1f5fa8` | `#F7ECE1` | 5.53:1 | Compliant |
| Wind arrow, gauges (graphic) | `#725AC1` | `#F7ECE1` | 4.57:1 | Compliant |
| Field borders (component) | `#8D86C9` | `#242038` | 4.77:1 | Compliant |
| White text on error background | `#ffffff` | `#b3261e` | 6.54:1 | Compliant |
