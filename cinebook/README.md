# CineBook — Cinema Ticket Booking System

A web-based cinema ticket booking system that allows customers to browse movies, select screenings, pick seats, and pay online. Administrators manage movies, screenings, seats, customers, and bookings through a protected dashboard.

**Live System:** [http://cinemabookings.atwebpages.com/](http://cinemabookings.atwebpages.com/)

---

## Members

1. Kurt Aichan Vinson
2. Meicca Charrise Canete
3. Ralph Humphrey Diwa
4. Ronan Remopalos
5. Manuel Jun Tresquio

---

## System Description

CineBook is a cinema ticket booking platform built with vanilla HTML, CSS, and JavaScript (ES Modules). The system supports two distinct user roles:

**Customer** — Registers or logs in using their email, browses currently showing movies, selects a screening by date and time, picks seats from an interactive seat map, chooses a payment method (GCash, Maya, or Cash), and confirms their booking. A unique Booking ID and Ticket ID are issued upon confirmation. Customers can view all their bookings in the My Bookings section.

**Administrator** — Accesses a password-protected dashboard to manage the full lifecycle of cinema operations: adding and editing movies, scheduling screenings, configuring theater seats, viewing all customer bookings, and cancelling bookings when needed.

---

## Repository Structure

```
cinebook/
├── index.html      # Main HTML shell (all pages/views + Open Website banner)
├── main.css        # All application styles
├── db.js           # localStorage database layer (movies, screenings, seats, customers, bookings)
├── core.js         # Shared utilities: state management, router, toast, modal
├── pages.js        # Page logic: Home, Auth, My Bookings, Booking Wizard
├── admin.js        # Full admin dashboard logic
└── main.js         # Application entry point — wires all components together
```

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript (ES Modules)       |
| Storage    | Browser localStorage (no backend required)         |
| Fonts      | Google Fonts (Playfair Display, DM Sans)           |
| Hosting    | Static hosting (any web server or file:// works)   |

---

## System Flowcharts

### Admin Flow

```
+-------+
| Start |
+-------+
    |
    v
+-------------------------------+
| Click Admin in navigation     |
+-------------------------------+
    |
    v
+----------------------+       +----------------+
| Password correct?    |--No-->| Access denied  |--[Retry]-->+
+----------------------+       +----------------+            |
    |                                                        |
   Yes                                              (back to Click Admin)
    |
    v
+-------------------------------+
|       Admin Dashboard         |
+-------------------------------+
    |
    +----------+----------+----------+----------+----------+
    |          |          |          |          |          |
    v          v          v          v          v
+--------+ +----------+ +--------+ +-----------+ +---------+
| Manage | | Manage   | | Manage | | Manage    | | View    |
| Movies | | Screening| | Seats  | | Customers | | Booking |
+--------+ +----------+ +--------+ +-----------+ +---------+
    |          |          |          |          |          |
    v          v          v          v          v
+--------+ +----------+ +--------+ +-----------+ +---------+
|Add/Edit| |Add/Edit  | |Add seat| |Edit       | |View all |
|Delete  | |Delete    | |Remove  | |Delete     | |Cancel   |
+--------+ +----------+ +--------+ +-----------+ +---------+
    |          |          |          |          |          |
    +----------+----------+----------+----------+----------+
                               |
                               v
              +--------------------------------+
              |      Continue managing?        |
              +--------------------------------+
                   |                |
                  Yes               No
                   |                |
    (back to Admin Dashboard)       v
                          +--------------------+
                          |       Logout       |
                          +--------------------+
                                   |
                                   v
                                +-----+
                                | End |
                                +-----+
```

---

### Customer Flow

```
+-------+
| Start |
+-------+
    |
    v
+---------------------------+
| Visit CineBook site       |
+---------------------------+
    |
    v
+------------------+
| Has account?     |
+------------------+
    |           |
   Yes          No
    |           |
    v           v
+--------+  +----------+
| Log in |  | Register |
+--------+  +----------+
    |           |
    +-----------+
          |
          v
+-------------------------------+
| Browse now showing movies     |
+-------------------------------+
          |
          v
+-------------------------------+
| Step 1: Select screening      |
| Movie, date, time, theater    |
+-------------------------------+
          |
          v
+-------------------------------+
| Step 2: Pick seats            |
| Interactive seat map          |
+-------------------------------+
          |
          v
+-------------------------------+
| Step 3: Choose payment        |
| GCash, Maya, or Cash          |
+-------------------------------+
          |
          v
+-------------------------------+
| Step 4: Review and confirm    |
| Verify all booking details    |
+-------------------------------+
          |
          v
+-------------------------------+
| Booking confirmed             |
| Booking ID and Ticket ID      |
| issued                        |
+-------------------------------+
          |
          v
+-------------------------------+
| View in My Bookings           |
+-------------------------------+
          |
          v
+-------+
|  End  |
+-------+
```

---

## Data Schema (localStorage)

| Store        | Key Columns                                                              |
|--------------|--------------------------------------------------------------------------|
| `movies`     | `movie_id`, `title`, `genre`, `duration`, `rating`, `description`        |
| `screenings` | `screening_id`, `movie_id`, `theater`, `show_date`, `show_time`          |
| `seats`      | `seat_id`, `theater`, `seat_number`                                      |
| `customers`  | `customer_id`, `name`, `email`, `phone`                                  |
| `bookings`   | `booking_id`, `customer_id`, `screening_id`, `seat_id`, `payment_method`, `amount`, `booking_date`, `ticket_id` |

Ticket price is fixed at PHP 250 per seat.

---

## Running Locally

1. Download or clone the repository.
2. Open `index.html` directly in a browser, **or** serve it with any static web server:

```bash
# Using Node
npx serve .

# Using Python
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

> **No backend or database setup required.** All data is stored in the browser's localStorage and is seeded automatically on first load.

---

## Admin Access

Password: `admin123`

Navigate to the **Admin** section from the header navigation.
