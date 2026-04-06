document.addEventListener("DOMContentLoaded", function () {
    const url = new URL(window.location.href);
    const society = url.pathname.split('/').slice(-2, -1)[0] || '';
    const requestedYear = new URLSearchParams(window.location.search).get("year") || new Date().getFullYear();
    console.log("Society:", society, "Year:", requestedYear);
    fetchPeopleBySociety(society, requestedYear);
});

// Fetch available years from the API
async function fetchAvailableYears() {
    try {
        const apiBaseUrl = CONFIG.API_BASE_URL;
        
        const res = await fetch(`${apiBaseUrl}/allyears/`);
        const response = await res.json();
        
        if (response.allyears && Array.isArray(response.allyears)) {
            return response.allyears.sort((a, b) => b - a);
        }
        return window.FALLBACK_DATA && window.FALLBACK_DATA.execomYears ? window.FALLBACK_DATA.execomYears : [];
    } catch (error) {
        console.error('Error fetching available years:', error);
        return window.FALLBACK_DATA && window.FALLBACK_DATA.execomYears ? window.FALLBACK_DATA.execomYears : [];
    }
}

async function fetchPeopleBySociety(society, requestedYear) {
    try {
        const apiBaseUrl = CONFIG.API_BASE_URL;

        // Check if year was explicitly selected via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const explicitYearSelection = urlParams.has('year');

        // Get the list of available years
        const availableYears = await fetchAvailableYears();
        
        if (availableYears.length === 0) {
            showEmptyState('Unable to fetch available years. Please try again later.');
            return;
        }

        let yearToTry = requestedYear;
        let foundData = false;
        let societyMembers = null;

        // If year was explicitly selected from dropdown, only try that year
        if (explicitYearSelection) {
            try {
                const res = await fetch(`${apiBaseUrl}/GetExecomDataByYear/${requestedYear}/`);
                const response = await res.json();

                // Check if we got valid data for this society
                if (response.status !== 'error' && response.heading && response.heading.Society && response.heading.Society[society]) {
                    societyMembers = response.heading.Society[society];
                    yearToTry = requestedYear;
                    foundData = true;
                    // No data for this society in this year
                    if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society && window.FALLBACK_DATA.execom.heading.Society[society]) {
                        societyMembers = window.FALLBACK_DATA.execom.heading.Society[society];
                        yearToTry = requestedYear;
                        foundData = true;
                    } else {
                        showEmptyState(`No ${society} execom data available for year ${requestedYear}.`);
                        return;
                    }
                }
            } catch (error) {
                console.error(`Error fetching data for year ${requestedYear}:`, error);
                if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society && window.FALLBACK_DATA.execom.heading.Society[society]) {
                    societyMembers = window.FALLBACK_DATA.execom.heading.Society[society];
                    yearToTry = requestedYear;
                    foundData = true;
                } else {
                    showEmptyState(`Failed to load ${society} execom data for year ${requestedYear}.`);
                    return;
                }
            }
        } else {
            // No explicit year selection - use fallback logic to find latest year with data
            for (const year of availableYears) {
                if (year > requestedYear) {
                    continue;
                }

                try {
                    const res = await fetch(`${apiBaseUrl}/GetExecomDataByYear/${year}/`);
                    const response = await res.json();

                    // Check if we got valid data for this society
                    if (response.status !== 'error' && response.heading && response.heading.Society && response.heading.Society[society] && response.heading.Society[society].length > 0) {
                        societyMembers = response.heading.Society[society];
                        yearToTry = year;
                        foundData = true;
                        break;
                    }
                } catch (error) {
                    console.error(`Error fetching data for year ${year}:`, error);
                }
            }

            if (!foundData || !societyMembers || societyMembers.length === 0) {
                if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society && window.FALLBACK_DATA.execom.heading.Society[society]) {
                    societyMembers = window.FALLBACK_DATA.execom.heading.Society[society];
                    yearToTry = availableYears.length > 0 ? availableYears[0] : requestedYear;
                    foundData = true;
                } else {
                    showEmptyState(`No ${society} execom data available for any year. Please check back later.`);
                    return;
                }
            }
        }

        // Log if we're showing a different year than requested
        if (yearToTry != requestedYear) {
            console.log(`Showing data for year ${yearToTry} (requested: ${requestedYear})`);
        }

        // --- Fetch Society Detail (Description, Image, Features) ---
        fetchSocietyInfo(society);

        CreateSocietySections({ [society]: societyMembers });
    } catch (error) {
        console.error('Error fetching society data:', error);
        if (window.FALLBACK_DATA && window.FALLBACK_DATA.execom && window.FALLBACK_DATA.execom.heading && window.FALLBACK_DATA.execom.heading.Society && window.FALLBACK_DATA.execom.heading.Society[society]) {
            console.warn('Backend unavailable, using execom fallback');
            CreateSocietySections({ [society]: window.FALLBACK_DATA.execom.heading.Society[society] });
        } else {
            showEmptyState('Failed to load society data. Please try again later.');
        }
    }
}

async function fetchSocietyInfo(societyName) {
    try {
        const apiBaseUrl = CONFIG.API_BASE_URL;
        
        // Find the society by name (from all societies list)
        const resList = await fetch(`${apiBaseUrl}/societies/`);
        const dataList = await resList.json();
        
        if (dataList.status === 'success' && dataList.societies) {
            const societyObj = dataList.societies.find(s => s.name === societyName || s.full_name === societyName);
            if (societyObj) {
                // Fetch full detail for this society ID
                const resDetail = await fetch(`${apiBaseUrl}/society/${societyObj.id}/`);
                const dataDetail = await resDetail.json();
                
                if (dataDetail.status === 'success' && dataDetail.society) {
                    hydrateSocietyUI(dataDetail.society);
                } else throw Error("Not OK");
            } else throw Error("Not OK");
        } else throw Error("Not OK");
    } catch (error) {
        console.warn('Error fetching society detail:', error);
        if (window.FALLBACK_DATA && window.FALLBACK_DATA.societies) {
            const socObj = window.FALLBACK_DATA.societies.find(s => s.name === societyName || s.full_name === societyName);
            if (socObj) {
                hydrateSocietyUI({
                    name: socObj.name,
                    full_name: socObj.full_name || socObj.name,
                    description: "Details currently unavailable mode. Showing generic offline layout.",
                    features: ["Network offline. Displaying fallback data."]
                });
            }
        }
    }
}

function hydrateSocietyUI(society) {
    // 1. Update landing/hero
    const landingH1 = document.querySelector('.landing-content h1');
    const landingP = document.querySelector('.landing-content p');
    const landingPage = document.querySelector('.landing-page');

    if (society.name && landingH1) landingH1.innerText = society.name;
    if (society.full_name && landingP) landingP.innerText = society.full_name;
    if (society.main_image_url && landingPage) {
        landingPage.style.backgroundImage = `url('${society.main_image_url}')`;
    }

    // 2. Update About section
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        const aboutH2 = aboutSection.querySelector('.left-column h2');
        const aboutP = aboutSection.querySelector('.right-column p');
        const aboutUl = aboutSection.querySelector('.right-column ul') || 
                        aboutSection.querySelector('.right-column li')?.parentElement;
        
        if (society.full_name && aboutH2) aboutH2.innerText = `IEEE ${society.full_name}`;
        if (society.description && aboutP) aboutP.innerText = society.description;
        
        if (society.features && Array.isArray(society.features) && society.features.length > 0 && aboutUl) {
            aboutUl.innerHTML = society.features.map(f => `<li>${f}</li>`).join('');
        }
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
    const society = new URL(window.location.href).pathname.split('/').slice(-2, -1)[0] || '';
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
            <a href="/societies/${society}" style="
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
                View Latest ${society} Execom
            </a>
        </div>
    `;
}
