export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  const val = Number(amount) || 0;
  return `${symbol}${val.toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (minutes) => {
  const m = Number(minutes) || 0;
  const hours = Math.floor(m / 60);
  const remainingMinutes = m % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

