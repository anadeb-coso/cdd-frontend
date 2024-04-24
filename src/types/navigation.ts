export type PrivateStackParamList = {
  Drawer: undefined;
  VillageDetail: { title?: string };
  SelectVillage: undefined;
  Home: undefined;
  Diagnostics: undefined;
  CapacityBuilding: undefined;
  GrievanceRedressMechanism: undefined;
  Notifications: undefined;
  PhaseDetail: undefined;
  ActivityDetail: undefined;
  TaskDetail: { task: object; onTaskComplete: () => void };
  SupportingMaterials: { materials: [object]; title: string };
  TaskDiagnostic: undefined;
  TaskStatusDetail: undefined;
  SyncDatas: undefined;


  SubprojectRouter: undefined;
  ListSubprojects: undefined;
  Cantons: undefined;
  Villages: undefined;
  CVD: undefined;
  ListModules: undefined;
  TrackingSubprject: undefined;
  TrackingSubprjectLevel: undefined;
  ListInfrastructures: undefined;
  ListModulesInfrastructure: undefined;
  ViewGeolocation: undefined;
  Images: undefined;
  
  StoreProjects: undefined;
  AppDetail: undefined;

  Subjects: undefined;
  Lessons: undefined;
  SupportMaterials: undefined;

  WebViewComponent: undefined;

  GeoOthers: undefined;
  TakeVillageGeolocation: undefined;
  GeoVillages: undefined;
  TakeOtherGeolocation: undefined;
};

export type PublicStackParamList = {
  Login: undefined;
};
