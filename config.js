
export const APP_ID = '4355289138045787';
export const COMPANY_WHATSAPP_NUMBER = '15551720665';

export const API_BASE_URL = 'http://localhost/projects/webtrix_24_BE';
export const APP_BASE_URL = 'http://localhost/projects/webtrix_24_BE/';

// export const API_BASE_URL = 'https://dev.coachgenie.in/';
// export const APP_BASE_URL = 'https://dev.coachgenie.in/';

export const CUSTOMER_PROFILE_PATH = 'https://dev.coachgenie.in/uploads/customer/';


export function formatToTimeString(dateTimeStr) {
  const date = new Date(dateTimeStr.replace(' ', 'T'));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getFormattedDateTime() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1); // Months are zero-based
  const day = pad(now.getDate());

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
