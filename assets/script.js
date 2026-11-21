const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const progress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
const toast = document.getElementById("toast");

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

// Theme — dark / light toggle
const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "light") root.classList.add("light");

function updateThemeLabel() {
    const isLight = root.classList.contains("light");
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    document.querySelector('meta[name="theme-color"]').content = isLight ? "#f6f7fb" : "#10131c";
}
updateThemeLabel();

themeToggle.addEventListener("click", () => {
    root.classList.toggle("light");
    localStorage.setItem("portfolio-theme", root.classList.contains("light") ? "light" : "dark");
    updateThemeLabel();
});

// Mobile navigation
menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    mobileNav.hidden = isOpen;
});
mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}));

// Scroll progress, back-to-top, and reveal-on-scroll
function onScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${percent}%`;
    backToTop.classList.toggle("visible", window.scrollY > 500);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Full-width site search
const searchForm = document.getElementById("siteSearch");
const searchInput = document.getElementById("searchInput");
const searchFeedback = document.getElementById("searchFeedback");
searchForm.addEventListener("submit", event => {
    event.preventDefault();
    const term = searchInput.value.trim().toLowerCase();
    if (!term) {
        searchFeedback.textContent = "Enter a keyword to search this portfolio.";
        searchInput.focus();
        return;
    }
    const searchable = [...document.querySelectorAll("[data-search], #about, #skills, #experience, #contact, #faq")];
    const match = searchable.find(el => (el.innerText + " " + (el.dataset.search || "")).toLowerCase().includes(term));
    if (match) {
        match.scrollIntoView({ behavior: "smooth", block: "center" });
        searchFeedback.textContent = `Showing the closest match for “${searchInput.value.trim()}”.`;
    } else {
        searchFeedback.textContent = `No results found for “${searchInput.value.trim()}”. Try “React”, “pharmacy”, or “experience”.`;
    }
});

// Copy repository links
document.querySelectorAll("[data-copy]").forEach(button => {
button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast("Repository link copied.");
    } catch {
      showToast("Clipboard access is unavailable in this browser.");
    }
  });
});

// Cookie notice
const cookieBanner = document.getElementById("cookieBanner");
if (localStorage.getItem("portfolio-cookie-choice")) cookieBanner.classList.add("dismissed");
function dismissCookie(choice) {
  localStorage.setItem("portfolio-cookie-choice", choice);
  cookieBanner.classList.add("dismissed");
}
document.getElementById("acceptCookies").addEventListener("click", () => dismissCookie("accepted"));
document.getElementById("dismissCookies").addEventListener("click", () => dismissCookie("dismissed"));

// Confirmation modal — reusable, no destructive action is wired up right now
const confirmModal = document.getElementById("confirmModal");
const closeModal = () => { confirmModal.hidden = true; };
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelConfirm").addEventListener("click", closeModal);
confirmModal.addEventListener("click", event => { if (event.target === confirmModal) closeModal(); });
document.getElementById("confirmAction").addEventListener("click", () => {
    closeModal();
    showToast("Confirmation received. No portfolio data was deleted.");
});

// UTM tracking for outbound links. Existing query strings are preserved.
document.querySelectorAll("a[data-outbound]").forEach(link => {
  try {
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) {
      url.searchParams.set("utm_source", "ekene-portfolio");
      url.searchParams.set("utm_medium", "website");
      url.searchParams.set("utm_campaign", "portfolio_outbound");
      link.href = url.toString();
    }
  } catch { /* Leave invalid or non-URL links unchanged. */ }
});

// Footer year — fills in <span id="year"> automatically
document.getElementById("year").textContent = new Date().getFullYear();
