"use strict";

// All panels are present without JavaScript; enhancement only changes presentation.
const atlasControls = document.querySelector(".atlas-controls");
const atlasButtons = [...document.querySelectorAll("[data-atlas]")];
const atlasPanels = [...document.querySelectorAll("[data-atlas-panel]")];
if (atlasControls && atlasButtons.length && atlasPanels.length) {
  function chooseSystem(key) {
    atlasButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.atlas === key)),
    );
    atlasPanels.forEach((panel) => {
      panel.hidden = panel.dataset.atlasPanel !== key;
    });
  }
  chooseSystem("linepulse");
  atlasControls.hidden = false;
  atlasButtons.forEach(button => { button.disabled = false; });
  atlasButtons.forEach((button) =>
    button.addEventListener("click", () => chooseSystem(button.dataset.atlas)),
  );
}

const copyEmail = document.querySelector("[data-copy-email]");
if (copyEmail && navigator.clipboard && window.isSecureContext) {
  copyEmail.hidden = false;
  copyEmail.addEventListener("click", async () => {
    const status = document.querySelector(".copy-status");
    const swedish = document.documentElement.lang === "sv";
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.copyEmail);
      status.textContent = swedish
        ? "Adressen är kopierad."
        : "Email address copied.";
    } catch {
      status.textContent = swedish
        ? "Markera och kopiera adressen ovan."
        : "Select and copy the address above.";
    }
  });
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  let scheduled = false;
  const update = () => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0})`;
    scheduled = false;
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener("load", schedule, { once: true });
  update();
}
