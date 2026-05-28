export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  PropertyDetail: { id: string };
  CreateProperty: undefined;
  EditProperty: { id: string };
  ChatRoom: { propertyId: string; otherUserId: string; otherUserName: string };
  Booking: { propertyId: string };
  VisitRequests: undefined;
  PropertyMap: { propertyId?: string; ownerId?: string };
  LocationPicker: { onSelect: (lat: number, lng: number) => void };
};