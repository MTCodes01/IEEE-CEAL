const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8000/api'
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
            }
        } catch (e) { console.error("Could not fetch years:", e); }

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
                            }
                        }
                    }
                }
            } catch(e) { console.error("Could not fetch society stats:", e); }
        } else {
            // Main Page logic
            
            // Societies count
            if (configObj.projects) {
                try {
                    const socRes = await fetch(`${apiBaseUrl}/societies/`);
                    if (socRes.ok) {
                        const data = await socRes.json();
                        let societies = data.societies || data.data || data;
                        if (Array.isArray(societies)) {
                            societies = societies.filter(soc => soc.id !== 1 && soc.id !== 2);
                            configObj.projects.endValue = societies.length;
                        }
                    }
                } catch (e) { console.error("Could not fetch societies list:", e); }
            }

            // Events count
            if (configObj.events) {
                try {
                    const eventsRes = await fetch(`${apiBaseUrl}/events/`);
                    if (eventsRes.ok) {
                        const data = await eventsRes.json();
                        if (data.events) configObj.events.endValue = data.events.length;
                    }
                } catch (e) { console.error("Could not fetch events:", e); }
            }

            // Members from overall latest execom
            if (configObj.members && allyears.length > 0) {
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
                    }
                } catch (e) { console.error("Could not fetch main execom members:", e); }
            }
        }
    } catch (error) {
        console.error("Error fetching dynamic stats:", error);
    }
};
