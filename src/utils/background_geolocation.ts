// import BackgroundFetch from "react-native-background-fetch";
// import BackgroundGeolocation from 'react-native-background-geolocation';

// BackgroundGeolocation.onLocation(
//   location => {
//     console.log("[location] -", location);
//   },
//   error => {
//     console.error("[location] ERROR -", error);
//   }
// );

// BackgroundGeolocation.ready({
//   desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//   distanceFilter: 10, // Mettre à jour après chaque 10 mètres
//   stopTimeout: 5, // Temps avant d'arrêter le suivi après l'inactivité
//   debug: false, // Mettre à true pour les tests (des notifications apparaîtront)
//   logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//   stopOnTerminate: false, // Continuer après la fermeture de l'application
//   startOnBoot: true, // Reprendre après un redémarrage
// }).then(state => {
//   if (!state.enabled) {
//     BackgroundGeolocation.start(); // Commencer le suivi
//   }
// });

// const backgroundTask = async () => {
//     console.log("Background Task executed!");
//     // Placez ici votre logique
// };

// BackgroundFetch.configure(
//     {
//         minimumFetchInterval: 15, // Temps minimal entre les exécutions en minutes
//         stopOnTerminate: false,  // Continuer après la fermeture
//         startOnBoot: true,       // Redémarrer après un reboot
//     },
//     async (taskId) => {
//         console.log("[BackgroundFetch] Task:", taskId);
//         await backgroundTask();
//         BackgroundFetch.finish(taskId);
//     },
//     (error) => {
//         console.log("[BackgroundFetch] Failed to configure", error);
//     }
// );
