# Frontend API Documentation (GET Endpoints Only)

> [!NOTE]
> This documentation covers all **GET-only** endpoints available for frontend integration. These endpoints do not require CSRF tokens and are safe for read-only operations.

## Base URL
```
http://127.0.0.1:8000/api/
```

---

## Table of Contents

### Core Data APIs
- [Get Execom Data by Year](#get-execom-data-by-year)
- [Get All Years](#get-all-years)
- [Get Events](#get-events)
- [Get Gallery Images](#get-gallery-images)
- [Get All Societies](#get-all-societies)
- [Get Society Detail](#get-society-detail)
- [Get Years by Category](#get-years-by-category)

### Admin & Management APIs
- [Get Roles by Society](#get-roles-by-society)
- [Get All Admins](#get-all-admins)

### Dashboard URLs
- [Dashboard Home](#dashboard-home)
- [Section Dashboard](#section-dashboard)

---

## Core Data APIs

### Get Execom Data by Year

Retrieve executive committee members for a specific year, organized by society.

**Endpoint:** `GET /api/GetExecomDataByYear/<year>/`

**Parameters:**
- `year` (path parameter) - The year to fetch execom data for (e.g., 2025)

**Example Request:**
```javascript
fetch('/api/GetExecomDataByYear/2025/')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Example URL:**
```
GET /api/GetExecomDataByYear/2025/
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "IEEE": [
      {
        "year": 2025,
        "name": "John Doe",
        "role": "Chair",
        "photo_url": "https://imageserver.com/photo.jpg",
        "email": "john@example.com",
        "linkedin": "https://linkedin.com/in/john",
        "instagram": "https://instagram.com/johndoe",
        "github": "https://github.com/johndoe",
        "website": "https://johndoe.dev"
      }
    ],
    "IEEE-CS": [
      {
        "year": 2025,
        "name": "Jane Smith",
        "role": "Vice Chair",
        "photo_url": "https://imageserver.com/photo2.jpg",
        "email": "jane@example.com",
        "linkedin": "",
        "instagram": "",
        "github": "",
        "website": ""
      }
    ]
  }
}
```

**Response Fields:**
- `status` - Success or error status
- `data` - Object containing societies as keys
  - Each society contains an array of member objects
  - `year` - Year of the execom
  - `name` - Full name of the member
  - `role` - Position/role in the committee
  - `photo_url` - URL to member's photo
  - `email` - Email address (optional)
  - `linkedin` - LinkedIn profile URL (optional)
  - `instagram` - Instagram profile URL (optional)
  - `github` - GitHub profile URL (optional)
  - `website` - Personal website URL (optional)

[Back to top](#table-of-contents)

---

### Get All Years

Retrieve all years for which execom data exists.

**Endpoint:** `GET /api/allyears/`

**Example Request:**
```javascript
fetch('/api/allyears/')
  .then(response => response.json())
  .then(data => console.log(data.years));
```

**Example URL:**
```
GET /api/allyears/
```

**Response:**
```json
{
  "years": [2025, 2024, 2023, 2022]
}
```

**Response Fields:**
- `years` - Array of years (integers) in descending order

**Use Case:**
Use this endpoint to populate year dropdowns or filters in your frontend.

[Back to top](#table-of-contents)

---

### Get Events

Retrieve events with optional filtering by year, month, or club.

**Endpoint:** `GET /api/events/`

**Query Parameters (all optional):**
- `year` - Filter by year (e.g., `2025`)
- `month` - Filter by month (1-12)
- `club` - Filter by club name (e.g., `IEEE`)

**Example Requests:**
```javascript
// Get all events
fetch('/api/events/')
  .then(response => response.json())
  .then(data => console.log(data.events));

// Get events for December 2025
fetch('/api/events/?year=2025&month=12')
  .then(response => response.json())
  .then(data => console.log(data.events));

// Get IEEE events
fetch('/api/events/?club=IEEE')
  .then(response => response.json())
  .then(data => console.log(data.events));
```

**Example URLs:**
```
GET /api/events/
GET /api/events/?year=2025
GET /api/events/?year=2025&month=12
GET /api/events/?club=IEEE
GET /api/events/?year=2025&club=IEEE-CS
```

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "name": "Tech Talk 2025",
      "details": "Annual technology conference featuring industry experts",
      "dateandtime": "2025-12-15 10:00:00",
      "image_name": "event-banner.jpg",
      "link": "https://forms.google.com/registration",
      "website": "https://techtalk2025.com",
      "clubs": ["IEEE", "IEEE-CS"],
      "coordinators": [
        {
          "name": "John Doe",
          "phone": "9876543210"
        },
        {
          "name": "Jane Smith",
          "phone": "8765432109"
        }
      ]
    }
  ]
}
```

**Response Fields:**
- `events` - Array of event objects
  - `id` - Unique event identifier
  - `name` - Event name
  - `details` - Event description
  - `dateandtime` - Event date and time (format: `YYYY-MM-DD HH:MM:SS`)
  - `image_name` - Event banner/poster filename
  - `link` - Registration/form link (optional)
  - `website` - Event website URL (optional)
  - `clubs` - Array of organizing clubs
  - `coordinators` - Array of coordinator objects with name and phone

[Back to top](#table-of-contents)

---

### Get Gallery Images

Retrieve gallery images with optional filtering by year or event name.

**Endpoint:** `GET /api/gallery/`

**Query Parameters (all optional):**
- `year` - Filter by year (e.g., `2025`)
- `event_name` - Filter by event name (e.g., `Tech Talk`)

**Example Requests:**
```javascript
// Get all gallery images
fetch('/api/gallery/')
  .then(response => response.json())
  .then(data => console.log(data.gallery));

// Get images from 2025
fetch('/api/gallery/?year=2025')
  .then(response => response.json())
  .then(data => console.log(data.gallery));

// Get images from specific event
fetch('/api/gallery/?event_name=Tech Talk 2025')
  .then(response => response.json())
  .then(data => console.log(data.gallery));
```

**Example URLs:**
```
GET /api/gallery/
GET /api/gallery/?year=2025
GET /api/gallery/?event_name=Tech Talk 2025
GET /api/gallery/?year=2025&event_name=Tech Talk 2025
```

**Response:**
```json
{
  "gallery": [
    {
      "id": 1,
      "title": "Tech Talk Photos",
      "description": "Photos from the annual technology conference",
      "image_url": "https://imageserver.com/gallery/image1.jpg",
      "event_name": "Tech Talk 2025",
      "upload_date": "2025-12-06 10:30:00",
      "year": 2025
    },
    {
      "id": 2,
      "title": "Workshop Highlights",
      "description": "Highlights from the hands-on workshop session",
      "image_url": "https://imageserver.com/gallery/image2.jpg",
      "event_name": "Tech Talk 2025",
      "upload_date": "2025-12-06 11:15:00",
      "year": 2025
    }
  ]
}
```

**Response Fields:**
- `gallery` - Array of gallery image objects
  - `id` - Unique image identifier
  - `title` - Image title
  - `description` - Image description (optional)
  - `image_url` - Full URL to the image
  - `event_name` - Associated event name (optional)
  - `upload_date` - Upload timestamp (format: `YYYY-MM-DD HH:MM:SS`)
  - `year` - Year the image was uploaded

[Back to top](#table-of-contents)

---

---

### Get All Societies

Retrieve a list of all societies ordered by their display order.

**Endpoint:** `GET /api/societies/`

**Example Request:**
```javascript
fetch('/api/societies/')
  .then(response => response.json())
  .then(data => console.log(data.societies));
```

**Response:**
```json
{
  "status": "success",
  "societies": [
    {
      "id": 1,
      "name": "CS",
      "full_name": "Computer Society",
      "order": 1
    }
  ]
}
```

[Back to top](#table-of-contents)

---

### Get Society Detail

Retrieve detailed information about a specific society, including its execom members and counts.

**Endpoint:** `GET /api/society/<society_id>/`

**Query Parameters (optional):**
- `year` - Filter the returned execom list to a specific year (default is the latest year with data).

**Example Request:**
```javascript
fetch('/api/society/1/?year=2025')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "status": "success",
  "society": {
    "id": 1,
    "name": "CS",
    "full_name": "Computer Society",
    "order": 1
  },
  "execom_year": 2025,
  "execom": [
    {
      "id": 10,
      "name": "Alice Sub",
      "role": "Chair",
      "photo_url": "",
      "email": "",
      "linkedin": "",
      "instagram": "",
      "github": "",
      "website": ""
    }
  ],
  "counts": {
    "total_members": 4,
    "total_events": 2,
    "total_all": 6
  }
}
```

[Back to top](#table-of-contents)

---

### Get Years by Category

Retrieve all years that contain data, broken down by category (execom, gallery, events).

**Endpoint:** `GET /api/years/`

**Example Request:**
```javascript
fetch('/api/years/')
  .then(response => response.json())
  .then(data => console.log(data.years));
```

**Response:**
```json
{
  "status": "success",
  "years": {
    "execom": [2025, 2024],
    "gallery": [2025, 2024, 2023],
    "events": [2025, 2024]
  }
}
```

[Back to top](#table-of-contents)

---

## Admin & Management APIs

### Get Roles by Society

Retrieve available roles for a specific society.

**Endpoint:** `GET /api/roles/society/<society_id>/`

**Parameters:**
- `society_id` (path parameter) - The society ID (integer)

**Example Request:**
```javascript
fetch('/api/roles/society/1/')
  .then(response => response.json())
  .then(data => console.log(data.roles));
```

**Example URL:**
```
GET /api/roles/society/1/
```

**Response:**
```json
{
  "status": "success",
  "roles": [
    {
      "id": 1,
      "name": "Chair",
      "full_name": "Chairperson"
    },
    {
      "id": 2,
      "name": "Vice Chair",
      "full_name": "Vice Chairperson"
    },
    {
      "id": 3,
      "name": "Secretary",
      "full_name": "Secretary"
    }
  ]
}
```

**Response Fields:**
- `status` - Success or error status
- `roles` - Array of role objects
  - `id` - Unique role identifier
  - `name` - Short role name
  - `full_name` - Full role title

**Use Case:**
Use this endpoint to populate role dropdowns when creating or editing execom members for a specific society.

[Back to top](#table-of-contents)

---

### Get All Admins

Retrieve list of all admin users with their permissions.

**Endpoint:** `GET /api/admins/list/`

> [!WARNING]
> This endpoint requires admin authentication. Ensure the user is logged in before calling.

**Example Request:**
```javascript
fetch('/api/admins/list/')
  .then(response => response.json())
  .then(data => console.log(data.admins));
```

**Example URL:**
```
GET /api/admins/list/
```

**Response:**
```json
{
  "status": "success",
  "admins": [
    {
      "id": 1,
      "username": "admin",
      "is_super_admin": true,
      "access_execom": 2,
      "access_events": 2,
      "access_gallery": 2,
      "is_current": true
    },
    {
      "id": 2,
      "username": "editor",
      "is_super_admin": false,
      "access_execom": 1,
      "access_events": 2,
      "access_gallery": 1,
      "is_current": false
    }
  ]
}
```

**Response Fields:**
- `status` - Success or error status
- `admins` - Array of admin objects
  - `id` - Unique admin identifier
  - `username` - Admin username
  - `is_super_admin` - Whether admin has super admin privileges
  - `access_execom` - Execom access level (0=None, 1=Read, 2=Write)
  - `access_events` - Events access level (0=None, 1=Read, 2=Write)
  - `access_gallery` - Gallery access level (0=None, 1=Read, 2=Write)
  - `is_current` - Whether this is the currently logged-in admin

**Access Levels:**
- `0` - No access
- `1` - Read-only access
- `2` - Full read/write access

[Back to top](#table-of-contents)

---

## Dashboard URLs

### Dashboard Home

Access the main dashboard interface.

**Endpoint:** `GET /api/dashboard/`

> [!WARNING]
> Requires admin authentication. Redirects to login if not authenticated.

**Example URL:**
```
GET /api/dashboard/
```

**Response:**
Returns HTML page for the main dashboard interface.

[Back to top](#table-of-contents)

---

### Section Dashboard

Access specific section dashboards with optional actions.

**Endpoint:** `GET /api/dashboard/<section>/`

**Parameters:**
- `section` (path parameter) - Dashboard section to access

**Available Sections:**
- `execom` - Manage executive committee members
- `events` - Manage events
- `gallery` - Manage gallery images
- `settings` - Token and configuration management

**Query Parameters (optional):**
- `action` - Specific action to perform (`upload`, `edit`, `delete`)

**Example URLs:**
```
GET /api/dashboard/execom/
GET /api/dashboard/execom/?action=upload
GET /api/dashboard/events/?action=edit
GET /api/dashboard/gallery/
GET /api/dashboard/settings/
```

**Response:**
Returns HTML page for the specified dashboard section.

[Back to top](#table-of-contents)

---

## Frontend Integration Examples

### React/Next.js Examples

#### Fetch Execom Data
```javascript
import { useState, useEffect } from 'react';

function ExecomList({ year }) {
  const [execomData, setExecomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/GetExecomDataByYear/${year}/`)
      .then(res => res.json())
      .then(data => {
        setExecomData(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching execom data:', error);
        setLoading(false);
      });
  }, [year]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {Object.entries(execomData).map(([society, members]) => (
        <div key={society}>
          <h2>{society}</h2>
          {members.map(member => (
            <div key={member.name}>
              <img src={member.photo_url} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Fetch Events with Filters
```javascript
async function fetchEvents(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.year) params.append('year', filters.year);
  if (filters.month) params.append('month', filters.month);
  if (filters.club) params.append('club', filters.club);
  
  const url = `/api/events/${params.toString() ? '?' + params.toString() : ''}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Usage
const events = await fetchEvents({ year: 2025, club: 'IEEE' });
```

#### Fetch Gallery Images
```javascript
function GalleryGrid({ year, eventName }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (eventName) params.append('event_name', eventName);

    fetch(`/api/gallery/?${params}`)
      .then(res => res.json())
      .then(data => setImages(data.gallery))
      .catch(error => console.error('Error:', error));
  }, [year, eventName]);

  return (
    <div className="gallery-grid">
      {images.map(image => (
        <div key={image.id}>
          <img src={image.image_url} alt={image.title} />
          <h3>{image.title}</h3>
          <p>{image.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Vanilla JavaScript Examples

#### Get All Years for Dropdown
```javascript
async function populateYearDropdown() {
  try {
    const response = await fetch('/api/allyears/');
    const data = await response.json();
    
    const select = document.getElementById('year-select');
    data.years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading years:', error);
  }
}
```

#### Filter Events by Club
```javascript
async function filterEventsByClub(clubName) {
  try {
    const response = await fetch(`/api/events/?club=${encodeURIComponent(clubName)}`);
    const data = await response.json();
    
    displayEvents(data.events);
  } catch (error) {
    console.error('Error filtering events:', error);
  }
}

function displayEvents(events) {
  const container = document.getElementById('events-container');
  container.innerHTML = '';
  
  events.forEach(event => {
    const eventCard = `
      <div class="event-card">
        <h3>${event.name}</h3>
        <p>${event.details}</p>
        <p>Date: ${event.dateandtime}</p>
        <p>Clubs: ${event.clubs.join(', ')}</p>
      </div>
    `;
    container.innerHTML += eventCard;
  });
}
```

---

## Error Handling

All endpoints may return error responses in the following format:

```json
{
  "status": "error",
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

**Example Error Handling:**
```javascript
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Handle error appropriately (show user message, etc.)
    throw error;
  }
}
```

---

## Best Practices

### 1. Use Query Parameters Properly
Always encode query parameters to handle special characters:
```javascript
const eventName = "Tech Talk 2025";
const url = `/api/gallery/?event_name=${encodeURIComponent(eventName)}`;
```

### 2. Cache Responses When Appropriate
For data that doesn't change frequently (like years), consider caching:
```javascript
let cachedYears = null;

async function getYears() {
  if (cachedYears) return cachedYears;
  
  const response = await fetch('/api/allyears/');
  const data = await response.json();
  cachedYears = data.years;
  
  return cachedYears;
}
```

### 3. Handle Loading States
Always provide feedback to users while data is loading:
```javascript
function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/events/')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return <EventsGrid events={events} />;
}
```

### 4. Debounce Search/Filter Inputs
When filtering based on user input, debounce API calls:
```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (searchTerm) => {
  const response = await fetch(`/api/events/?club=${searchTerm}`);
  const data = await response.json();
  // Update UI with results
}, 300);

// Usage in input handler
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

---

## Notes

- All GET endpoints are **read-only** and safe to call multiple times
- No CSRF token required for GET requests
- Image URLs returned are full URLs to the external image server
- Date/time formats are in `YYYY-MM-DD HH:MM:SS` format
- All arrays may be empty if no data exists
- Optional fields may be empty strings (`""`) or `null`

---

## Need Help?

For POST/PUT/DELETE operations, refer to the main [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

For issues or questions, contact the backend development team.
