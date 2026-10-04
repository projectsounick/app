export interface ServiceDetails {
  _id: string;
  title: string;
  descItems: string[];
  imgUrl: string;
  otherImages: string[];
  price: number;
  sessionCount: number;
  isActive: boolean;
  isCorporate: boolean;
  isOnline: boolean;
  createdAt: string; // or Date if you convert
  updatedAt: string; // or Date if you convert
  __v: number;
}

export interface UserActiveServiceWithDetails {
  _id: string;
  userId: string;
  isActive: boolean;
  serviceDetails: ServiceDetails;
  createdAt: string; // or Date
  updatedAt: string; // or Date
}
