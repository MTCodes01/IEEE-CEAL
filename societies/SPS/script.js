const API_URL = 'https://script.google.com/macros/s/AKfycbw9MXA3T0vC4bg1Rwqz7DY8xRAEQ8EjaQGLjZR6SEE90QoXvEWEfpsinLvJRUPfrGyaug/exec';

let latestYear = null;

// Count Up Animation Configuration
const countUpConfig = {
  years: {
    element: '.years',
    endValue: 0,
    duration: 2000, // milliseconds
    startDelay: 0   // delay before starting
  },
  members: {
    element: '.members',
    endValue: 0,
    duration: 3000,
    startDelay: 200
  },
  projects: {
    element: '.projects',
    endValue: 0,
    duration: 2500,
    startDelay: 400
  },
  events: {
    element: '.events',
    endValue: 0,
    duration: 2800,
    startDelay: 600
  }
};

function setupIntersectionObserver(selector, callback, options = {}) {
  // Set default options
  const defaultOptions = {
    threshold: 0.5,
    once: true,
    root: null,
    rootMargin: "0px",
  };
  const mergedOptions = { ...defaultOptions, ...options };

  const targetElement = document.querySelector(selector);

  if (!targetElement) {
    console.warn(
      `IntersectionObserver: Element with selector "${selector}" not found.`
    );
    return; // Exit if the element doesn't exist
  }

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Execute the provided callback function
          callback(entry);

          // If 'once' option is true, stop observing after the first intersection
          if (mergedOptions.once) {
            observerInstance.unobserve(entry.target);
          }
        }
      });
    },
    {
      threshold: mergedOptions.threshold,
      root: mergedOptions.root,
      rootMargin: mergedOptions.rootMargin,
    }
  );

  // Start observing the target element
  observer.observe(targetElement);
}

// Easing function for smooth animation
function easeOutQuart(t) {
  return 1 - (--t) * t * t * t;
}

// Count up animation function
function animateCountUp(config) {
  const element = document.querySelector(config.element);
  if (!element) return;
  
  const startValue = 0;
  const endValue = config.endValue;
  const duration = config.duration;
  const startTime = performance.now() + config.startDelay;
  
  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    
    if (elapsed < 0) {
      requestAnimationFrame(updateCount);
      return;
    }
    
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
    
    // Format large numbers with commas
    element.textContent = currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.textContent = endValue.toLocaleString();
    }
  }
  
  requestAnimationFrame(updateCount);
}

// Initialize all animations
async function startCountUpAnimations() {
  await window.fetchDynamicStats(countUpConfig, false, 'SPS');
  Object.values(countUpConfig).forEach(config => {
    animateCountUp(config);
  });
}

function restartAnimations() {
  // Reset all counters to 0
  Object.values(countUpConfig).forEach(config => {
    const element = document.querySelector(config.element);
    if (element) element.textContent = '0';
  });
  
  // Start animations after a brief delay
  setTimeout(startCountUpAnimations, 100);
}

async function FetchPeopleByRoles() {
    let res = await fetch(`${API_URL}?role`);
    let data = await res.json();
    if (!data || !data.people || !Array.isArray(data.people) || data.people.length === 0) {
        return;
    }
    latestYear = data.year; // Save the latest year from API
    CreateCard(data.people);
}
function CreateCard(people) {
    const teamDiv = document.getElementById('team');
    teamDiv.innerHTML = '';
    people.forEach(person => {
        const card = document.createElement('div');
        card.className = 'person-card';
        card.innerHTML = `
        <img class="person-photo" src="${person.photo_url}" alt="${person.Name || ''}" />
        <div class="person-name">${person.Name || ''}</div>
        <div class="person-society">${person.society || ''}</div>
        <div class="person-role">${person.role || ''}</div>
        <div class="person-contact">
        ${person.email ? `<a href="mailto:${person.email}" target="_blank" title="Mail"><i class="fa-solid fa-envelope"></i></a>` : ''}
        ${person.linkedin ? `<a href="https://linkedin.com/in/${person.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
        ${person.instagram ? `<a href="https://instagram.com/${person.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
        </div>
        `;
        teamDiv.appendChild(card);
    });
    const executivediv = document.getElementById('executivediv');
    executivediv.style.display = 'block';
}
// document.getElementById('ExecutiveePageBtn').onclick = () => {
//     if (latestYear) {
//         window.location.href = `/execom/index.html?year=${latestYear}`;
//     } else {
//         alert("Year not loaded yet!");
//     }
// };

function AnimateLogoBar() {
  // Animate the logo bar
  const logoBar = document.getElementById("LogoBar");
  if (!logoBar) {
    console.error("LogoBar element not found.");
    return;
  }

  const logos = logoBar.querySelectorAll("img");
  const startDelay = 100; // Initial delay before starting the animation
  const animationDelay = 250; // Delay between each logo animation in milliseconds
  const animationDuration = 1000; // Duration of each logo's fade-in animation in milliseconds

  // Initially hide all logos
  logos.forEach((logo) => {
    logo.style.opacity = "0";
    logo.style.transition = `filter 0.3s ease-in-out, opacity ${animationDuration}ms ease-in-out`;
  });

  // Reveal logos one by one after the initial delay
  setTimeout(() => {
    logos.forEach((logo, index) => {
      setTimeout(() => {
        logo.style.opacity = "1";
      }, index * animationDelay);
    });
  }, startDelay);
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the stats section
  setupIntersectionObserver(".stats", startCountUpAnimations, { threshold: 0.5, once: true });

  // Initialize the logo bar animation
  setupIntersectionObserver("#LogoBar", AnimateLogoBar, { threshold: 0.1, once: true });

  // Fetch and display people by roles
  // FetchPeopleByRoles();
});