document.addEventListener("DOMContentLoaded", () => {
  // Load navbar from site root
  fetch("/nav-bar.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("NavBar").innerHTML = data;

      const navContainer = document.querySelector(".nav-container");
      const hamburger = document.querySelector(".hamburger");
      const navhold = document.querySelector(".navhold");
      const scrollThreshold = 50;

      const currentPath = (() => {
        const path = window.location.pathname;
        const slashCount = (path.match(/\//g) || []).length;
        console.log("Path:", path, "Slash Count:", slashCount);
        if (slashCount === 1 || slashCount === 2) {
          return path;
        } else {
          return path.split("/").slice(0, 2).join("/") + "/";
        }
      })();
      console.log("Current Path:", currentPath);
      // Remove active from all redirect-links
      document.querySelectorAll(".redirect-link").forEach((link) => {
        link.classList.remove("active");
      });
      // Add active to the matching link
      const activeLink = document.querySelector(
        `.redirect-link[href="${currentPath}"]`
      );
      if (activeLink) {
        activeLink.classList.add("active");
      }

      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navhold.classList.toggle("active");
      });

      // Mobile dropdown toggle
      const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

      dropdownToggles.forEach((toggle) => {
        toggle.addEventListener("click", (e) => {
          if (window.innerWidth <= 1100) {
            e.preventDefault();
            const dropdown = toggle.parentElement;
            const openedDropdowns =
              document.querySelectorAll(".dropdown.active");
            openedDropdowns.forEach((openedDropdown) => {
              if (openedDropdown !== dropdown) {
                openedDropdown.classList.remove("active");
              }
            });
            dropdown.classList.toggle("active");
          }
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 1100) {
          if (!navhold.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove("active");
            navhold.classList.remove("active");

            // Close all dropdowns
            document.querySelectorAll(".dropdown").forEach((dropdown) => {
              dropdown.classList.remove("active");
            });
          }
        }
      });

      window.addEventListener("scroll", () => {
        if (window.scrollY > scrollThreshold) {
          navContainer.classList.add("scrolled");
        } else {
          navContainer.classList.remove("scrolled");
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 1100) {
          hamburger.classList.remove("active");
          navhold.classList.remove("active");

          // Close all mobile dropdowns
          document.querySelectorAll(".dropdown").forEach((dropdown) => {
            dropdown.classList.remove("active");
          });
        }
      });

      // Populate Execom years dropdown
      (async function populateExecomYears() {
        const dropdown = document.getElementById('execom-years-dropdown');
        if (!dropdown) return;

        try {
          // Get API base URL
          const apiBaseUrl = CONFIG.API_BASE_URL;

          // Fetch available years from API
          const response = await fetch(`${apiBaseUrl}/allyears/`);
          const data = await response.json();

          if (data.allyears && Array.isArray(data.allyears)) {
            // Sort years in descending order (newest first)
            const years = data.allyears.sort((a, b) => b - a);

            // Populate dropdown with years
            years.forEach(year => {
              const li = document.createElement('li');
              const a = document.createElement('a');
              a.href = `/execom/?year=${year}`;
              a.textContent = `Execom ${year}`;
              li.appendChild(a);
              dropdown.appendChild(li);
            });
          }
        } catch (error) {
          console.error('Error loading Execom years:', error);
          // Fallback: add fallback years if API fails
          const fallbackYears = window.FALLBACK_DATA ? window.FALLBACK_DATA.execomYears : [new Date().getFullYear()];
          fallbackYears.forEach(year => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `/execom/?year=${year}`;
            a.textContent = `Execom ${year}`;
            li.appendChild(a);
            dropdown.appendChild(li);
          });
        }
      })();

      // Populate Societies navbar dropdown dynamically from API
      (async function populateSocietiesDropdown() {
        const dropdown = document.getElementById('societies-nav-dropdown');
        if (!dropdown) return;

        const apiBaseUrl = CONFIG.API_BASE_URL;

        try {
          const response = await fetch(`${apiBaseUrl}/societies/`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();

          let societies = data.societies || data.data || data;
          if (!Array.isArray(societies) || societies.length === 0) throw new Error('empty');

          // Filter out Professional Execom (id 1) and IEEE SB CEAL (id 2)
          societies = societies.filter(soc => soc.id !== 1 && soc.id !== 2);

          // Sort alphabetically by ascending name
          societies.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

          // Replace static content with API-driven links
          dropdown.innerHTML = '';
          societies.forEach(soc => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `/societies/${soc.name}/`;
            a.textContent = soc.full_name || soc.name;
            li.appendChild(a);
            dropdown.appendChild(li);
          });
        } catch (err) {
          console.warn('Societies dropdown: API unavailable, using fallback data.', err);
          if (window.FALLBACK_DATA && window.FALLBACK_DATA.societies) {
             let societies = window.FALLBACK_DATA.societies.filter(soc => soc.id !== 1 && soc.id !== 2);
             dropdown.innerHTML = '';
             societies.forEach(soc => {
               const li = document.createElement('li');
               const a = document.createElement('a');
               a.href = `/societies/${soc.name}/`;
               a.textContent = soc.full_name || soc.name;
               li.appendChild(a);
               dropdown.appendChild(li);
             });
          }
        }
      })();
    });

  // Load footer from site root
  fetch("/footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("Footer").innerHTML = data;

      const yearSpan = document.getElementById("yr");
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    })
    .catch(err => {
      console.warn("Footer load failed, using basic fallback.");
      const footerEl = document.getElementById("Footer");
      if (footerEl) {
        footerEl.innerHTML = `<footer style="text-align:center; padding: 20px; background: #f8f9fa;">&copy; ${new Date().getFullYear()} IEEE Student Branch CEAL</footer>`;
      }
    });

  /**
   * Dynamically loads page header content (Title, Subtitle, Banner) from the backend.
   * @param {string} pageName - The identifier for the page (e.g., 'home', 'events', 'execom').
   */
  window.loadPageHeader = async function (pageName, year = null) {
    const apiBaseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : '/api';
    
    let url = `${apiBaseUrl}/pages/${pageName}/`;
    if (year) {
      url += `?year=${year}`;
    }

    function applyHeaderData(page) {
        // Update Title
        const titleEl = document.getElementById('page-title') || document.getElementById('ExecomMainText') || document.querySelector('.landing-content h1');
        if (titleEl && page.title) titleEl.textContent = page.title;

        // Update Subtitle
        const subtitleEl = document.getElementById('page-subtitle') || document.querySelector('.landing-content p');
        if (subtitleEl && page.subtitle) subtitleEl.textContent = page.subtitle;

        // Update Banner Image
        const bannerUrl = page.main_image_url || 'https://img.freepik.com/free-vector/art-gallery-empty-room-with-white-walls-lamps_107791-1490.jpg?semt=ais_incoming&w=740&q=80';
        
        const landingPage = document.querySelector('.landing-page') ||
          document.querySelector('.landing-page-execom') ||
          document.querySelector('.landing-page-about') ||
          document.querySelector('.landing-page-gallery') ||
          document.querySelector('.landing-page-resources') ||
          document.querySelector('.landing-events');

        if (landingPage) {
          landingPage.style.backgroundImage = `url('${bannerUrl}')`;
          landingPage.style.backgroundSize = 'cover';
          landingPage.style.backgroundPosition = 'center';
        }

        // Update Description (if applicable)
        const descEl = document.getElementById('page-description') || document.getElementById('AboutDescriptionText') || document.querySelector('.about-text p');
        if (descEl && page.description) descEl.innerHTML = page.description.replace(/\n/g, '<br>');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("API request failed with status " + response.status);
      const data = await response.json();

      if (data.status === 'success' && data.page) {
        applyHeaderData(data.page);
        return; // Success
      } else {
        throw new Error("Invalid API response data");
      }
    } catch (error) {
      console.warn(`Error loading header for ${pageName}, falling back to static config:`, error);
      if (window.FALLBACK_DATA && window.FALLBACK_DATA.pages && window.FALLBACK_DATA.pages[pageName]) {
          applyHeaderData(window.FALLBACK_DATA.pages[pageName]);
      }
    }
  };
});
