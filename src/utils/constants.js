// src/utils/constants.js
// App-wide constants, blood group data, and sample donors

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPATIBILITY = {
  'A+':  { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'A-':  { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
  'B+':  { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'B-':  { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
  'O+':  { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
  'O-':  { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
};

export const BLOOD_GROUP_COLORS = {
  'A+':  'bg-red-100 text-red-700 border-red-300',
  'A-':  'bg-rose-100 text-rose-700 border-rose-300',
  'B+':  'bg-orange-100 text-orange-700 border-orange-300',
  'B-':  'bg-amber-100 text-amber-700 border-amber-300',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-300',
  'AB-': 'bg-violet-100 text-violet-700 border-violet-300',
  'O+':  'bg-blue-100 text-blue-700 border-blue-300',
  'O-':  'bg-cyan-100 text-cyan-700 border-cyan-300',
};

export const URGENCY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

export const URGENCY_COLORS = {
  Critical: 'bg-red-100 text-red-800 border-red-300',
  High:     'bg-orange-100 text-orange-800 border-orange-300',
  Medium:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  Low:      'bg-green-100 text-green-800 border-green-300',
};

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Ranchi',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan', 'Vasai', 'Varanasi',
];

// Sample donors for demo purposes (shown when Firestore is empty)
export const SAMPLE_DONORS = [
  {
    id: 'sample-1',
    fullName: 'Arjun Sharma',
    bloodGroup: 'O+',
    city: 'Mumbai',
    phone: '+91 98765 43210',
    email: 'arjun@example.com',
    age: 28,
    gender: 'Male',
    isAvailable: true,
    lastDonationDate: '2024-11-15',
  },
  {
    id: 'sample-2',
    fullName: 'Priya Patel',
    bloodGroup: 'A+',
    city: 'Delhi',
    phone: '+91 87654 32109',
    email: 'priya@example.com',
    age: 32,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: '2024-10-20',
  },
  {
    id: 'sample-3',
    fullName: 'Ravi Kumar',
    bloodGroup: 'B+',
    city: 'Bangalore',
    phone: '+91 76543 21098',
    email: 'ravi@example.com',
    age: 25,
    gender: 'Male',
    isAvailable: false,
    lastDonationDate: '2025-01-05',
  },
  {
    id: 'sample-4',
    fullName: 'Sunita Singh',
    bloodGroup: 'AB-',
    city: 'Hyderabad',
    phone: '+91 65432 10987',
    email: 'sunita@example.com',
    age: 29,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: '2024-12-01',
  },
  {
    id: 'sample-5',
    fullName: 'Kiran Reddy',
    bloodGroup: 'O-',
    city: 'Chennai',
    phone: '+91 54321 09876',
    email: 'kiran@example.com',
    age: 35,
    gender: 'Male',
    isAvailable: true,
    lastDonationDate: '2024-09-10',
  },
  {
    id: 'sample-6',
    fullName: 'Anjali Desai',
    bloodGroup: 'B-',
    city: 'Pune',
    phone: '+91 43210 98765',
    email: 'anjali@example.com',
    age: 27,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: '2024-11-28',
  },
];

export const STATS = [
  { label: 'Registered Donors', value: '50,000+', icon: 'users' },
  { label: 'Lives Saved', value: '1,20,000+', icon: 'heart' },
  { label: 'Cities Covered', value: '200+', icon: 'map' },
  { label: 'Emergency Requests', value: '10,000+', icon: 'alert' },
];

export const DONATION_TIPS = [
  { title: 'Age Requirement', tip: 'Donors must be between 18–65 years old.' },
  { title: 'Weight Minimum', tip: 'You must weigh at least 50 kg (110 lbs).' },
  { title: 'Hemoglobin Level', tip: 'Hemoglobin should be at least 12.5 g/dL for women, 13.0 g/dL for men.' },
  { title: 'Donation Frequency', tip: 'Whole blood can be donated every 56 days (about 8 weeks).' },
  { title: 'Hydration', tip: 'Drink plenty of water 24 hours before donating.' },
  { title: 'No Alcohol', tip: 'Avoid alcohol for at least 24 hours before donation.' },
];
