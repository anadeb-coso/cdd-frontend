export type PrivateStackParamList = {
  Drawer: undefined;
  VillageDetail: any;//{ title?: string };
  SelectVillage: undefined;
  Home: undefined;
  Diagnostics: undefined;
  CapacityBuilding: undefined;
  GrievanceRedressMechanism: undefined;
  Notifications: undefined;
  PhaseDetail: any;
  ActivityDetail: any;
  TaskDetail: { task: object; currentPage: number; cvd_name: string; facilitator: object; project: object; }; //onTaskComplete: () => void; 
  TaskDetailTest: { task: object; currentPage: number; cvd_name: string; facilitator: object; project: object; }; //onTaskComplete: () => void; 
  SupportingMaterials: { materials: [object]; title: string };
  TaskDiagnostic: undefined;
  TaskStatusDetail: any;
  SyncDatas: undefined;


  SubprojectRouter: undefined;
  ListSubprojects: any;
  Cantons: undefined;
  Villages: any;
  CVD: undefined;
  ListModules: any;
  TrackingSubprject: any;
  TrackingSubprjectLevel: any;
  ListInfrastructures: any;
  ListModulesInfrastructure: any;
  DiagnosticActivities: any;
  DiagnosticActivitiesList: any;
  ViewGeolocation: undefined;
  Images: any;
  TakeGeolocation: any;
  SubprojectDetails: any;
  CompaniesDetails: any;
  SocialAuditDetails: any;
  
  StoreProjects: undefined;
  AppDetail: any;

  Subjects: undefined;
  Lessons: undefined;
  SupportMaterials: undefined;

  SelectProject: undefined;
  WebViewComponent: undefined;

  GeoOthers: undefined;
  TakeVillageGeolocation: undefined;
  GeoVillages: undefined;
  TakeOtherGeolocation: undefined;

  AddNews: any;
  DetailNews: any;
  TakePosition: undefined;

  DownloadList: undefined;
  InfosList: undefined;
  InfosPlanning: undefined;
  
  NotificationsSettingsList: undefined;
  ChangeProjectScreen: undefined;
  ChangeFacilitatorDBScreen: undefined;
  ProfileScreen: undefined;
  SettingsList: undefined;
  
  PdfViewer: undefined;
  ImageViewerCustomer: undefined;
};

export type PublicStackParamList = {
  Login: undefined;
  StoreProjects: undefined;
  AppDetail: any;
  NewsSearch: undefined;
  DetailNews: any;
  PasswordLoss: undefined;
};
