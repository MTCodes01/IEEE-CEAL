const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8000/api'
};

window.FALLBACK_DATA = {
    stats: {
        years: 6,
        members: 125,
        projects: 8,
        events: 42
    },
    execomYears: [2024, 2023, 2022],
    execom: {
        heading: {
            Society: {
                "Professional Execom": [
                    { id: 1, Name: "Dr. Placeholder", role: "Branch Counselor", email: "counselor@example.com", photo_url: "https://placehold.co/400?text=Counselor" }
                ],
                "IEEE SB CEAL": [
                    { id: 2, Name: "John Doe", role: "Chair", email: "chair@example.com", photo_url: "https://placehold.co/400?text=Chair" },
                    { id: 3, Name: "Jane Smith", role: "Vice Chair", email: "vicechair@example.com", photo_url: "https://placehold.co/400?text=Vice+Chair" }
                ]
            }
        }
    },
    events: [
        {
            id: 1,
            name: "Annual Hackathon",
            details: "Join us for 24 hours of coding and innovation.",
            dateandtime: "2024-08-15T10:00:00Z",
            clubs: ["Computer Society"],
            image_name: "https://placehold.co/600x400?text=Hackathon",
            link: "#"
        },
        {
            id: 2,
            name: "Robotics Workshop",
            details: "Hands-on session with microcontrollers.",
            dateandtime: "2024-09-20T09:00:00Z",
            clubs: ["RAS"],
            image_name: "https://placehold.co/600x400?text=Robotics",
            link: "#"
        }
    ],
    societies: [
        { id: 1, name: "Professional Execom" },
        { id: 2, name: "IEEE SB CEAL" },
        { id: 3, name: "CS" },
        { id: 4, name: "RAS" },
        { id: 5, name: "WIE" },
        { id: 6, name: "PES" },
        { id: 7, name: "PELS" },
        { id: 8, name: "IAS" },
        { id: 9, name: "SPS" },
        { id: 10, name: "EMBS" }
    ],
    societyInfo: {
        counts: { total_members: 12, total_events: 5 }
    },
    pages: {
        home: { title: "Welcome to IEEE CEAL", subtitle: "Empowering Students to Innovate and Excel", description: "Discover our vibrant community..." },
        about: { title: "About IEEE CEAL", subtitle: "Our Mission and Vision", description: "IEEE SB CEAL is dedicated to fostering technological innovation..." },
        societies: { title: "Our Societies", subtitle: "Explore our diverse technical chapters" },
        events: { title: "Events & Hackathons", subtitle: "Join us in our upcoming activities" },
        execom: { title: "Executive Committee", subtitle: "Meet the team driving the change" },
        gallery: { title: "Gallery", subtitle: "Memories from our past events" },
        resources: { title: "Resources", subtitle: "Study materials, standards, and guides" }
    }
};

// Global helper to fetch and calculate stats dynamically for index.html and society pages
window.fetchDynamicStats = async function(configObj, isMainPage = false, societyName = null) {
    try {
        const apiBaseUrl = CONFIG.API_BASE_URL;

        // Fetch Years
        let allyears = [];
        try {
            const yearsRes = await fetch(`${apiBaseUrl}/allyears/`);
            if (yearsRes.ok) {
                const data = await yearsRes.json();
                allyears = data.allyears || [];
                if (configObj.years) configObj.years.endValue = allyears.length;
            } else throw Error("Not OK");
        } catch (e) {
            console.error("Could not fetch years:", e);
            if (configObj.years) configObj.years.endValue = window.FALLBACK_DATA.stats.years;
        }

        if (!isMainPage && societyName) {
            // Fetch precise society stats directly from the society endpoint using ID
            try {
                // First get the society ID
                const allSocRes = await fetch(`${apiBaseUrl}/societies/`);
                if (allSocRes.ok) {
                    const allSocData = await allSocRes.json();
                    let societies = allSocData.societies || allSocData.data || allSocData;
                    if (Array.isArray(societies)) {
                        const socObj = societies.find(s => s.name === societyName);
                        
                        if (socObj && socObj.id) {
                            const socRes = await fetch(`${apiBaseUrl}/society/${socObj.id}/`);
                            if (socRes.ok) {
                                const data = await socRes.json();
                                if (data.status === 'success' && data.counts) {
                                    if (configObj.members) configObj.members.endValue = data.counts.total_members || 0;
                                    if (configObj.events) configObj.events.endValue = data.counts.total_events || 0;
                                    // Projects remains empty (or 0) unless added to API
                                }
                            } else throw Error("Not OK");
                        }
                    }
                } else throw Error("Not OK");
            } catch(e) {
                console.error("Could not fetch society stats:", e);
                if (configObj.members) configObj.members.endValue = window.FALLBACK_DATA.societyInfo.counts.total_members;
                if (configObj.events) configObj.events.endValue = window.FALLBACK_DATA.societyInfo.counts.total_events;
            }
        } else {
            // Main Page logic
            
            // Societies count (Mapped to 'projects' label in stats counters)
            if (configObj.projects) {
                try {
                    const socRes = await fetch(`${apiBaseUrl}/societies/`);
                    if (socRes.ok) {
                        const data = await socRes.json();
                        let societies = data.societies || data.data || data;
                        if (Array.isArray(societies)) {
                            // Filter out "Professional Execom" (id 1) and "IEEE SB CEAL" (id 2)
                            // to count only the specific technical societies/chapters
                            societies = societies.filter(soc => soc.id !== 1 && soc.id !== 2);
                            configObj.projects.endValue = societies.length;
                        }
                    } else throw Error("Not OK");
                } catch (e) {
                    console.error("Could not fetch societies list:", e);
                    if (configObj.projects) configObj.projects.endValue = window.FALLBACK_DATA.stats.projects;
                }
            }

            // Events count
            if (configObj.events) {
                try {
                    const eventsRes = await fetch(`${apiBaseUrl}/events/`);
                    if (eventsRes.ok) {
                        const data = await eventsRes.json();
                        if (data.events) configObj.events.endValue = data.events.length;
                    } else throw Error("Not OK");
                } catch (e) {
                    console.error("Could not fetch events:", e);
                    if (configObj.events) configObj.events.endValue = window.FALLBACK_DATA.stats.events;
                }
            }

            // Members from overall latest execom
            if (configObj.members) {
                if (allyears.length > 0) {
                    try {
                        const latestYear = allyears.sort((a,b) => b-a)[0];
                        const execomRes = await fetch(`${apiBaseUrl}/GetExecomDataByYear/${latestYear}/`);
                        if (execomRes.ok) {
                            const data = await execomRes.json();
                            if (data.status !== 'error' && data.heading && data.heading.Society) {
                                let total = 0;
                                Object.values(data.heading.Society).forEach(arr => total += arr.length);
                                if (total > 0) configObj.members.endValue = total;
                            }
                        } else throw Error("Not OK");
                    } catch (e) {
                        console.error("Could not fetch main execom members:", e);
                        configObj.members.endValue = window.FALLBACK_DATA.stats.members;
                    }
                } else {
                    configObj.members.endValue = window.FALLBACK_DATA.stats.members;
                }
            }

            // --- Apply Manual Overrides for Home Page ---
            try {
                const pageRes = await fetch(`${apiBaseUrl}/pages/home/`);
                if (pageRes.ok) {
                    const data = await pageRes.json();
                    if (data.status === 'success' && data.page) {
                        const page = data.page;
                        if (page.stat_years && page.stat_years > 0) configObj.years.endValue = page.stat_years;
                        if (page.stat_members && page.stat_members > 0) configObj.members.endValue = page.stat_members;
                        if (page.stat_societies && page.stat_societies > 0) configObj.projects.endValue = page.stat_societies;
                        if (page.stat_events && page.stat_events > 0) configObj.events.endValue = page.stat_events;
                    }
                }
            } catch (e) { console.warn("Could not fetch page overrides:", e); }
        }
    } catch (error) {
        console.error("Error fetching dynamic stats:", error);
    }
};
