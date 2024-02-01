import { 
    EXPO_PUBLIC_ANDROID_VERSION_CODE as ANDROID_VERSION_CODE, 
    EXPO_PUBLIC_PACKAGE as PACKAGE,
    EXPO_PUBLIC_VERSION as APP_VERSION,
    EXPO_PUBLIC_GOOGLEMAPS_APIKEY as GOOGLEMAPS_APIKEY,
    EXPO_PUBLIC_CDD_BASE_URL as CDD_BASE_URL,
    EXPO_PUBLIC_MIS_BASE_URL as MIS_BASE_URL,
    EXPO_PUBLIC_DIAGNOSTIC_MAP_LATITUDE,
    EXPO_PUBLIC_DIAGNOSTIC_MAP_LONGITUDE
} from '@env'

// const cddBaseURL = 'http://52.52.147.181/';
// const cddBaseURL = 'https://cddanadeb.e3grm.org/';
// const cddBaseURL = 'http://cdd-env.eba-mz2nppu7.us-west-1.elasticbeanstalk.com/';
// const cddBaseURL = 'http://10.0.2.2:8001/';
const cddBaseURL = CDD_BASE_URL;
export { cddBaseURL };

// const misBaseURL = 'http://cosomis-env.eba-mxictqba.us-west-1.elasticbeanstalk.com/';
// const misBaseURL = 'http://10.0.2.2:8000/';
const misBaseURL = MIS_BASE_URL;
export { misBaseURL };


export const DIAGNOSTIC_MAP_LATITUDE = EXPO_PUBLIC_DIAGNOSTIC_MAP_LATITUDE
export const DIAGNOSTIC_MAP_LONGITUDE = EXPO_PUBLIC_DIAGNOSTIC_MAP_LONGITUDE

//App JSON VAR
// export const GOOGLEMAPS_APIKEY = 
export const EXPO_PUBLIC_PACKAGE=PACKAGE
export const EXPO_PUBLIC_ANDROID_VERSION_CODE=ANDROID_VERSION_CODE
export const EXPO_PUBLIC_VERSION=APP_VERSION
export const EXPO_PUBLIC_GOOGLEMAPS_APIKEY=GOOGLEMAPS_APIKEY