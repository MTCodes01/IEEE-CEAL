/**
 * society.js — Shared script for individual society pages.
 * Handles: hero hydration, about section content, society values section,
 * execom member cards, stats, and fallback when backend is unavailable.
 *
 * Usage: Include this script in any /societies/ABBR/index.html
 * The society abbreviation is auto-detected from the URL path.
 */

document.addEventListener('DOMContentLoaded', function () {
    const societyName = window.location.pathname.split('/').filter(Boolean).pop() ||
        window.location.pathname.split('/').slice(-2, -1)[0] || '';

    if (!societyName) {
        console.warn('society.js: could not determine society name from URL');
        return;
    }

    loadSocietyPage(societyName);
});

async function loadSocietyPage(societyName) {
    const apiBase = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : '/api';

    try {
        // 1. Get society list to find the ID
        const listRes = await fetch(`${apiBase}/societies/`);
        const listData = await listRes.json();

        if (listData.status !== 'success' || !listData.societies) throw new Error('societies list failed');

        const socObj = listData.societies.find(s => s.name === societyName || s.full_name === societyName);
        if (!socObj) throw new Error(`society not found: ${societyName}`);

        // 2. Get full society detail
        const detailRes = await fetch(`${apiBase}/society/${socObj.id}/`);
        const detailData = await detailRes.json();

        if (detailData.status !== 'success') throw new Error('society detail failed');

        const society = detailData.society;
        const execom = detailData.execom || {};

        // Hydrate the page
        hydrateSocietyHero(society);
        hydrateSocietyAbout(society);
        hydrateSocietyValues(society);
        hydrateSocietyStats(detailData.counts || {});
        initSocietyExecom(societyName, execom);

    } catch (err) {
        console.warn('society.js: API failed, using fallback.', err.message);
        useFallback(societyName);
    }
}

function hydrateSocietyHero(society) {
    // Title
    const h1 = document.querySelector('.landing-content h1') || document.getElementById('page-title');
    if (h1 && society.page_title) h1.textContent = society.page_title;

    // Subtitle
    const p = document.querySelector('.landing-content p') || document.getElementById('page-subtitle');
    if (p && society.page_subtitle) p.textContent = society.page_subtitle;

    // Banner background
    if (society.main_image_url) {
        const landing = document.querySelector('.landing-page');
        if (landing) {
            landing.style.backgroundImage = `url('${society.main_image_url}')`;
            landing.style.backgroundSize = 'cover';
            landing.style.backgroundPosition = 'center';
        }
    }
}

function hydrateSocietyAbout(society) {
    const aboutSection = document.querySelector('.about-section');
    if (!aboutSection) return;

    const aboutH2 = document.getElementById('society-full-name') || aboutSection.querySelector('.left-column h2');
    const aboutP = document.getElementById('society-description') || aboutSection.querySelector('.right-column p');
    const aboutUl = document.getElementById('society-features') || aboutSection.querySelector('.right-column ul');

    if (society.full_name && aboutH2) {
        aboutH2.textContent = society.name && society.full_name.includes(society.name) 
            ? `IEEE ${society.full_name}` 
            : `IEEE ${society.full_name} (${society.name})`;
    }
    if (society.description && aboutP) aboutP.textContent = society.description;

    // Logo in about section
    if (society.logo_url) {
        const logoEl = document.getElementById('about-society-logo') || aboutSection.querySelector('.society-logo');
        if (logoEl) {
            logoEl.src = society.logo_url;
            logoEl.style.display = 'block';
            logoEl.style.maxHeight = '120px'; // Restoring larger size
            logoEl.style.marginBottom = '24px';
        }
    }

    // Feature bullet points
    if (society.features && Array.isArray(society.features) && society.features.length > 0 && aboutUl) {
        aboutUl.innerHTML = society.features.map(f => `<li>${f}</li>`).join('');
    }
}

function hydrateSocietyValues(society) {
    if (!society.values || !Array.isArray(society.values) || society.values.length === 0) return;

    // Already existing values section in the DOM?
    let valSection = document.getElementById('society-values-section');
    if (!valSection) {
        // Create and inject before the stats section
        valSection = document.createElement('section');
        valSection.id = 'society-values-section';
        valSection.style.cssText = 'padding: 60px 24px; max-width: 1200px; margin: 0 auto;';

        const statsSection = document.querySelector('.stats, section.stats');
        if (statsSection) {
            statsSection.parentNode.insertBefore(valSection, statsSection);
        } else {
            document.body.appendChild(valSection);
        }
    }

    valSection.innerHTML = `
        <h2 style="text-align: center; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">What We Stand For</h2>
        <div style="width: 60px; height: 4px; background: var(--gradient-primary, linear-gradient(135deg, #0055a4, #00b5e2)); border-radius: 2px; margin: 0 auto 2.5rem;"></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem;">
            ${society.values.map(v => `
                <div style="background: #fff; border-radius: 16px; padding: 28px 24px; box-shadow: 0 6px 24px rgba(0,85,164,0.08); border: 1px solid rgba(0,85,164,0.08); transition: transform 0.3s, box-shadow 0.3s;"
                    onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,85,164,0.15)'"
                    onmouseout="this.style.transform='';this.style.boxShadow='0 6px 24px rgba(0,85,164,0.08)'">
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary, #0055a4); margin: 0 0 10px;">${v.title || ''}</h3>
                    <p style="font-size: 0.9rem; color: #5a7090; line-height: 1.6; margin: 0;">${v.description || ''}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function hydrateSocietyStats(counts) {
    const statsSection = document.querySelector('.stats') || document.body;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.years').forEach(el => {
                    animateCountUp(el, counts.total_years || 0, 2000, 0);
                });

                document.querySelectorAll('.members').forEach(el => {
                    animateCountUp(el, counts.total_members || 0, 3000, 200);
                });

                document.querySelectorAll('.projects').forEach(el => {
                    animateCountUp(el, counts.total_projects || 0, 1500, 400);
                });

                document.querySelectorAll('.events').forEach(el => {
                    animateCountUp(el, counts.total_events || 0, 2000, 600);
                });

                obs.disconnect(); // Stop observing once triggered
            }
        });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
}

function easeOutQuart(t) {
    return 1 - (--t) * t * t * t;
}

function animateCountUp(element, endValue, duration, startDelay) {
    if (!element || endValue === undefined || endValue === null) return;
    const startValue = 0;
    const startTime = performance.now() + startDelay;
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        if (elapsed < 0) {
            requestAnimationFrame(updateCount);
            return;
        }
        
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = endValue.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCount);
}

function initSocietyExecom(societyName, execom) {
    // execom is already handled by members.js for the society pages.
    // This function exists for extensibility.
}

function useFallback(societyName) {
    if (typeof window.FALLBACK_DATA === 'undefined') return;

    // 1. Find society info in fallback
    const fallbackSoc = window.FALLBACK_DATA.societies?.find(s => 
        s.name.toLowerCase() === societyName.toLowerCase()
    ) || { name: societyName, full_name: societyName };

    // 2. Hydrate Hero
    hydrateSocietyHero({
        page_title: `IEEE ${fallbackSoc.full_name || fallbackSoc.name}`,
        page_subtitle: "Advancing Technology for Humanity",
        main_image_url: "" // Keep default or placeholder
    });

    // 3. Hydrate About
    hydrateSocietyAbout({
        name: fallbackSoc.name,
        full_name: fallbackSoc.full_name,
        description: "We are currently experiencing technical difficulties fetching the latest content from our server. Please check back later for updated information about our activities and achievements.",
        features: ["Technical Workshops", "Professional Networking", "Innovation Projects"]
    });

    // 4. Hydrate Stats
    if (window.FALLBACK_DATA.stats) {
        hydrateSocietyStats({
            total_years: window.FALLBACK_DATA.stats.years || 0,
            total_members: window.FALLBACK_DATA.stats.members || 0,
            total_projects: window.FALLBACK_DATA.stats.projects || 0,
            total_events: window.FALLBACK_DATA.stats.events || 0
        });
    }

    // 5. Hydrate Empty Values (optional)
    hydrateSocietyValues({ values: [] });
}
