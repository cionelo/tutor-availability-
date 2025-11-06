# **Tutor Availability Dashboard (Operational Scheduling Tool)**

A lightweight, real-time scheduling assistant built to fill workflow gaps in Teachworks, our tutoring operations platform. This tool transforms static availability data into a live, cross-filterable availability dashboard so staff can instantly confirm tutor availability, compare overlapping schedules, and reduce scheduling friction.

### **🎯 Problem**

Teachworks provides basic tutor scheduling and iCal feeds, but it **does not provide real-time availability comparison or subject-based filtering**, creating friction for operations staff.

Scheduling required:

* Clicking multiple tutor profiles  
* Cross-checking calendar feeds manually  
* Manually confirming subject match  
* Calling or messaging tutors for confirmations

This resulted in **slow scheduling decisions** and occasional booking conflicts.

### **🚀 Solution**

I designed and built an **internal scheduling dashboard** that:

* Pulls tutor iCal events from Teachworks  
* Parses availability and assigned sessions  
* References Subjects \+ Availability spreadsheets  
* Calculates **true availability** dynamically  
* Filters by multiple tutors \+ subject match  
* Mirrors Teachworks tutor color identities for UX familiarity  
* Updates automatically every 15 minutes via Apps Script

The result is a **single-screen view** where staff can instantly view and compare tutor availability across date ranges and subject compatibility.

### **🔑 Core Capabilities**

| Capability | Description |
| ----- | ----- |
| Real-time availability | Fetches and merges iCal \+ Google Sheets availability data every 15 min |
| Subject-based filtering | Uses partial-match logic (`CONTAINS`) to allow broad or exact subject matching |
| Tutor comparison | Select multiple tutors to view overlap windows |
| Color-coded UX | Uses identical color scheme as Teachworks for intuitive adoption |
| Admin efficiency | Eliminates manual cross-checking and multi-window scheduling |

### **🧠 Tech Stack**

| Area | Tools |
| ----- | ----- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Google Apps Script |
| Data Source | Teachworks iCal feeds \+ Google Sheets (Employees & Availability) |
| Automation | Apps Script Time-Driven Trigger (15-min refresh) |
| Workflow | Zapier (used to sync team data to internal sheets) |

### **📈 Business Impact**

* ***Heavily*** reduced manual steps for scheduling students  
* Made tutor availability checks **instant**  
* Increased accuracy when assigning/finding substitutes  
* Scaled internal tooling beyond default Teachworks capabilities  
* Foundation for a **future standalone internal tutoring CRM (See Student Tutor Dashboard)**  
  * Employee Data backend \[Teachworks\] introduced to Google Sheets

### **🔄 Architecture Overview**

`Teachworks iCal Feeds  →`    
`Google Apps Script (parsing + caching) →`    
`Google Sheets (Employees + availability store) →`    
`Google Sheets (Actual Availability) →`    
`Front-End Availability UI`

Trigger: Time-based (15-minute) auto-refresh for updates

Optional automation: Zapier syncs Teachworks employee changes into Sheets for future autonomous database \+ scheduling system.

### **📸 Screenshots**

(Add when ready)

### **🧪 Local Demo / Dummy Data Version**

A sanitized version of this project exists (or will exist) to demonstrate:

* Tutor data model  
* Subject matching logic  
* Availability calculations  
* UI/UX interaction

This allows reviewers to test the tool privately without exposing company data.

---

### **🧭 Future Roadmap**

* Live 2-way sync with Teachworks API or Webhooks (if exposed)  
* Full internal scheduling CRM system (removing reliance on spreadsheet middleware)  
* Admin ability to modify availability directly through UI  
* Optional tutor mobile UX to set availability  
* Automatic updates for Employee Data from Teachworks w Zapier

---

### **📂 Repo Structure**

`/frontend  — UI, calendar logic, filters, styles`  
`/backend   — Google Apps Script (GS) logic`  
`/docs      — System architecture + setup guide`

---

### **👤 Built By**

**Nehemiah “Nemo” Cionelo**  
Full-Stack & Marketing Technology Engineer

* Web app architecture  
* No-code \+ automation architecture (Zapier)  
* UX for internal operations tools  
* Data-driven system design

---

### **🛡️ Note**

This repo contains the **frontend only**. Backend Apps Script functions and Sheets schema available upon request or in dummy-data branch.

---

### **💬 Want to Request the Full Version?**

If you're a recruiter or developer evaluating this system, reach out for a walkthrough.

📧 nemocionelo@gmail.com  
🔗 [linkedin.com/in/nehemiah-cionelo](http://linkedin.com/in/nehemiah-cionelo)

🔗 itsnemo.dev