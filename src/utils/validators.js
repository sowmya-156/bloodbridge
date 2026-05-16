// src/utils/validators.js
// Form validation helper functions

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? '' : 'Please enter a valid email address.';
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone.replace(/\s/g, ''))
    ? ''
    : 'Please enter a valid phone number.';
};

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

export const validateAge = (age) => {
  const n = parseInt(age, 10);
  if (isNaN(n)) return 'Age must be a number.';
  if (n < 18) return 'You must be at least 18 years old to donate.';
  if (n > 65) return 'Maximum eligible age is 65.';
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required.`;
  }
  return '';
};

export const validateDonorForm = (data) => {
  const errors = {};
  const req = (f, l) => { const e = validateRequired(data[f], l); if (e) errors[f] = e; };

  req('fullName', 'Full name');
  req('age', 'Age');
  req('gender', 'Gender');
  req('bloodGroup', 'Blood group');
  req('city', 'City');

  if (data.age) {
    const ageErr = validateAge(data.age);
    if (ageErr) errors.age = ageErr;
  }

  if (data.phone) {
    const phoneErr = validatePhone(data.phone);
    if (phoneErr) errors.phone = phoneErr;
  } else {
    errors.phone = 'Phone number is required.';
  }

  if (data.email) {
    const emailErr = validateEmail(data.email);
    if (emailErr) errors.email = emailErr;
  } else {
    errors.email = 'Email is required.';
  }

  return errors;
};

export const validateEmergencyForm = (data) => {
  const errors = {};
  const req = (f, l) => { const e = validateRequired(data[f], l); if (e) errors[f] = e; };

  req('patientName', 'Patient name');
  req('bloodGroup', 'Blood group');
  req('hospitalName', 'Hospital name');
  req('city', 'City');
  req('urgency', 'Urgency level');

  if (data.contactNumber) {
    const phoneErr = validatePhone(data.contactNumber);
    if (phoneErr) errors.contactNumber = phoneErr;
  } else {
    errors.contactNumber = 'Contact number is required.';
  }

  return errors;
};
