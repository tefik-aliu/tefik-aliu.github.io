"use strict";

// The mailto link works without JavaScript; copying is an optional convenience.
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
