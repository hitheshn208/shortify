/* ================================================
   SHORTIFY LINK DETAILS - PRODUCTION JS
   Interactive elements and API handlers
   ================================================ */

/**
 * Toast Notification System
 */
class Toast {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }
}

/**
 * Modal Confirmation System
 */
class ConfirmationModal {
    static open(title, message, confirmText = 'Confirm', callback) {
        const modal = document.getElementById('confirmationModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn = document.getElementById('modalCancel');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Update confirm button text
        confirmBtn.textContent = confirmText;

        // Remove old event listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Add new event listener
        newConfirmBtn.addEventListener('click', () => {
            this.close();
            callback(true);
        });

        // Cancel button
        cancelBtn.onclick = () => {
            this.close();
            callback(false);
        };

        // Show modal
        modal.style.display = 'flex';

        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        overlay.onclick = () => this.close();
    }

    static close() {
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'none';
    }
}

const pageData = document.body.dataset;
const urlData = {
    id: pageData.urlId || '',
    short_url: pageData.shortUrl || '',
    short_code: pageData.shortCode || '',
    original_url: pageData.originalUrl || '',
    clicks: Number(pageData.clicks || 0),
    created_at: pageData.createdAt || '',
    status: pageData.status || 'Active',
    password_protected: pageData.passwordProtected === '1',
    user_name: pageData.userName || 'User Name',
    user_email: pageData.userEmail || ''
};

/**
 * Copy to Clipboard Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==================== QR CODE GENERATION ====================
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    if (qrCodeContainer) {
        // Clear previous QR code if any
        qrCodeContainer.innerHTML = '';
        
        // Generate QR code for the short URL
        new QRCode(qrCodeContainer, {
            text: urlData.short_url || window.location.href,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // ==================== NAVBAR: PROFILE DROPDOWN ====================
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = profileDropdown.classList.toggle('open');
            profileToggle.setAttribute('aria-expanded', String(isOpen));
            profileDropdown.setAttribute('aria-hidden', String(!isOpen));
        });

        document.addEventListener('click', (event) => {
            if (!profileDropdown.contains(event.target) && !profileToggle.contains(event.target)) {
                profileDropdown.classList.remove('open');
                profileToggle.setAttribute('aria-expanded', 'false');
                profileDropdown.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // ==================== SECTION 1: COPY BUTTON ====================
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const url = copyBtn.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                Toast.success('Link copied to clipboard!');
                const icon = copyBtn.querySelector('.material-symbols-rounded');
                icon.textContent = 'check';
                copyBtn.style.background = '#E8EFFE';

                setTimeout(() => {
                    icon.textContent = 'content_copy';
                    copyBtn.style.background = 'transparent';
                }, 2000);
            }).catch(() => {
                Toast.error('Failed to copy link');
            });
        });
    }

    // ==================== SECTION 1: EDIT URL ====================
    const editUrlBtn = document.getElementById('editUrlBtn');
    const saveUrlBtn = document.getElementById('saveUrlBtn');
    const cancelUrlBtn = document.getElementById('cancelUrlBtn');
    const originalUrlInput = document.getElementById('originalUrl');
    let isEditMode = false;

    if (editUrlBtn && originalUrlInput) {
        // Edit button click handler
        editUrlBtn.addEventListener('click', () => {
            if (!isEditMode) {
                // Enter edit mode
                isEditMode = true;
                originalUrlInput.removeAttribute('readonly');
                originalUrlInput.focus();
                editUrlBtn.style.display = 'none';
                saveUrlBtn.style.display = 'inline-flex';
                cancelUrlBtn.style.display = 'inline-flex';
            }
        });
    }

    if (saveUrlBtn && originalUrlInput) {
        // Save button click handler
        saveUrlBtn.addEventListener('click', async () => {
            const newUrl = originalUrlInput.value.trim();

            if (!newUrl) {
                Toast.error('Please enter a valid URL');
                return;
            }

            if (!isValidUrl(newUrl)) {
                Toast.error('Please enter a valid URL format');
                return;
            }

            await updateOriginalUrl(newUrl);
            
            // Exit edit mode after successful save
            isEditMode = false;
            originalUrlInput.setAttribute('readonly', '');
            editUrlBtn.style.display = 'inline-flex';
            saveUrlBtn.style.display = 'none';
            cancelUrlBtn.style.display = 'none';
        });

        // Allow save on Enter key
        originalUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && isEditMode) {
                saveUrlBtn.click();
            }
        });
    }

    if (cancelUrlBtn && originalUrlInput) {
        // Cancel button click handler
        cancelUrlBtn.addEventListener('click', () => {
            if (isEditMode) {
                isEditMode = false;
                originalUrlInput.setAttribute('readonly', '');
                originalUrlInput.value = urlData.original_url;
                editUrlBtn.style.display = 'inline-flex';
                saveUrlBtn.style.display = 'none';
                cancelUrlBtn.style.display = 'none';
                Toast.warning('Edit cancelled');
            }
        });

        // Escape key to cancel edit mode
        originalUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isEditMode) {
                cancelUrlBtn.click();
            }
        });
    }

    // ==================== SECTION 2: QR CODE ACTIONS ====================
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    const shareQrBtn = document.getElementById('shareQrBtn');

    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', () => {
            ConfirmationModal.open(
                'Download QR Code',
                'Are you sure you want to download the QR code?',
                'Download',
                (confirmed) => {
                    if (confirmed) {
                        downloadQRCode();
                    }
                }
            );
        });
    }

    if (shareQrBtn) {
        shareQrBtn.addEventListener('click', () => {
            shareQRCode();
        });
    }

    // ==================== SECTION 3: PASSWORD SECURITY STATES ====================
    const securitySetupView = document.getElementById('securitySetupView');
    const securityProtectedView = document.getElementById('securityProtectedView');
    const editPasswordPanel = document.getElementById('editPasswordPanel');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('passwordInput');
    const togglePasswordVisibility = document.getElementById('togglePasswordVisibility');
    const saveSecurityBtn = document.getElementById('saveSecurityBtn');
    const editPasswordBtn = document.getElementById('editPasswordBtn');
    const removePasswordBtn = document.getElementById('removePasswordBtn');
    const cancelEditPasswordBtn = document.getElementById('cancelEditPasswordBtn');
    const saveEditPasswordBtn = document.getElementById('saveEditPasswordBtn');
    const editPasswordInput = document.getElementById('editPasswordInput');
    const toggleEditPasswordVisibility = document.getElementById('toggleEditPasswordVisibility');

    const setSecurityState = (isProtected) => {
        urlData.password_protected = isProtected;

        if (securitySetupView && securityProtectedView) {
            securitySetupView.classList.toggle('hidden', isProtected);
            securityProtectedView.classList.toggle('hidden', !isProtected);
        }

        if (!isProtected) {
            if (editPasswordPanel) {
                editPasswordPanel.classList.add('hidden');
            }

            if (editPasswordInput) {
                editPasswordInput.value = '';
                editPasswordInput.type = 'password';
            }

            if (toggleEditPasswordVisibility) {
                const icon = toggleEditPasswordVisibility.querySelector('.material-symbols-rounded');
                if (icon) {
                    icon.textContent = 'visibility_off';
                }
            }
        }
    };

    if (passwordToggle && passwordField) {
        passwordToggle.addEventListener('change', () => {
            passwordField.classList.toggle('hidden', !passwordToggle.checked);
        });
    }

    if (togglePasswordVisibility && passwordInput) {
        togglePasswordVisibility.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            const icon = togglePasswordVisibility.querySelector('.material-symbols-rounded');
            if (icon) {
                icon.textContent = isPassword ? 'visibility' : 'visibility_off';
            }
        });
    }

    if (toggleEditPasswordVisibility && editPasswordInput) {
        toggleEditPasswordVisibility.addEventListener('click', () => {
            const isPassword = editPasswordInput.type === 'password';
            editPasswordInput.type = isPassword ? 'text' : 'password';

            const icon = toggleEditPasswordVisibility.querySelector('.material-symbols-rounded');
            if (icon) {
                icon.textContent = isPassword ? 'visibility' : 'visibility_off';
            }
        });
    }

    if (saveSecurityBtn && passwordToggle && passwordInput) {
        saveSecurityBtn.addEventListener('click', async () => {
            const isProtected = passwordToggle.checked;
            const password = passwordInput.value.trim();

            if (!isProtected) {
                await updateSecuritySettings(false, '');
                setSecurityState(false);
                passwordToggle.checked = false;
                passwordInput.value = '';
                passwordField.classList.add('hidden');
                Toast.success('Password protection removed');
                return;
            }

            if (!password) {
                Toast.error('Please enter a password');
                return;
            }

            if (password.length < 4) {
                Toast.error('Password must be at least 4 characters');
                return;
            }

            await updateSecuritySettings(true, password);
            passwordInput.value = '';
            setSecurityState(true);
            Toast.success('Security settings updated successfully!');
        });
    }

    if (editPasswordBtn && editPasswordPanel && editPasswordInput) {
        editPasswordBtn.addEventListener('click', () => {
            editPasswordPanel.classList.remove('hidden');
            editPasswordInput.value = '';
            editPasswordInput.type = 'password';
            editPasswordInput.focus();
        });
    }

    if (cancelEditPasswordBtn && editPasswordPanel && editPasswordInput) {
        cancelEditPasswordBtn.addEventListener('click', () => {
            editPasswordInput.value = '';
            editPasswordInput.type = 'password';
            editPasswordPanel.classList.add('hidden');

            if (toggleEditPasswordVisibility) {
                const icon = toggleEditPasswordVisibility.querySelector('.material-symbols-rounded');
                if (icon) {
                    icon.textContent = 'visibility_off';
                }
            }
        });
    }

    if (saveEditPasswordBtn && editPasswordInput) {
        saveEditPasswordBtn.addEventListener('click', async () => {
            const password = editPasswordInput.value.trim();

            if (!password) {
                Toast.error('Please enter a password');
                return;
            }

            if (password.length < 4) {
                Toast.error('Password must be at least 4 characters');
                return;
            }

            await updateSecuritySettings(true, password);
            editPasswordInput.value = '';
            if (editPasswordPanel) {
                editPasswordPanel.classList.add('hidden');
            }
            Toast.success('Password updated successfully!');
        });

        editPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEditPasswordBtn.click();
            }
        });
    }

    if (removePasswordBtn) {
        removePasswordBtn.addEventListener('click', () => {
            ConfirmationModal.open(
                'Remove Password',
                'Are you sure you want to remove password protection from this link?',
                'Remove',
                async (confirmed) => {
                    if (confirmed) {
                        await updateSecuritySettings(false, '');
                        if (passwordToggle) {
                            passwordToggle.checked = false;
                        }
                        if (passwordInput) {
                            passwordInput.value = '';
                        }
                        setSecurityState(false);
                        if (passwordField) {
                            passwordField.classList.add('hidden');
                        }
                        Toast.success('Password protection removed');
                    }
                }
            );
        });
    }

    setSecurityState(urlData.password_protected);

    // ==================== SECTION 4: RESET CLICKS ====================
    const resetClicksBtn = document.getElementById('resetClicksBtn');

    if (resetClicksBtn) {
        resetClicksBtn.addEventListener('click', () => {
            ConfirmationModal.open(
                'Reset Click Count',
                'Are you sure you want to reset the click counter? This action cannot be undone.',
                'Reset Clicks',
                (confirmed) => {
                    if (confirmed) {
                        resetClicks();
                    }
                }
            );
        });
    }

    // ==================== SECTION 4: DELETE LINK ====================
    const deleteLinkBtn = document.getElementById('deleteLinkBtn');

    if (deleteLinkBtn) {
        deleteLinkBtn.addEventListener('click', () => {
            ConfirmationModal.open(
                'Delete Link',
                'Are you sure you want to permanently delete this link? This action cannot be undone.',
                'Delete',
                (confirmed) => {
                    if (confirmed) {
                        deleteLink();
                    }
                }
            );
        });
    }
});

/* ================================================
   URL VALIDATION
   ================================================ */

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/* ================================================
   API HANDLERS - @BACKEND IMPLEMENTATION REQUIRED
   ================================================ */

/**
 * Update Original URL
 * @BACKEND: Implement PUT /api/links/:id/url
 */
async function updateOriginalUrl(newUrl) {
    const urlCode = urlData?.short_code;
    const urlId = urlData?.id;

    if (!urlCode || !urlId) {
        Toast.error('URL ID not found');
        return;
    }

    const btn = document.getElementById('saveUrlBtn');
    const originalBtnHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-rounded">hourglass_empty</span>Saving...';

    try {
        const response = await fetch(`/${urlCode}/edit`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                id: urlId,
                newUrl })
        });

        if (!response.ok) {
            throw new Error('Failed to update URL');
        }

        // Update internal URL data
        urlData.original_url = newUrl;
        Toast.success('URL updated successfully!');
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Failed to update URL. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
    }
}

/**
 * Download QR Code
 * @BACKEND: Implement POST /api/links/:id/qr/download
 */
async function downloadQRCode() {
    const urlId = urlData?.short_url;
    const qrContainer = document.getElementById('qrCodeContainer');

    if (!qrContainer) {
        Toast.error('QR code container not found');
        return;
    }

    try {
        // Get the canvas from the QR code container
        const canvas = qrContainer.querySelector('canvas');
        
        if (!canvas) {
            Toast.error('QR code not available');
            return;
        }

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-code-${urlId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            Toast.success('QR code downloaded!');
        });
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Failed to download QR code');
    }
}

/**
 * Share QR Code
 * @BACKEND: Implement POST /api/links/:id/qr/share
 */
async function shareQRCode() {
    const urlId = urlData?.id;
    const shortUrl = urlData?.short_url;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Share QR Code',
                text: `Check out this shortened link: ${shortUrl}`,
                url: shortUrl
            });
            Toast.success('Shared successfully!');
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error:', error);
                Toast.error('Failed to share');
            }
        }
    } else {
        // Fallback for browsers that don't support Web Share API
        Toast.warning('Copy the link to share it manually');
    }
}

/**
 * Update Security Settings
 * Local UI state only for now; backend can be wired in later.
 */
async function updateSecuritySettings(isProtected, password) {
    const urlId = urlData?.id;
    const urlCode = urlData?.short_code;

    if (!urlId || !urlCode) {
        Toast.error('URL ID not found');
        return false;
    }

    const res = await fetch(`/${urlCode}/security`, {
        method : "PATCH",
        headers: { 
            "Content-type" : "application/json"
        },
        body: JSON.stringify({
            id: urlId,
            isProtected,
            password
        })
    })

    if(!res.ok) return false;

    urlData.password_protected = isProtected;
    urlData.password = isProtected ? password : '';

    return true;
}

/**
 * Reset Click Count
 * @BACKEND: Implement POST /api/links/:id/reset-clicks
 */
async function resetClicks() {
    const urlId = urlData?.id;

    if (!urlId) {
        Toast.error('URL ID not found');
        return;
    }

    try {
        const response = await fetch(`/api/links/${urlId}/reset-clicks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to reset clicks');
        }

        // Update UI
        const clicksDisplay = document.querySelector('.stat-value');
        if (clicksDisplay) {
            clicksDisplay.textContent = '0';
        }

        Toast.success('Click count has been reset!');
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Failed to reset clicks. Please try again.');
    }
}

/**
 * Delete Link
 * @BACKEND: Implement DELETE /api/links/:id
 */
async function deleteLink() {
    const urlCode = urlData?.short_code;

    if (!urlCode) {
        Toast.error('URL Cpde not found');
        return;
    }

    try {
        const response = await fetch(`/${urlCode}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete link');
        }

        Toast.success('Link deleted successfully!');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.replace("/user/dashboard")
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
        Toast.error('Failed to delete link. Please try again.');
    }
}

/* ================================================
   UTILITY FUNCTIONS
   ================================================ */

/**
 * Copy text to clipboard (fallback for older browsers)
 */
function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        return true;
    } catch (err) {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

/**
 * Format date in user's local timezone
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
