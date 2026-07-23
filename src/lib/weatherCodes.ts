export const WEATHER_CODE_MAP: Record<number, [string, string]> = {
  0: ['☀️', 'clear sky'], 1: ['🌤️', 'mainly clear'], 2: ['⛅', 'partly cloudy'], 3: ['☁️', 'overcast'],
  45: ['🌫️', 'fog'], 48: ['🌫️', 'icy fog'],
  51: ['🌦️', 'light drizzle'], 53: ['🌦️', 'drizzle'], 55: ['🌧️', 'dense drizzle'],
  61: ['🌧️', 'light rain'], 63: ['🌧️', 'rain'], 65: ['🌧️', 'heavy rain'],
  71: ['🌨️', 'light snow'], 73: ['🌨️', 'snow'], 75: ['❄️', 'heavy snow'],
  80: ['🌦️', 'rain showers'], 81: ['🌧️', 'rain showers'], 82: ['⛈️', 'violent showers'],
  95: ['⛈️', 'thunderstorm'], 96: ['⛈️', 'thunderstorm, hail'], 99: ['⛈️', 'severe thunderstorm'],
}
