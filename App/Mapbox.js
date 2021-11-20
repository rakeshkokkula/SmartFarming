import MapboxGL from '@react-native-mapbox-gl/maps';

const Mapbox = MapboxGL;
Mapbox.setAccessToken(process.env.MAP_BOX_TOKEN);

export default Mapbox;
