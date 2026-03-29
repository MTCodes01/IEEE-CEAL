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
          // Fallback: add current year if API fails
          const currentYear = new Date().getFullYear();
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `/execom/?year=${currentYear}`;
          a.textContent = `Execom ${currentYear}`;
          li.appendChild(a);
          dropdown.appendChild(li);
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
          console.warn('Societies dropdown: API unavailable, keeping static links.', err);
          // Static links already in the HTML — nothing to do
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
    });
});
