export function getGoogleMapsDirectionsUrl(
  latitude: string | number,
  longitude: string | number,
) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(String(latitude))},${encodeURIComponent(String(longitude))}`;
}
