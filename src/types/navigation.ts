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
};

export type PublicStackParamList = {
  Login: undefined;
};
