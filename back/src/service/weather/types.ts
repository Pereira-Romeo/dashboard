export interface CurrentWeather {
    coord: { lon: number; lat: number; };
    weather: { id: number; main: string; description: string; icon: string }[];
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
        sea_level?: number;
        grnd_level?: number;
    };
    visibility: number;
    wind: { speed: number; deg: number; gust?: number };
    clouds: { all: number };
    rain?: { "1h": number };
    snow?: { "1h": number };
    dt: number;
    sys: { sunrise: number; sunset: number };
    timezone: number;
    name: string; //city name
}

export interface ForecastWeather {
    cnt: number;
    list : [
        {
            dt: number;
            main: {
                temp: number;
                feels_like: number,
                temp_min: number;
                temp_max: number;
                pressure: number;
                humidity: number;
                sea_level?: number;
                grnd_level?: number;
                temp_kf: number;
            };
            weather: { id: number; main: string; description: string; icon: string }[];
            clouds: { all: number };
            wind: { speed: number; deg: number; gust?: number };
            visibility: number;
            pop: number; //probability of precipitation
            sys: { pod: string }; // part of the day "n" - night; "d" - day
            rain?: { "3h": number };
            snow?: { "3h": number };
            dt_txt: string;
        }
    ];
    city: {
        id: number;
        name: string;
        coord: { lon: number; lat: number; };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
}

export interface WeatherData {
    current: CurrentWeather;
    forecast: ForecastWeather;
    fetchedAt: number;
}


