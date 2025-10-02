export const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
export const formatDate = (isoString) => new Date(isoString).toLocaleDateString();
