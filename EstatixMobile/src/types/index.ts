export interface User { id: string; name: string; email: string; avatar?: string; role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'; isBanned: boolean; }
export interface Property { id: string; title: string; description: string; price: number; type: 'RENT' | 'SALE'; category: string; bedrooms: number; bathrooms: number; area: number; address: string; city: string; state: string; country: string; latitude?: number; longitude?: number; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED'; views: number; ownerId: string; owner: User; images: PropertyImage[]; createdAt: string; }
export interface PropertyImage { id: string; url: string; publicId: string; propertyId: string; }
export interface Message { id: string; content: string; senderId: string; receiverId: string; propertyId: string; isRead: boolean; createdAt: string; sender: User; receiver: User; }
export interface Visit { id: string; propertyId: string; requesterId: string; ownerId: string; date: string; status: string; notes?: string; property: Property; requester: User; owner: User; }
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}