document.addEventListener("DOMContentLoaded", function () {
    const requestedYear = new URLSearchParams(window.location.search).get("year") || new Date().getFullYear();
    fetchPeopleByYear(requestedYear);
});

// Fetch available years from the API
async function fetchAvailableYears() {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/allyears/`);
        const response = await res.json();
        
        if (response.allyears && Array.isArray(response.allyears)) {
            // Sort years in descending order
            return response.allyears.sort((a, b) => b - a);
        }
        return window.FALLBACK_DATA && window.FALLBACK_DATA.execomYears ? window.FALLBACK_DATA.execomYears : [];
    } catch (error) {
        console.error('Error fetching available years:', error);
        return window.FALLBACK_DATA && window.FALLBACK_DATA.execomYears ? window.FALLBACK_DATA.execomYears : [];
    }
}

async function fetchPeopleByYear(requestedYear) {
    try {
        // Check if year was explicitly selected via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const explicitYearSelection = urlParams.has('year');

        // First, get the list of available years
        const availableYears = await fetchAvailableYears();
        
        if (availableYears.length === 0) {
            alert('Unable to fetch available years. Please try again later.');
            return;
        }

        let yearToTry = requestedYear;
        let foundData = false;
        let societies = null;

        // If year was explicitly selected from dropdown, only try that year
        if (explicitYearSelection) {
            try {
                const res = await fetch(`${CONFIG.API_BASE_URL}/GetExecomDataByYear/${requestedYear}/`);
                const response = await res.json();

                // Check if we got valid data
                if (response.status !== 'error' && response.heading && Object.keys(response.heading.Society).length > 0) {
                    societies = response.heading.Society;
                    yearToTry = requestedYear;
                    foundData = true;
                    // No data for this year, check fallback
                    if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society) {
                        societies = window.FALLBACK_DATA.execom.heading.Society;
                        yearToTry = requestedYear;
                        foundData = true;
                    } else {
                        document.getElementById('ExecomMainText').innerHTML = `IEEE CEAL ${requestedYear} EXECOM`;
                        showEmptyState(`No execom data available for year ${requestedYear}.`);
                        return;
                    }
                }
            } catch (error) {
                console.error(`Error fetching data for year ${requestedYear}:`, error);
                if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society) {
                    societies = window.FALLBACK_DATA.execom.heading.Society;
                    yearToTry = requestedYear;
                    foundData = true;
                } else {
                    document.getElementById('ExecomMainText').innerHTML = `IEEE CEAL ${requestedYear} EXECOM`;
                    showEmptyState(`Failed to load execom data for year ${requestedYear}.`);
                    return;
                }
            }
        } else {
            // No explicit year selection - use fallback logic to find latest year with data
            // Try years in descending order until we find data
            for (const year of availableYears) {
                // Skip years newer than requested year
                if (year > requestedYear) {
                    continue;
                }

                try {
                    const res = await fetch(`${CONFIG.API_BASE_URL}/GetExecomDataByYear/${year}/`);
                    const response = await res.json();

                    // Check if we got valid data
                    if (response.status !== 'error' && response.heading && Object.keys(response.heading.Society).length > 0) {
                        societies = response.heading.Society;
                        yearToTry = year;
                        foundData = true;
                        break;
                    }
                } catch (error) {
                    console.error(`Error fetching data for year ${year}:`, error);
                    // Continue to next year
                }
            }

            if (!foundData || !societies || Object.keys(societies).length === 0) {
                if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society) {
                    societies = window.FALLBACK_DATA.execom.heading.Society;
                    yearToTry = availableYears.length > 0 ? availableYears[0] : requestedYear;
                    foundData = true;
                } else {
                    showEmptyState('No execom data available for any year. Please check back later.');
                    return;
                }
            }
        }

        // Update the page title with the actual year being displayed
        document.getElementById('ExecomMainText').innerHTML = `IEEE CEAL ${yearToTry} EXECOM`;
        
        // If we're showing a different year than requested, log it
        if (yearToTry != requestedYear) {
            console.log(`Showing data for year ${yearToTry} (requested: ${requestedYear})`);
        }

        CreateSocietySections(societies);
    } catch (error) {
        console.error('Error fetching execom data:', error);
        alert('Failed to load execom data. Please try again later.');
    }
}

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

function observeCards() {
    const cards = document.querySelectorAll('.person-card');
    cards.forEach(card => observer.observe(card));
}

function CreateSocietySections(societies) {
    const teamDiv = document.getElementById('team');
    teamDiv.innerHTML = '';

    Object.keys(societies).forEach(societyName => {
        const societyHeader = document.createElement('h1');
        societyHeader.className = 'society-header';
        societyHeader.textContent = societyName;
        teamDiv.appendChild(societyHeader);

        const societyContainer = document.createElement('div');
        societyContainer.className = 'society-container';

        societies[societyName].forEach((person, idx) => {
            const card = document.createElement('div');
            card.className = 'person-card';
            
            // Use photo_url from backend API response
            const photoUrl = person.photo_url || `/images/execom_2025/${person.name.toLowerCase().split(' ')[0]}.png`;
            
            card.innerHTML = `
                <img class="person-photo" src="${photoUrl}" onerror="this.onerror=null; this.src='/images/execom_2025/default.png';" alt="${person.name}" />
                <div class="person-name">${toTitleCase(person.name || '')}</div>
                <div class="person-society">${societyName || ''}</div>
                <div class="person-role">${toTitleCase(person.role || '')}</div>
                <div class="person-contact">
                    ${person.email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${person.email}" target="_blank" title="Mail"><i class="fa-solid fa-envelope"></i></a>` : ''}
                    ${person.linkedin ? `<a href="${person.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                    ${person.instagram ? `<a href="${person.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                    ${person.github ? `<a href="${person.github}" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
                    ${person.website ? `<a href="${person.website}" target="_blank" title="Website"><i class="fa-solid fa-globe"></i></a>` : ''}
                    ${person.x ? `<a href="${person.x}" target="_blank" title="X"><i class="fab fa-x"></i></a>` : ''}
                    ${person.facebook ? `<a href="${person.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>` : ''}
                </div>
            `;
            societyContainer.appendChild(card);
        });
        teamDiv.appendChild(societyContainer);
    });
    observeCards();
}

function toTitleCase(str) {
    if (!str) {
        return "";
    }
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

// Show empty state when no data is available
function showEmptyState(message) {
    const teamDiv = document.getElementById('team');
    teamDiv.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            min-height: 400px;
        ">
            <i class="fas fa-users-slash" style="
                font-size: 5rem;
                color: var(--text-light);
                margin-bottom: 2rem;
                opacity: 0.5;
            "></i>
            <h2 style="
                font-size: 2rem;
                color: var(--text-dark);
                margin-bottom: 1rem;
                font-weight: 600;
            ">No Data Available</h2>
            <p style="
                font-size: 1.2rem;
                color: var(--text-light);
                max-width: 600px;
                line-height: 1.6;
            ">${message}</p>
            <a href="/execom/" style="
                margin-top: 2rem;
                background: var(--gradient-primary);
                color: white;
                padding: 12px 30px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
                transition: var(--transition);
                display: inline-block;
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 10px 25px rgba(0, 85, 164, 0.3)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                View Latest Execom
            </a>
        </div>
    `;
}
