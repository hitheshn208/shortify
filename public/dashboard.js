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
    linkCardTemplate: document.getElementById("linkCardTemplate")
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
    return window.location.origin;
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
    if (!isEnabled) elements.linkPassword.value = "";
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
    const linkTitle = cardNode.querySelector(".link-title");
    const linkOriginal = cardNode.querySelector(".link-original");
    const lockBadge = cardNode.querySelector(".lock-badge");
    const clickCount = cardNode.querySelector(".click-count");

    const shortUrl = `${getBaseUrl()}/${urlItem.short_code}`;
    const isProtected = Boolean(urlItem.password_hash || urlItem.is_password_protected || urlItem.password_protected);

    linkTitle.textContent = shortUrl;
    linkOriginal.textContent = urlItem.original_url;

    lockBadge.classList.add(isProtected ? "locked" : "unlocked");
    lockBadge.textContent = isProtected ? "🔒 Protected" : "🔓 Public";
    clickCount.textContent = `${toNumber(urlItem.visit_count)} Clicks`;

    // TODO: adjust this path if your Link Details route is different.
    cardNode.dataset.detailUrl = `/user/links/${urlItem.short_code}`;
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
    const card = event.target.closest(".link-card");
    if (!card || !elements.linksContainer?.contains(card)) return;

    const detailUrl = card.dataset.detailUrl;
    if (!detailUrl) return;
    window.location.href = detailUrl;
}

function handleCardKeyboardNavigation(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".link-card");
    if (!card) return;

    event.preventDefault();
    const detailUrl = card.dataset.detailUrl;
    if (!detailUrl) return;
    window.location.href = detailUrl;
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
    const linkPassword = elements.linkPassword?.value.trim() || "";

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

        // TODO: backend currently returns { original_url, short_code, visit_count }.
        // If you add password metadata in API response, lock badge can reflect it immediately.
    } catch (error) {
        setFormMessage("Could not create short link. Please try again.");
    } finally {
        elements.createLinkBtn.disabled = false;
        elements.createLinkBtn.textContent = "Create Short Link";
    }
}

function initEventListeners() {
    elements.passwordToggle?.addEventListener("change", togglePasswordField);
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
}

function init() {
    togglePasswordField();
    resetQrUi();
    initEventListeners();
}

init();