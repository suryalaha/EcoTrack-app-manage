export const NGO_NAME = "EcoTrack Initiatives";
export const UPI_ID = "suryalaha@upi";
export const SUPPORT_PHONE_NUMBER = "9635929052";
export const SUPPORT_EMAIL = "shyantanbiswas7@gmail.com";

export const generateUpiUrl = (amount: number, note?: string) => {
    const noteParam = note ? `&tn=${encodeURIComponent(note)}` : '';
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NGO_NAME)}&am=${amount.toFixed(2)}&cu=INR${noteParam}`;
};