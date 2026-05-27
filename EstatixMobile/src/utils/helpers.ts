export const formatPrice = (price: number) => `$${price.toLocaleString()}`;
export const formatDate = (date: string) => new Date(date).toLocaleDateString();
export const truncate = (str: string, len: number) => str.length > len ? str.substring(0, len) + '...' : str;