I have analyzed the current system and identified the gaps. I will now proceed to implement the requested features to reach "100% complete" status.

### **Phase 1: Documentation & Feature Counting**
1.  **Create `SPECIFICATION.md`**: A detailed document listing:
    *   **Theme**: "All-in-One Real Estate CRM & Marketing Suite".
    *   **Targeted Outcome**: Streamline lead-to-deal conversion, automate marketing, and centralize operations.
    *   **Feature Count**: I will list and count every module (Properties, Leads, Deals, Tasks, etc.) and their sub-features (Import, Export, PDF, etc.).
    *   **Tech Specs**: React, Ant Design, LocalStorage persistence.

### **Phase 2: Data Enrichment (The "Fill Data" Request)**
2.  **Update `DataContext.jsx`**:
    *   **Significantly expand `initialData`**:
        *   **Properties**: Add 10+ properties with varied statuses (Sold, Blocked, Active) and images.
        *   **Leads**: Add 15+ leads in different stages (New, Follow-up, Closed).
        *   **Deals**: Add 5+ active deals.
        *   **Bookings**: Add 3+ bookings with payment history.
        *   **Tasks**: Add tasks for "Site Visits", "Payment Follow-ups", and "Contract Signing".
    *   *Why*: This ensures every chart in the Dashboard and every list in the app looks "used" and "alive" immediately.

### **Phase 3: Functional Enhancements**
3.  **Smart Workflow (Streamlining)**:
    *   **Inquiries Page**: Add a **"Convert to Deal"** button. Clicking it will open a pre-filled "Add Deal" drawer with the lead's name and interest.
    *   **Deals Page**: Add a **"Convert to Booking"** button. Clicking it will open a pre-filled "Add Booking" drawer.
    *   *Result*: A seamless flow: **Lead -> Deal -> Booking**.

4.  **Communication & Notifications**:
    *   **MainLayout**: Make the **Notification Bell** functional. It will show a dropdown of:
        *   Tasks due today.
        *   Overdue payments.
    *   **WhatsApp Integration**:
        *   **Bookings**: Add **"Send Payment Reminder"** button (sends a template like "Dear [Name], payment of [Amount] is pending...").
        *   **Tasks**: Add **"Send Site Visit Reminder"** button.
        *   **Properties**: Enhance "Share" to include a promotional message.

5.  **PDF Upgrade**:
    *   **PropertyBrochure**: Add a clickable **"View on Google Maps"** link in the generated PDF using the property's `locationUrl`.

### **Phase 4: Verification**
*   I will verify that data appears correctly in the Dashboard widgets, the Advt Booster, and all lists.

This plan addresses every point in your request: from documentation to specific functional buttons like "Payment Reminder" and "Site Visit".