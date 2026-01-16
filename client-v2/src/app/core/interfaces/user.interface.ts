export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
    profilePictureBase64: string;
    address: {
        streetAddress: string;
        city: string;
        postalCode: string;
        addressNotes: string;
    };
}

export interface profileData {
    firstName: string;
    lastName: string;
    phone: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    addressNotes: string;
    profilePictureBase64: string;
}
