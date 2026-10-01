"use strict";

// Core content and native disclosures work without JavaScript.
const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-button");
const navigation = document.querySelector("#site-nav");
const mobile = window.matchMedia("(max-width: 600px)");
if (header && menu && navigation) {
  const closeMenu = (restoreFocus = false) => {
    menu.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
    if (restoreFocus) menu.focus();
  };
  const syncMenu = () => {
    menu.hidden = !mobile.matches;
    if (mobile.matches && navigation.contains(document.activeElement))
      menu.focus();
    closeMenu();
  };
  header.classList.add("menu-ready");
  syncMenu();
  mobile.addEventListener("change", syncMenu);
  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(expanded));
    navigation.classList.toggle("open", expanded);
  });
  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    closeMenu();
    if (mobile.matches && link.hash && link.pathname === location.pathname) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      }
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true")
      closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
}
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const sectionLinks = [...document.querySelectorAll("[data-section]")];
if ("IntersectionObserver" in window && document.querySelector(".hero")) {
  const visibleSections = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        visibleSections.set(entry.target.id, entry.isIntersecting),
      );
      const current = sectionLinks.find((link) =>
        visibleSections.get(link.dataset.section),
      );
      sectionLinks.forEach((link) => {
        if (link === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-10% 0px -35% 0px", threshold: 0 },
  );
  sectionLinks.forEach((link) => {
    const section = document.getElementById(link.dataset.section);
    if (section) observer.observe(section);
  });
}

const toolbar = document.querySelector(".findings-toolbar");
const filters = [...document.querySelectorAll("[data-filter]")];
const findings = [...document.querySelectorAll(".finding-detail")];
const count = document.getElementById("finding-count");
if (toolbar && filters.length && findings.length && count) {
  toolbar.hidden = false;
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      const severity = button.dataset.filter;
      filters.forEach((filter) =>
        filter.setAttribute("aria-pressed", String(filter === button)),
      );
      let visible = 0;
      findings.forEach((finding) => {
        finding.hidden =
          severity !== "all" && finding.dataset.severity !== severity;
        if (!finding.hidden) visible += 1;
      });
      count.textContent = `${visible} ${visible === 1 ? "finding" : "findings"}`;
    }),
  );
}
