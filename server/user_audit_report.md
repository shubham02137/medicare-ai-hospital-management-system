# User Registry Audit & Cleanup Report

**Date:** 2026-06-06T10:42:06.524Z
**Total Registered Users:** 29

### Classification Summary
* **KEEP:** 22 users (Seed accounts or active records)
* **REVIEW:** 0 users (Empty accounts, verify before removing)
* **DELETE CANDIDATES:** 7 users (Unused test/mock credentials)

### User Audit Registry Table

| User ID | Name | Email | Role | Created Date | Appts | Prescs | Labs | Check-ins | Status | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `usr-001` | Dr. Admin Kumar Updated | admin@medicare.com | `admin` | 2025-01-01 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-002` | Dr. Priya Sharma Updated | doctor@medicare.com | `doctor` | 2025-01-02 | 10 | 5 | 5 | 0 | **KEEP** | Seeded Core System User |
| `usr-003` | Nurse Anjali Patel Updated | nurse@medicare.com | `nurse` | 2025-01-03 | 0 | 0 | 0 | 4 | **KEEP** | Seeded Core System User |
| `usr-004` | Reena Gupta Updated | reception@medicare.com | `receptionist` | 2025-01-04 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-005` | Rahul Verma Updated | patient@medicare.com | `patient` | 2025-01-05 | 5 | 3 | 4 | 1 | **KEEP** | Seeded Core System User |
| `usr-006` | Suresh Reddy Updated | pharma@medicare.com | `pharmacist` | 2025-01-06 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-007` | Meena Iyer Updated | lab@medicare.com | `lab_technician` | 2025-01-07 | 0 | 0 | 4 | 0 | **KEEP** | Seeded Core System User |
| `usr-008` | Dr. Amit Verma | doctor2@medicare.com | `doctor` | 2025-01-08 | 3 | 0 | 1 | 0 | **KEEP** | Seeded Core System User |
| `usr-009` | Dr. Rajesh Gupta | gupta@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-011` | Dr. Neha Singh | singh@medicare.com | `doctor` | 2025-01-08 | 1 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-012` | Dr. Vikram Rao | rao@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-013` | Dr. Rohit Jain | jain@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-014` | Dr. Pooja Kapoor | kapoor@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-015` | Dr. Arjun Mehta | mehta@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-016` | Dr. Kunal Shah | shah@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-017` | Dr. Sneha Nair | nair@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-018` | Dr. Ritu Malhotra | malhotra@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `usr-019` | Dr. Aditya Kapoor | akapoor@medicare.com | `doctor` | 2025-01-08 | 0 | 0 | 0 | 0 | **KEEP** | Seeded Core System User |
| `620d5fd3-8554-4e1f-99a9-0d6a55c719bf` | Test Persistence User | persist_1780664058611@medicare.com | `patient` | 2026-06-05 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
| `fbaf011d-d6e6-4ec4-ae76-8c6a1fafe0a5` | Dr. John Doe | newdoc_1780664068880@medicare.com | `doctor` | 2026-06-05 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
| `c9ad2430-f39e-4e07-8bb5-c9e093cc3933` | Patient | patient@gmail.com | `patient` | 2026-06-05 | 1 | 1 | 0 | 0 | **KEEP** | Active user with 2 linked records |
| `cdbaf56e-6122-48e5-b8c1-4b2f14bbb9be` | Doctor | doctor@gmail.com | `doctor` | 2026-06-05 | 2 | 0 | 0 | 0 | **KEEP** | Active user with 2 linked records |
| `49a4676e-a8aa-4d0a-93fe-ab95f979f88f` | lab | lab@gmail.com | `lab_technician` | 2026-06-05 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
| `8279c2c5-691b-4ab2-b075-88dd8ef74255` | Patient | patientt@gmail.com | `patient` | 2026-06-05 | 7 | 3 | 3 | 0 | **KEEP** | Active user with 13 linked records |
| `e16c380b-cf76-42d5-abb7-51f455b7a555` | Doctor | doctorr@gmail.com | `doctor` | 2026-06-05 | 3 | 4 | 3 | 0 | **KEEP** | Active user with 10 linked records |
| `91c3edc1-d93d-4431-b579-30444e9dc365` | Admin | adminn@gmail.com | `admin` | 2026-06-05 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
| `4c1bf0b4-0eb7-4024-91bc-27aca242482e` | Reception | receptionn@gmail.com | `receptionist` | 2026-06-05 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
| `56a40172-e64d-473d-83e6-5c56b77110b0` | Pharma | pharma@gmail.com | `pharmacist` | 2026-06-06 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
| `51f51bcb-a043-49f9-977e-e31979f0a2a4` | Nurse | nurse@gmail.com | `nurse` | 2026-06-06 | 0 | 0 | 0 | 0 | **DELETE CANDIDATES** | Temporary test account with zero linked records |
