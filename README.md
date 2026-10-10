\# Event Ticketing and Venue Booking System (RESTful Web API)



A full-stack RESTful Web API and multi-portal event management system built for \*\*SWC3633/SWC4443 Web API Development\*\*\[cite: 1, 4]. The system handles authentication, role-based access control, event scheduling, venue capacities, ticket inventory transactions, and external QR code integration\[cite: 4, 5, 6].



\---



\## 👥 Project Team \& Work Distribution



| Member | Assigned Role \& Frontend Scope | Backend Responsibilities |

| :--- | :--- | :--- |

| \*\*Paan\*\* | \*\*Customer Portal\*\* (`/frontend-customer`) | Architecture setup, MySQL pool connection, JWT Auth, RBAC guards, centralized error handling, `/api/users`\[cite: 5, 8] |

| \*\*Hanis\*\* | \*\*Organiser Portal\*\* (`/frontend-organiser`)\[cite: 1, 10] | Relational database schema \& seed scripts, venue capacity logic, `/api/venues`, `/api/events` (search, pagination, sorting)\[cite: 4, 5, 8] |

| \*\*Danny\*\* | \*\*Admin Portal\*\* (`/frontend-admin`)\[cite: 1, 10] | Ticket transactions, `/api/bookings` (booking \& cancellation logic), Express rate limiting, Morgan logging, external QR Code API\[cite: 4, 5, 6] |



\---



\## 📁 Repository Structure



```text

WebAPI\_Event\_Ticketing\_System/

├── backend/                       # Shared Node.js \& Express RESTful API\[cite: 1, 6]

│   ├── config/                    # Database connection pool (MySQL2)

│   ├── controllers/               # Business logic controllers

│   ├── middleware/                # JWT auth, RBAC guard, rate limiting, error handling

│   ├── routes/                    # API endpoints (/users, /venues, /events, /bookings)

│   ├── sql/                       # DDL schema.sql and DML seed.sql

│   ├── .env.example               # Environment variables configuration template

│   ├── package.json

│   └── server.js                  # Application entry point

├── frontend-customer/             # Paan: Customer browsing, ticket purchase \& QR viewer\[cite: 1, 10]

├── frontend-organiser/            # Hanis: Organiser event publication \& venue capacity\[cite: 1, 10]

├── frontend-admin/                # Danny: Admin global booking monitoring \& audits\[cite: 1, 10]

├── docs/                          # Postman collections, ERD, and report deliverables

└── README.md

