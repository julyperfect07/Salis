declare module "@svg-maps/world" {
  interface SvgMapLocation {
    id: string;
    name: string;
    path: string;
  }

  interface SvgMap {
    label: string;
    viewBox: string;
    locations: SvgMapLocation[];
  }

  const worldMap: SvgMap;

  export default worldMap;
}
