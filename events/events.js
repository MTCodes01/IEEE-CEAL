const API_BASE = CONFIG.API_BASE_URL;
const EVENTS_API = `${API_BASE}/events/`;
const YEARS_API = `${API_BASE}/years/`;

let allEvents = [];
let currentYearFilter = 'all';
let currentSearchQuery = '';

async function fetchYears() {
    try {
        const response = await fetch(YEARS_API);
        const data = await response.json();

        if (data.status === 'success' && data.years && data.years.events) {
            const yearContainer = document.getElementById('year-filters');
            const allYearsChip = yearContainer.firstElementChild;
            yearContainer.innerHTML = '';
            yearContainer.appendChild(allYearsChip);

            data.years.events.forEach(year => {
                const chip = document.createElement('div');
                chip.className = 'year-chip';
                chip.textContent = year;
                chip.onclick = () => filterByYear(year, chip);
                yearContainer.appendChild(chip);
            });
        }
    } catch (error) {
        console.error('Error fetching years:', error);
        if (window.FALLBACK_DATA && window.FALLBACK_DATA.execomYears) {
            const yearContainer = document.getElementById('year-filters');
            const allYearsChip = yearContainer.firstElementChild;
            yearContainer.innerHTML = '';
            yearContainer.appendChild(allYearsChip);

            window.FALLBACK_DATA.execomYears.forEach(year => {
                const chip = document.createElement('div');
                chip.className = 'year-chip';
                chip.textContent = year;
                chip.onclick = () => filterByYear(year, chip);
                yearContainer.appendChild(chip);
            });
        }
    }
}

async function fetchEvents() {
    const grid = document.getElementById('events-grid');
    const loadingState = document.getElementById('loading-state');
    
    try {
        const response = await fetch(EVENTS_API);
        const data = await response.json();

        if (data && data.events && Array.isArray(data.events)) {
            allEvents = data.events;
            // Sort events by date (newest first)
            allEvents.sort((a, b) => new Date(b.dateandtime) - new Date(a.dateandtime));
            applyFilters();
        } else {
            allEvents = [];
            applyFilters();
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        if (window.FALLBACK_DATA && window.FALLBACK_DATA.events) {
            allEvents = window.FALLBACK_DATA.events;
            allEvents.sort((a, b) => new Date(b.dateandtime) - new Date(a.dateandtime));
            applyFilters();
        } else {
            loadingState.innerHTML = '<div class="text-red-400">Failed to load events.</div>';
        }
    }
}

function filterByYear(year, element) {
    document.querySelectorAll('.year-chip').forEach(chip => chip.classList.remove('active'));
    element.classList.add('active');
    currentYearFilter = year;
    applyFilters();
}

let searchTimeout;
function debounceSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearchQuery = value.trim().toLowerCase();
        applyFilters();
    }, 300);
}

function applyFilters() {
    const grid = document.getElementById('events-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    
    // Hide initial loading
    if(loadingState) loadingState.style.display = 'none';

    const filtered = allEvents.filter(event => {
        // Year filter
        const eventYear = new Date(event.dateandtime).getFullYear();
        const matchYear = currentYearFilter === 'all' || eventYear == currentYearFilter;
        if (!matchYear) return false;

        // Search filter
        if (currentSearchQuery.length === 0) return true;
        
        const searchableText = [
            event.name,
            event.details,
            ...(event.clubs || []),
            ...(event.coordinators || []).map(c => c.name)
        ].filter(Boolean).join(' ').toLowerCase();

        const terms = currentSearchQuery.split(' ').filter(t => t.length > 0);
        return terms.every(term => searchableText.includes(term));
    });

    renderEvents(filtered);

    // Toggle empty state
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
}

function renderEvents(events) {
    const grid = document.getElementById('events-grid');
    
    // Clear existing cards (except static elements if any)
    const cards = grid.querySelectorAll('.event-card');
    cards.forEach(c => c.remove());

    events.forEach(event => {
        const eventDate = new Date(event.dateandtime);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const imageSrc = event.image_name && event.image_name.startsWith('http') 
            ? event.image_name 
            : 'https://placehold.co/600x400?text=Event+Poster';

        const clubsHtml = event.clubs.map(club => 
            `<span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wider mr-2">${club}</span>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'event-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-300';
        card.style.animation = 'fadeIn 0.5s ease-out forwards';
        card.innerHTML = `
            <div class="relative h-56 overflow-hidden">
                <img src="${imageSrc}" alt="${event.name}" class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500">
                <div class="absolute top-4 left-4 flex flex-wrap gap-1">
                    ${clubsHtml}
                </div>
            </div>
            <div class="p-6 flex-grow flex flex-col">
                <div class="flex items-center text-sm text-gray-500 mb-3">
                    <i class="fa-regular fa-calendar-alt mr-2 text-blue-500"></i>
                    <span>${formattedDate}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">${event.name}</h3>
                <p class="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">${event.details}</p>
                
                <div class="flex flex-wrap gap-3 mt-auto pt-4 border-t border-gray-50">
                    ${event.link ? `
                        <a href="${event.link}" target="_blank" class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md">
                            Register <i class="fa-solid fa-arrow-up-right-from-square ml-2 text-[10px]"></i>
                        </a>
                    ` : ''}
                    ${event.website ? `
                        <a href="${event.website}" target="_blank" class="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center">
                            Website <i class="fa-solid fa-globe ml-2 text-[10px]"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchYears();
    fetchEvents();
});
