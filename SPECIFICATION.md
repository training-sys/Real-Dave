# RealE-Market CRM Specification

## 1. Theme
**"The All-in-One Real Estate Operating System"**

RealE-Market is designed to be the central nervous system for real estate agencies. It moves beyond simple data storage to become an active participant in the business process—automating marketing, streamlining sales pipelines, and ensuring no lead or payment is ever missed. The theme is **"Actionable Intelligence"**: every screen drives the user toward the next profitable action.

## 2. Targeted Outcome
The primary goal is to **reduce the "Lead-to-Cash" cycle time** by 40% and **eliminate manual follow-up errors**.

**Specific Outcomes:**
*   **Centralized Command**: One place for Properties, Leads, Deals, and Team Management.
*   **Automated Marketing**: Launch Facebook/Instagram ads directly from the CRM (Advt. Booster).
*   **Seamless Workflow**: Convert a Lead -> Deal -> Booking -> Payment in 4 clicks.
*   **Zero Leakage**: Automated reminders for tasks, payments, and site visits ensure 100% follow-up rate.
*   **Data Portability**: Full Import/Export capabilities for total data ownership.

## 3. Feature Count & Specification

**Total Distinct Features: 45+**

### A. Inventory Management (5 Features)
1.  **Property CRUD**: Add, Edit, Delete, View detailed property data.
2.  **Bulk Import**: Upload properties via CSV/Excel.
3.  **Smart Filters**: Search by Area, Price, Type, BHK.
4.  **PDF Brochure Gen**: Instant professional brochure creation with QR/Maps.
5.  **Media Gallery**: Carousel view for property images.

### B. Lead & Sales Management (8 Features)
6.  **Inquiry Tracking**: Capture leads with Source, Budget, and Interest.
7.  **Lead Import**: Bulk CSV import for leads.
8.  **Pipeline View**: Kanban-style "Deals" board (Qualified -> Negotiation -> Closed).
9.  **Workflow Automation**: One-click "Convert Inquiry to Deal".
10. **One-click "Convert Deal to Booking"**.
11. **WhatsApp Integration**: Instant "Hi [Name]" messages.
12. **Location Capture**: Save Google Maps location for leads.
13. **Contact Management**: Separate directory for Owners, Clients, and Agents.

### C. Operations & Task Management (6 Features)
14. **Task Scheduler**: Create tasks with Due Dates and Priorities.
15. **Smart Notifications**: Alerts for due tasks and payments.
16. **Site Visit Reminders**: Specialized WhatsApp templates for visits.
17. **Team Management**: Add Sub-users (Sales/Manager) with roles.
18. **Role-Based Access Control (RBAC)**: Granular permissions (View/Edit/Delete).
19. **Loan Tracking**: Simple tracker for client loan applications.

### D. Financials (4 Features)
20. **Booking Management**: Track unit bookings and token amounts.
21. **Payment Tracking**: Log transactions (UPI/Cheque/Cash).
22. **Payment Reminders**: WhatsApp templates for overdue payments.
23. **Revenue Dashboard**: Real-time stats on sold inventory and revenue.

### E. Marketing & Growth (Advt. Booster) (5 Features)
24. **Campaign Builder**: 3-Step wizard for Social Media Ads.
25. **Multi-Platform Support**: Facebook, Instagram, Google, LinkedIn.
26. **Ad Simulation**: Preview ad creatives and audience reach.
27. **Campaign Tracking**: Monitor "Active" vs "Completed" campaigns.
28. **Budget Management**: Track ad spend directly in CRM.

### F. System & Utilities (7 Features)
29. **Dashboard**: High-level view of Tasks, Units, and Revenue.
30. **Data Migration**: Dedicated module for Backup & Restore (JSON).
31. **Master Data Management**: Configure Areas, Amenities, Sources.
32. **Global Search**: Omni-search bar for Properties/Contacts/Deals.
33. **Settings**: Configure Company Logo, Currency, Notifications.
34. **User Guide**: Built-in documentation and help.
35. **Secure Auth**: Login system with password protection.

## 4. Technical Specification
*   **Frontend**: React.js (Vite)
*   **UI Framework**: Ant Design (Enterprise-grade components)
*   **State Management**: React Context API
*   **Persistence**: LocalStorage (Zero-config persistence)
*   **PDF Engine**: @react-pdf/renderer
*   **Icons**: Ant Design Icons
*   **Routing**: React Router DOM v6
