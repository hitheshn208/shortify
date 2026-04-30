const state = {
    generatedShortUrl: "",
    generatedShortCode: "",
    qrGenerated: false
};

const elements = {
    createLinkForm: document.getElementById("createLinkForm"),
    originalUrl: document.getElementById("originalUrl"),
    passwordToggle: document.getElementById("passwordToggle"),
    passwordFieldWrap: document.getElementById("passwordFieldWrap"),
    linkPassword: document.getElementById("linkPassword"),
    passwordVisibilityBtn: document.getElementById("passwordVisibilityBtn"),
    passwordVisibilityIcon: document.getElementById("passwordVisibilityIcon"),
    formMessage: document.getElementById("formMessage"),
    createLinkBtn: document.getElementById("createLinkBtn"),
    linksContainer: document.getElementById("linksContainer"),
    emptyState: document.getElementById("emptyState"),
    totalLinksCount: document.getElementById("totalLinksCount"),
    totalClicksCount: document.getElementById("totalClicksCount"),
    myLinksNavBtn: document.getElementById("myLinksNavBtn"),
    myLinksSection: document.getElementById("myLinksSection"),
    profileToggle: document.getElementById("profileToggle"),
    profileDropdown: document.getElementById("profileDropdown"),
    resultModal: document.getElementById("resultModal"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    generatedShortUrl: document.getElementById("generatedShortUrl"),
    copyBtn: document.getElementById("copyBtn"),
    copyFeedback: document.getElementById("copyFeedback"),
    generateQrBtn: document.getElementById("generateQrBtn"),
    downloadQrBtn: document.getElementById("downloadQrBtn"),
    qrContainer: document.getElementById("qrContainer"),
    linkCardTemplate: document.getElementById("linkCardTemplate"),
    logout:  document.getElementById("logout")
};

function setFormMessage(message, type = "error") {
    if (!elements.formMessage) return;
    elements.formMessage.textContent = message;
    elements.formMessage.classList.toggle("success", type === "success");
}

function setCopyFeedback(message = "") {
    if (!elements.copyFeedback) return;
    elements.copyFeedback.textContent = message;
}

function getBaseUrl() {
    return "http://localhost:3000";
}

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function updateStats(totalLinksDelta = 0, totalClicksDelta = 0) {
    if (elements.totalLinksCount) {
        elements.totalLinksCount.textContent = String(toNumber(elements.totalLinksCount.textContent) + totalLinksDelta);
    }
    if (elements.totalClicksCount) {
        elements.totalClicksCount.textContent = String(toNumber(elements.totalClicksCount.textContent) + totalClicksDelta);
    }
}

function togglePasswordField() {
    if (!elements.passwordToggle || !elements.passwordFieldWrap || !elements.linkPassword) return;
    const isEnabled = elements.passwordToggle.checked;
    elements.passwordFieldWrap.classList.toggle("hidden", !isEnabled);
    elements.linkPassword.required = isEnabled;
    if (!isEnabled) {
        elements.linkPassword.value = "";
        elements.linkPassword.type = "password";
        setPasswordVisibilityIcon(false);
    }
}

function setPasswordVisibilityIcon(isVisible) {
    if (!elements.passwordVisibilityIcon || !elements.passwordVisibilityBtn) return;
    elements.passwordVisibilityIcon.src = isVisible
        ? "/assets/visibility_off_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"
        : "/assets/visibility.svg";
    elements.passwordVisibilityBtn.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
}

function togglePasswordVisibility() {
    if (!elements.linkPassword) return;
    const isVisible = elements.linkPassword.type === "text";
    elements.linkPassword.type = isVisible ? "password" : "text";
    setPasswordVisibilityIcon(!isVisible);
}

function openModal() {
    if (!elements.resultModal) return;
    elements.resultModal.classList.add("open");
    elements.resultModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    if (!elements.resultModal) return;
    elements.resultModal.classList.remove("open");
    elements.resultModal.setAttribute("aria-hidden", "true");
}

function resetQrUi() {
    if (elements.qrContainer) {
        elements.qrContainer.innerHTML = "";
        elements.qrContainer.classList.add("hidden");
    }
    if (elements.downloadQrBtn) {
        elements.downloadQrBtn.classList.add("hidden");
        elements.downloadQrBtn.removeAttribute("href");
    }
    if (elements.generateQrBtn) {
        elements.generateQrBtn.disabled = !state.generatedShortUrl;
    }
    state.qrGenerated = false;
}

function setModalShortUrl(shortUrl) {
    if (!elements.generatedShortUrl) return;
    elements.generatedShortUrl.href = shortUrl;
    elements.generatedShortUrl.textContent = shortUrl;
}

function createLinkCard(urlItem) {
    if (!elements.linkCardTemplate) return;

    const cardNode = elements.linkCardTemplate.content.firstElementChild.cloneNode(true);
    const shortLinkAnchor = cardNode.querySelector(".short-link-anchor");
    const linkOriginal = cardNode.querySelector(".link-original");
    const lockBadge = cardNode.querySelector(".lock-badge");
    const clickCount = cardNode.querySelector(".click-count");

    const shortUrl = `${getBaseUrl()}/${urlItem.short_code}`;
    const isProtected = Boolean(urlItem.is_protected);

    shortLinkAnchor.textContent = shortUrl;
    shortLinkAnchor.href = `/${urlItem.short_code}`;
    shortLinkAnchor.dataset.copyUrl = shortUrl;
    linkOriginal.textContent = urlItem.original_url;

    lockBadge.classList.add(isProtected ? "locked" : "unlocked");
    lockBadge.innerHTML = `
        <span class="material-symbols-rounded lock-badge-icon">${isProtected ? "lock" : "lock_open"}</span>
        <span>${isProtected ? "Protected" : "Public"}</span>
    `;
    clickCount.textContent = `${toNumber(urlItem.visit_count)} Clicks`;

    cardNode.dataset.detailUrl = `${getBaseUrl()}/${urlItem.short_code}/details`;
    return cardNode;
}

function prependLinkCard(urlItem) {
    if (!elements.linksContainer) return;
    const card = createLinkCard(urlItem);
    if (!card) return;

    if (elements.emptyState) {
        elements.emptyState.remove();
        elements.emptyState = null;
    }

    elements.linksContainer.prepend(card);
}

function handleCardNavigation(event) {
    const copyButton = event.target.closest(".short-link-copy-btn");
    if (copyButton) {
        event.preventDefault();
        event.stopPropagation();
        copyCardShortLink(copyButton);
        return;
    }

    const shortLinkAnchor = event.target.closest(".short-link-anchor");
    if (shortLinkAnchor) {
        return;
    }

    const card = event.target.closest(".link-card");
    if (!card || !elements.linksContainer?.contains(card)) return;

    const detailUrl = card.dataset.detailUrl;
    if (!detailUrl) return;
    window.location.href = detailUrl;
}

function handleCardKeyboardNavigation(event) {
    if (event.target.closest(".short-link-anchor") || event.target.closest(".short-link-copy-btn")) {
        return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".link-card");
    if (!card) return;

    event.preventDefault();
    const detailUrl = card.dataset.detailUrl;
    if (!detailUrl) return;
    window.location.href = detailUrl;
}

async function copyCardShortLink(copyButton) {
    const card = copyButton.closest(".link-card");
    const shortLinkAnchor = card?.querySelector(".short-link-anchor");
    const shortLink = shortLinkAnchor?.dataset.copyUrl || shortLinkAnchor?.textContent?.trim();
    if (!shortLink) return;

    try {
        await navigator.clipboard.writeText(shortLink);
        copyButton.classList.add("copied");
        copyButton.setAttribute("aria-label", "Copied");
        setTimeout(() => {
            copyButton.classList.remove("copied");
            copyButton.setAttribute("aria-label", "Copy short link");
        }, 1200);
    } catch (error) {
        copyButton.setAttribute("aria-label", "Copy failed");
        setTimeout(() => copyButton.setAttribute("aria-label", "Copy short link"), 1200);
    }
}

function handleProfileToggle() {
    if (!elements.profileDropdown || !elements.profileToggle) return;
    const isOpen = elements.profileDropdown.classList.toggle("open");
    elements.profileToggle.setAttribute("aria-expanded", String(isOpen));
    elements.profileDropdown.setAttribute("aria-hidden", String(!isOpen));
}

function closeProfileDropdownOnOutsideClick(event) {
    if (!elements.profileDropdown || !elements.profileToggle) return;
    const clickInsideMenu = event.target.closest(".profile-menu-wrap");
    if (clickInsideMenu) return;

    elements.profileDropdown.classList.remove("open");
    elements.profileToggle.setAttribute("aria-expanded", "false");
    elements.profileDropdown.setAttribute("aria-hidden", "true");
}

function smoothScrollToMyLinks() {
    if (!elements.myLinksSection) return;
    elements.myLinksSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyToClipboard() {
    if (!state.generatedShortUrl) return;

    try {
        await navigator.clipboard.writeText(state.generatedShortUrl);
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 1500);
    } catch (error) {
        setCopyFeedback("Copy failed. Please copy manually.");
    }
}

function setDownloadQrUrl() {
    if (!elements.qrContainer || !elements.downloadQrBtn) return;
    const canvas = elements.qrContainer.querySelector("canvas");
    const img = elements.qrContainer.querySelector("img");

    let qrDataUrl = "";
    if (canvas) qrDataUrl = canvas.toDataURL("image/png");
    if (!qrDataUrl && img) qrDataUrl = img.src;
    if (!qrDataUrl) return;

    elements.downloadQrBtn.href = qrDataUrl;
    elements.downloadQrBtn.classList.remove("hidden");
}

function generateQrCode() {
    if (!state.generatedShortUrl || !elements.qrContainer) return;

    elements.qrContainer.innerHTML = "";
    elements.qrContainer.classList.remove("hidden");

    // Reusing the existing qrcodejs approach already in your project.
    new QRCode(elements.qrContainer, {
        text: state.generatedShortUrl,
        width: 160,
        height: 160
    });

    state.qrGenerated = true;
    setTimeout(setDownloadQrUrl, 100);
}

async function createShortLink(event) {
    event.preventDefault();
    if (!elements.originalUrl || !elements.createLinkBtn) return;

    const originalUrl = elements.originalUrl.value.trim();
    const wantsPassword = Boolean(elements.passwordToggle?.checked);
    const linkPassword = elements.linkPassword?.value.trim() || null;

    if (!originalUrl) {
        setFormMessage("Long URL is required.");
        return;
    }

    if (wantsPassword && !linkPassword) {
        setFormMessage("Password is required when protection is enabled.");
        return;
    }

    elements.createLinkBtn.disabled = true;
    elements.createLinkBtn.textContent = "Creating...";
    setFormMessage("");

    try {
        const payload = {
            originalUrl,
            passwordProtected: wantsPassword,
            password: linkPassword
        };

        const response = await fetch("/user/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Unable to create short link");
        }

        const createdLink = await response.json();
        const shortUrl = `${getBaseUrl()}/${createdLink.short_code}`;

        state.generatedShortCode = createdLink.short_code;
        state.generatedShortUrl = shortUrl;

        setModalShortUrl(shortUrl);
        resetQrUi();
        openModal();
        prependLinkCard(createdLink);
        updateStats(1, toNumber(createdLink.visit_count));

        elements.createLinkForm?.reset();
        togglePasswordField();
        setFormMessage("Link created successfully.", "success");

    } catch (error) {
        setFormMessage("Could not create short link. Please try again.");
    } finally {
        setTimeout(()=>{
            setFormMessage("");
        }, 2000);
        elements.createLinkBtn.disabled = false;
        elements.createLinkBtn.textContent = "Create Short Link";
    }
}

async function logoutSession(e){
    e.target.disabled = true;
    e.target.textContent = "Logging out.."
    const res = await fetch("/auth/logout");

    const response = await res.json();
    if(!response.ok){
        e.target.disabled = false;
        e.target.textContent = "Logout"
    }
    window.location.replace(response.redirectUrl);
} 

function initEventListeners() {
    elements.passwordToggle?.addEventListener("change", togglePasswordField);
    elements.passwordVisibilityBtn?.addEventListener("click", togglePasswordVisibility);
    elements.createLinkForm?.addEventListener("submit", createShortLink);
    elements.myLinksNavBtn?.addEventListener("click", smoothScrollToMyLinks);

    elements.profileToggle?.addEventListener("click", handleProfileToggle);
    document.addEventListener("click", closeProfileDropdownOnOutsideClick);

    elements.linksContainer?.addEventListener("click", handleCardNavigation);
    elements.linksContainer?.addEventListener("keydown", handleCardKeyboardNavigation);

    elements.modalCloseBtn?.addEventListener("click", closeModal);
    elements.resultModal?.addEventListener("click", (event) => {
        if (event.target === elements.resultModal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });

    elements.copyBtn?.addEventListener("click", copyToClipboard);
    elements.generateQrBtn?.addEventListener("click", generateQrCode);
    elements.logout?.addEventListener("click", logoutSession);
}

function init() {
    togglePasswordField();
    setPasswordVisibilityIcon(false);
    resetQrUi();
    initEventListeners();
}

init();