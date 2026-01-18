import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Mock Data
  const initialProperties = [
    { key: '1', title: 'Luxury Villa in Downtown', price: 12000000, type: 'Villa', status: 'Active', area: 'Downtown', bedrooms: 4, bathrooms: 3 },
    { key: '2', title: 'Cozy Apartment', price: 4500000, type: 'Apartment', status: 'Sold', area: 'Suburbs', bedrooms: 2, bathrooms: 1 },
    { key: '3', title: 'Sea View Penthouse', price: 25000000, type: 'Apartment', status: 'Active', area: 'Downtown', bedrooms: 5, bathrooms: 5 },
    { key: '4', title: 'Green Valley Plot', price: 1500000, type: 'Plot', status: 'Active', area: 'Suburbs', bedrooms: 0, bathrooms: 0 },
    { key: '5', title: 'Commercial Office Space', price: 8500000, type: 'Commercial', status: 'Available', area: 'Downtown', bedrooms: 0, bathrooms: 2 },
    { key: '6', title: 'Suburban Family Home', price: 6500000, type: 'Villa', status: 'Under Offer', area: 'Suburbs', bedrooms: 3, bathrooms: 2 },
    { key: '7', title: 'Studio Apartment', price: 2800000, type: 'Apartment', status: 'Available', area: 'Downtown', bedrooms: 1, bathrooms: 1 },
    { key: '8', title: 'Riverfront Villa', price: 18000000, type: 'Villa', status: 'Blocked', area: 'Suburbs', bedrooms: 4, bathrooms: 4 },
  ];

  const initialInquiries = [
    { key: '1', name: 'John Doe', contact: 'john@example.com', interest: '2BHK Apartment', status: 'New', source: 'Website', budget: '50L-60L' },
    { key: '2', name: 'Jane Smith', contact: 'jane@example.com', interest: 'Villa', status: 'Follow Up', source: 'Referral', budget: '1Cr+' },
    { key: '3', name: 'Robert Johnson', contact: '+91 98765 43210', interest: 'Commercial', status: 'New', source: 'Newspaper', budget: '80L-90L' },
    { key: '4', name: 'Emily Davis', contact: 'emily@example.com', interest: 'Plot', status: 'Closed', source: 'Website', budget: '20L-30L' },
    { key: '5', name: 'Michael Brown', contact: '+91 88888 77777', interest: '3BHK', status: 'Follow Up', source: 'Referral', budget: '70L-80L' },
    { key: '6', name: 'Sarah Wilson', contact: 'sarah@example.com', interest: 'Penthouse', status: 'New', source: 'Facebook', budget: '2Cr+' },
  ];

  const initialTasks = [
    { key: '1', title: 'Call John Doe regarding Villa view', dueDate: new Date().toISOString().split('T')[0], priority: 'High', status: 'Pending', assignee: 'Admin', description: 'Discuss price negotiation.' },
    { key: '2', title: 'Prepare contract for Green Meadows', dueDate: '2026-02-15', priority: 'Medium', status: 'In Progress', assignee: 'Dwight', description: 'Draft the initial sale agreement.' },
    { key: '3', title: 'Site Visit with Robert', dueDate: new Date().toISOString().split('T')[0], priority: 'High', status: 'Pending', assignee: 'Sales User 1', description: 'Show Commercial Office Space.' },
    { key: '4', title: 'Payment Follow-up: Emily', dueDate: '2026-01-20', priority: 'High', status: 'Pending', assignee: 'Manager 1', description: 'Collect token amount.' },
    { key: '5', title: 'Update Website Listings', dueDate: '2026-01-25', priority: 'Low', status: 'Completed', assignee: 'Admin', description: 'Remove sold properties.' },
  ];

  const initialDeals = [
    { key: '1', title: 'Luxury Villa Sale', client: 'John Doe', value: 12000000, stage: 'Negotiation', agent: 'Michael' },
    { key: '2', title: 'Downtown Apt Lease', client: 'Jane Smith', value: 45000, stage: 'Qualified', agent: 'Dwight' },
    { key: '3', title: 'Office Space Sale', client: 'Robert Johnson', value: 8500000, stage: 'Proposal', agent: 'Sales User 1' },
    { key: '4', title: 'Plot Investment', client: 'Emily Davis', value: 1500000, stage: 'Closed Won', agent: 'Manager 1' },
  ];

  const initialProjects = [
    { key: '1', name: 'Skyline Heights', location: 'Downtown', status: 'Under Construction', totalUnits: 120, soldUnits: 45, completion: 60 },
    { key: '2', name: 'Green Meadows', location: 'Suburbs', status: 'Ready to Move', totalUnits: 50, soldUnits: 48, completion: 100 },
    { key: '3', name: 'River View Residency', location: 'Riverside', status: 'Pre-Launch', totalUnits: 200, soldUnits: 10, completion: 10 },
  ];

  const initialContacts = [
    { key: '1', name: 'Michael Scott', role: 'Client', phone: '+1 555 123 4567', email: 'michael@dundermifflin.com', source: 'Referral', status: 'Active' },
    { key: '2', name: 'Dwight Schrute', role: 'Agent', phone: '+1 555 987 6543', email: 'dwight@farms.com', source: 'Website', status: 'Active' },
    { key: '3', name: 'Jim Halpert', role: 'Client', phone: '+1 555 111 2222', email: 'jim@dundermifflin.com', source: 'Facebook', status: 'Active' },
    { key: '4', name: 'Pam Beesly', role: 'Client', phone: '+1 555 333 4444', email: 'pam@dundermifflin.com', source: 'Walk-in', status: 'Inactive' },
  ];

  const initialLoans = [
    { key: '1', name: 'John Doe', amount: 4500000, bank: 'HDFC Bank', status: 'Pending' },
    { key: '2', name: 'Jane Smith', amount: 12000000, bank: 'SBI', status: 'Approved' },
    { key: '3', name: 'Robert Johnson', amount: 6000000, bank: 'ICICI Bank', status: 'Rejected' },
  ];

  const initialBookings = [
    { key: '1', unitId: '2', contactId: '3', bookingDate: '2026-01-10', status: 'Confirmed', amount: 50000, paymentStatus: 'Paid' },
    { key: '2', unitId: '4', contactId: '4', bookingDate: '2026-01-12', status: 'Confirmed', amount: 25000, paymentStatus: 'Pending' },
  ];

  const initialTransactions = [
    { key: '1', bookingId: '1', amount: 50000, date: '2026-01-10', type: 'UPI', reference: 'UPI123456' }
  ];

  const initialSubUsers = [
    { key: '1', name: 'Sales User 1', email: 'sales1@realdave.com', role: 'Sales', status: 'Active' },
    { key: '2', name: 'Manager 1', email: 'manager1@realdave.com', role: 'Manager', status: 'Active' },
  ];

  const initialPermissions = {
    Admin: {
      Properties: { view: true, create: true, edit: true, delete: false },
      Inquiries: { view: true, create: true, edit: true, delete: true },
      Deals: { view: true, create: false, edit: false, delete: false },
      Contacts: { view: true, create: true, edit: true, delete: false },
      Loans: { view: true, create: true, edit: true, delete: false },
      Tasks: { view: true, create: true, edit: true, delete: false },
      Projects: { view: true, create: true, edit: true, delete: false },
      Users: { view: true, create: false, edit: false, delete: false },
      Settings: { view: true, create: true, edit: true, delete: false },
      PaymentDetails: { view: true, create: true, edit: true, delete: false },
      Bookings: { view: true, create: true, edit: true, delete: false },
    },
    Sales: {
      Properties: { view: true, create: true, edit: true, delete: false },
      Inquiries: { view: true, create: true, edit: true, delete: false },
      Deals: { view: true, create: true, edit: false, delete: false },
      Contacts: { view: true, create: true, edit: true, delete: false },
      Loans: { view: true, create: true, edit: false, delete: false },
      Tasks: { view: true, create: true, edit: true, delete: false },
      Projects: { view: true, create: false, edit: false, delete: false },
      Users: { view: false, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
      PaymentDetails: { view: true, create: false, edit: false, delete: false },
      Bookings: { view: true, create: false, edit: false, delete: false },
    },
    Manager: {
      Properties: { view: true, create: true, edit: true, delete: false },
      Inquiries: { view: true, create: true, edit: true, delete: true },
      Deals: { view: true, create: true, edit: true, delete: false },
      Contacts: { view: true, create: true, edit: true, delete: false },
      Loans: { view: true, create: true, edit: true, delete: false },
      Tasks: { view: true, create: true, edit: true, delete: false },
      Projects: { view: true, create: true, edit: true, delete: false },
      Users: { view: true, create: true, edit: true, delete: false },
      Settings: { view: true, create: true, edit: true, delete: false },
      PaymentDetails: { view: true, create: true, edit: true, delete: false },
      Bookings: { view: true, create: true, edit: true, delete: false },
    },
  };

  // Master Data Initials
  const initialAreas = [{ key: '1', name: 'Downtown' }, { key: '2', name: 'Suburbs' }];
  const initialSubTypes = [{ key: '1', name: 'Apartment' }, { key: '2', name: 'Villa' }, { key: '3', name: 'Plot' }];
  const initialSocieties = [{ key: '1', name: 'Green Valley' }, { key: '2', name: 'Royal Heights' }];
  const initialFeatures = [{ key: '1', name: 'Swimming Pool' }, { key: '2', name: 'Gym' }];
  const initialAmenities = [{ key: '1', name: 'Parking' }, { key: '2', name: 'Security' }];
  const initialSources = [{ key: '1', name: 'Newspaper' }, { key: '2', name: 'Referral' }, { key: '3', name: 'Website' }];
  const initialContactGroups = [{ key: '1', name: 'Investors' }, { key: '2', name: 'Builders' }];
  const initialCommissions = [{ key: '1', name: '2% Standard' }, { key: '2', name: '5% Premium' }];

  // State
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('properties');
    return saved ? JSON.parse(saved) : initialProperties;
  });

  const [inquiries, setInquiries] = useState(() => {
    const saved = localStorage.getItem('inquiries');
    return saved ? JSON.parse(saved) : initialInquiries;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem('deals');
    return saved ? JSON.parse(saved) : initialDeals;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : initialLoans;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [subUsers, setSubUsers] = useState(() => {
    const saved = localStorage.getItem('subUsers');
    // Pre-seed some default users if empty for testing
    if (!saved) {
      const defaultUsers = [
        { key: '1', name: 'Admin User', email: 'admin@example.com', role: 'Administrator', password: 'admin', phone: '1234567890' },
        { key: '2', name: 'Manager User', email: 'manager@example.com', role: 'Manager', password: 'manager', phone: '0987654321' },
        { key: '3', name: 'Sales User', email: 'sales@example.com', role: 'Sales', password: 'sales', phone: '1122334455' }
      ];
      return defaultUsers;
    }
    return JSON.parse(saved);
  });

  const [viewedProperties, setViewedProperties] = useState(() => {
    const saved = localStorage.getItem('viewedProperties');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedInquiries, setViewedInquiries] = useState(() => {
    const saved = localStorage.getItem('viewedInquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('campaigns');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('paymentMethods');
    return saved ? JSON.parse(saved) : [];
  });

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : initialPermissions;
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Admin User',
      email: 'admin@realdave.com',
      phone: '+1 123 456 7890',
      role: 'Administrator',
      status: 'Active'
    };
  });

  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      companyName: 'RealE-Market',
      website: 'https://realdave.com',
      language: 'English',
      emailNotifs: true,
      smsNotifs: false,
      leadAlerts: true,
      whatsappEnabled: false,
      whatsappNumber: '',
      whatsappTemplate: 'Hi {name}, thank you for your interest in our properties.',
      whatsappConnected: false,
      companyLogo: '',
      appLogoUrl: '',
      subscriberLogoUrl: ''
    };
  });

  // Master Data State
  const [areas, setAreas] = useState(() => JSON.parse(localStorage.getItem('areas')) || initialAreas);
  const [subTypes, setSubTypes] = useState(() => JSON.parse(localStorage.getItem('subTypes')) || initialSubTypes);
  const [societies, setSocieties] = useState(() => JSON.parse(localStorage.getItem('societies')) || initialSocieties);
  const [features, setFeatures] = useState(() => JSON.parse(localStorage.getItem('features')) || initialFeatures);
  const [amenities, setAmenities] = useState(() => JSON.parse(localStorage.getItem('amenities')) || initialAmenities);
  const [sources, setSources] = useState(() => JSON.parse(localStorage.getItem('sources')) || initialSources);
  const [contactGroups, setContactGroups] = useState(() => JSON.parse(localStorage.getItem('contactGroups')) || initialContactGroups);
  const [commissions, setCommissions] = useState(() => JSON.parse(localStorage.getItem('commissions')) || initialCommissions);

  // Effects to persist data
  useEffect(() => localStorage.setItem('properties', JSON.stringify(properties)), [properties]);
  useEffect(() => localStorage.setItem('inquiries', JSON.stringify(inquiries)), [inquiries]);
  useEffect(() => localStorage.setItem('tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('deals', JSON.stringify(deals)), [deals]);
  useEffect(() => localStorage.setItem('projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('contacts', JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem('loans', JSON.stringify(loans)), [loans]);
  useEffect(() => localStorage.setItem('bookings', JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('userProfile', JSON.stringify(userProfile)), [userProfile]);
  useEffect(() => localStorage.setItem('appSettings', JSON.stringify(appSettings)), [appSettings]);
  useEffect(() => localStorage.setItem('subUsers', JSON.stringify(subUsers)), [subUsers]);
  useEffect(() => localStorage.setItem('viewedProperties', JSON.stringify(viewedProperties)), [viewedProperties]);
  useEffect(() => localStorage.setItem('viewedInquiries', JSON.stringify(viewedInquiries)), [viewedInquiries]);
  useEffect(() => localStorage.setItem('campaigns', JSON.stringify(campaigns)), [campaigns]);
  useEffect(() => localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods)), [paymentMethods]);
  useEffect(() => localStorage.setItem('permissions', JSON.stringify(permissions)), [permissions]);

  // Master Data Persistence
  useEffect(() => localStorage.setItem('areas', JSON.stringify(areas)), [areas]);
  useEffect(() => localStorage.setItem('subTypes', JSON.stringify(subTypes)), [subTypes]);
  useEffect(() => localStorage.setItem('societies', JSON.stringify(societies)), [societies]);
  useEffect(() => localStorage.setItem('features', JSON.stringify(features)), [features]);
  useEffect(() => localStorage.setItem('amenities', JSON.stringify(amenities)), [amenities]);
  useEffect(() => localStorage.setItem('sources', JSON.stringify(sources)), [sources]);
  useEffect(() => localStorage.setItem('contactGroups', JSON.stringify(contactGroups)), [contactGroups]);
  useEffect(() => localStorage.setItem('commissions', JSON.stringify(commissions)), [commissions]);

  // Actions
  const addProperty = (item) => setProperties([...properties, { key: Date.now().toString(), ...item }]);
  const updateProperty = (updatedItem) => setProperties(properties.map(p => p.key === updatedItem.key ? updatedItem : p));
  const deleteProperty = (key) => setProperties(properties.filter(p => p.key !== key));

  const addInquiry = (item) => setInquiries([...inquiries, { key: Date.now().toString(), ...item }]);
  const updateInquiry = (updatedItem) => setInquiries(inquiries.map(i => i.key === updatedItem.key ? updatedItem : i));
  const deleteInquiry = (key) => setInquiries(inquiries.filter(i => i.key !== key));

  const addTask = (item) => setTasks([...tasks, { key: Date.now().toString(), ...item }]);
  const updateTask = (updatedItem) => setTasks(tasks.map(t => t.key === updatedItem.key ? updatedItem : t));
  const deleteTask = (key) => setTasks(tasks.filter(t => t.key !== key));

  const addDeal = (item) => setDeals([...deals, { key: Date.now().toString(), ...item }]);
  const updateDeal = (updatedItem) => setDeals(deals.map(d => d.key === updatedItem.key ? updatedItem : d));
  const deleteDeal = (key) => setDeals(deals.filter(d => d.key !== key));

  const addProject = (item) => setProjects([...projects, { key: Date.now().toString(), ...item }]);
  const updateProject = (updatedItem) => setProjects(projects.map(p => p.key === updatedItem.key ? updatedItem : p));
  const deleteProject = (key) => setProjects(projects.filter(p => p.key !== key));

  const addContact = (item) => setContacts([...contacts, { key: Date.now().toString(), ...item }]);
  const updateContact = (updatedItem) => setContacts(contacts.map(c => c.key === updatedItem.key ? updatedItem : c));
  const deleteContact = (key) => setContacts(contacts.filter(c => c.key !== key));

  const addLoan = (item) => setLoans([...loans, { key: Date.now().toString(), ...item }]);
  const updateLoan = (updatedItem) => setLoans(loans.map(l => l.key === updatedItem.key ? updatedItem : l));
  const deleteLoan = (key) => setLoans(loans.filter(l => l.key !== key));

  const addBooking = (item) => setBookings([...bookings, { key: Date.now().toString(), ...item }]);
  const updateBooking = (updatedItem) => setBookings(bookings.map(b => b.key === updatedItem.key ? updatedItem : b));
  const deleteBooking = (key) => setBookings(bookings.filter(b => b.key !== key));

  const addTransaction = (item) => setTransactions([...transactions, { key: Date.now().toString(), ...item }]);
  const updateTransaction = (updatedItem) => setTransactions(transactions.map(t => t.key === updatedItem.key ? updatedItem : t));
  const deleteTransaction = (key) => setTransactions(transactions.filter(t => t.key !== key));

  const addSubUser = (item) => setSubUsers([...subUsers, { key: Date.now().toString(), ...item }]);
  const updateSubUser = (updatedItem) => setSubUsers(subUsers.map(u => u.key === updatedItem.key ? updatedItem : u));
  const deleteSubUser = (key) => setSubUsers(subUsers.filter(u => u.key !== key));

  const logPropertyView = (propertyId, propertyTitle, user) => {
    const newView = {
      key: Date.now().toString(),
      propertyId,
      propertyTitle,
      userId: user.email, // using email as unique identifier
      userName: user.name,
      userRole: user.role,
      viewedAt: new Date().toLocaleString(),
      timestamp: Date.now()
    };
    setViewedProperties(prev => [newView, ...prev]);
  };

  const logInquiryView = (inquiryId, inquiryName, user) => {
    const newView = {
      key: Date.now().toString(),
      inquiryId,
      inquiryName,
      userId: user.email,
      userName: user.name,
      userRole: user.role,
      viewedAt: new Date().toLocaleString(),
      timestamp: Date.now()
    };
    setViewedInquiries(prev => [newView, ...prev]);
  };

  const addCampaign = (item) => setCampaigns([...campaigns, { key: Date.now().toString(), ...item }]);
  const updateCampaign = (updatedItem) => setCampaigns(campaigns.map(c => c.key === updatedItem.key ? updatedItem : c));
  const deleteCampaign = (key) => setCampaigns(campaigns.filter(c => c.key !== key));

  const addPaymentMethod = (item) => setPaymentMethods([...paymentMethods, { key: Date.now().toString(), ...item }]);
  const updatePaymentMethod = (updatedItem) => setPaymentMethods(paymentMethods.map(p => p.key === updatedItem.key ? updatedItem : p));
  const deletePaymentMethod = (key) => setPaymentMethods(paymentMethods.filter(p => p.key !== key));

  const updateTaskStatus = (key) => {
    setTasks(tasks.map(t => t.key === key ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t));
  };

  const value = {
    properties, addProperty, updateProperty, deleteProperty,
    inquiries, addInquiry, updateInquiry, deleteInquiry,
    tasks, addTask, updateTask, deleteTask, updateTaskStatus,
    deals, addDeal, updateDeal, deleteDeal,
    projects, addProject, updateProject, deleteProject,
    contacts, addContact, updateContact, deleteContact,
    loans, addLoan, updateLoan, deleteLoan,
    bookings, addBooking, updateBooking, deleteBooking,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    subUsers, addSubUser, updateSubUser, deleteSubUser,
    viewedProperties, logPropertyView,
    viewedInquiries, logInquiryView,
    campaigns, addCampaign, updateCampaign, deleteCampaign,
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    userProfile, setUserProfile,
    appSettings, setAppSettings,
    permissions, setPermissions,
    areas, setAreas,
    subTypes, setSubTypes,
    societies, setSocieties,
    features, setFeatures,
    amenities, setAmenities,
    sources, setSources,
    contactGroups, setContactGroups,
    commissions, setCommissions
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
