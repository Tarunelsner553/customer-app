document.addEventListener("DOMContentLoaded", () => {
  const showPopupButton = document.getElementById("showPopup");
  const imageElement = document.querySelector(".linkForImage");
  const imageUrl = imageElement.getAttribute("data-image");

  const popupdiv = document.createElement("div");
  popupdiv.classList.add("modal");
  popupdiv.innerHTML = `
        <div id="myPopup" class="modal">
            <form id="myForm">
              <div class="model-wrapper">
                <div class="modal-content">
                    <div class="image">
                        <img
                            class="modal-image"
                            src="${imageUrl}"
                            alt="Image Description"
                            width="100px"
                            height="100px"
                        >
                    </div>
                    <h2 class="main-title">Get a chance to win your order back!</h2>
                    <div class="form-group-wrap">
                    <div class="form-group">
                        <label for="email" class="form-label">
                        Email address
                        </label>
                        <input
                            type="email"
                            name="email"
                            class="form-input"
                            placeholder="Email"
                            required
                        >
                    </div>
                    <div class="form-group">
                    <label for="email" class="form-label">
                        Phone number
                        </label>
                        <select id="country" class="form-input" style="width:fit-content;">
                          <option
                          value="us"
                          data-flag="🏁"
                          data-code="+1">🏁 USA (+1)</option>
                        <option
                          value="in"
                          data-flag="🏁"
                          data-code="+91">🏁 India (+91)</option>
                        <option
                          value="au"
                          data-flag="🏁"
                          data-code="+61">🏁 Australia (+61)</option>
                        </select>
                        <input
                            type="tel"
                            name="phone"
                            class="form-input"
                            placeholder="Phone Number"
                            style="width:fit-content;"
                            required
                        >
                     </div>
                    </div>
                    <span class="error-message" id="emailError"></span>
                    <span class="error-message" id="phoneError"></span>
                    <div class="check_box">
                      <input type="checkbox" id="emailConsent" name="EmailConsent">
                      <label for="emailConsent">Email Consent</label>
                      <input type="checkbox" id="smsConsent" name="SMSConsent">
                      <label for="smsConsent">SMS Consent</label>
                    </div>
                    <div class="btn">
                      <button type="button" class="btn_confirm">Confirm</button>
                    </div>
                    <div class="powered_by">
                      <span> Powered by 
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
                            <path d="M0 2.89393C0 1.5718 1.0718 0.5 2.39393 0.5H10.6061C11.9282 0.5 13 1.5718 13 2.89393V11.1061C13 12.4282 11.9282 13.5 10.6061 13.5H2.39393C1.0718 13.5 0 12.4282 0 11.1061V2.89393Z" fill="url(#paint0_linear_153_2355)"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.49705 10.4238C3.49804 10.4201 3.49909 10.4164 3.50018 10.4128L3.91932 9.01985C3.58512 8.81165 3.36299 8.44073 3.36299 8.0185V7.45126L2.94262 7.02823C2.48576 6.56847 2.48576 5.82597 2.94262 5.36621L3.36299 4.94319V4.38418C3.36299 3.73395 3.8898 3.20541 4.5414 3.20541H5.08982L5.49495 2.79771L6.07709 3.37619L5.53617 3.92055C5.46903 3.98811 5.37775 4.0261 5.28255 4.0261H4.5414C4.34383 4.0261 4.18367 4.18642 4.18367 4.38418V5.13384C4.18367 5.22848 4.14625 5.31927 4.07957 5.38637L3.52477 5.94469C3.38596 6.08438 3.38596 6.31007 3.52477 6.44975L4.07957 7.00807C4.14625 7.07517 4.18367 7.16596 4.18367 7.2606V8.0185C4.18367 8.14324 4.24739 8.25308 4.34403 8.31719C4.4006 8.35472 4.46845 8.37658 4.5414 8.37658H5.29074C5.38594 8.37658 5.47721 8.41457 5.54435 8.48213L6.07709 9.01825C6.13878 9.08033 6.21753 9.11503 6.29829 9.12234C6.35612 9.12758 6.41499 9.11877 6.46936 9.09592C6.51118 9.07834 6.55034 9.05245 6.58433 9.01825L7.11707 8.48213C7.18421 8.41457 7.27549 8.37658 7.37069 8.37658H8.14904C8.21883 8.37658 8.28395 8.35658 8.33899 8.32198C8.43977 8.25864 8.50676 8.1464 8.50676 8.0185V7.2314C8.50676 7.13676 8.54419 7.04597 8.61087 6.97887L9.13666 6.44975C9.27546 6.31007 9.27546 6.08438 9.13666 5.94469L8.61087 5.41557C8.54419 5.34847 8.50676 5.25768 8.50676 5.16304V4.38418C8.50676 4.18642 8.34661 4.0261 8.14904 4.0261H7.37888C7.28367 4.0261 7.1924 3.98811 7.12526 3.92055L6.58433 3.37619L7.16647 2.79771L7.57161 3.20541H8.14904C8.80064 3.20541 9.32745 3.73395 9.32745 4.38418V4.97238L9.7188 5.36621C10.1757 5.82597 10.1757 6.56847 9.7188 7.02823L9.32745 7.42206V8.0185C9.32745 8.44438 9.10146 8.81805 8.76244 9.02521L9.16267 10.4177L9.16437 10.4238C9.27314 10.8254 8.97068 11.2207 8.55458 11.2207H7.39088C7.1147 11.2207 6.87132 11.0414 6.78853 10.7794L6.48122 9.9349C6.42509 9.94209 6.36854 9.94524 6.31204 9.94434L6.21 10.4597C6.20921 10.4637 6.20839 10.4679 6.20753 10.4722C6.19162 10.5532 6.16216 10.703 6.10135 10.8343C6.0378 10.9714 5.87359 11.2207 5.54114 11.2207H4.10684C3.69074 11.2207 3.38828 10.8254 3.49705 10.4238ZM5.53638 9.63647C5.52233 9.62363 5.50851 9.61038 5.49495 9.59673L5.09801 9.19727H4.72297L4.36108 10.4L5.38398 10.4C5.39109 10.3699 5.39754 10.3377 5.40494 10.3003L5.53638 9.63647ZM7.95798 9.19727H7.56342L7.21407 9.54883L7.52379 10.4L8.30367 10.4L7.95798 9.19727ZM6.58433 3.37619C6.44448 3.23545 6.21695 3.23545 6.07709 3.37619L5.49495 2.79771C5.95571 2.33403 6.70571 2.33403 7.16647 2.79771L6.58433 3.37619Z" fill="white"/>
                            <circle cx="6.35035" cy="6.20045" r="1.68677" fill="url(#paint1_linear_153_2355)"/>
                            <defs>
                            <linearGradient id="paint0_linear_153_2355" x1="6.5" y1="0.5" x2="6.5" y2="13.5" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#D50D49"/>
                            <stop offset="1" stop-color="#740822"/>
                            </linearGradient>
                            <linearGradient id="paint1_linear_153_2355" x1="6.35035" y1="4.51367" x2="6.35035" y2="7.88722" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#FFD27A"/>
                            <stop offset="1" stop-color="#BD861A"/>
                            </linearGradient>
                            </defs>
                          </svg><b>Win back</b>
                        </span>
                      </sapn>
                    </div>
                </div>
                <div class="btn close-popup">
                  <button type="button" id="closePopup">
                    <svg class="w-4 h-4 text-black dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
        </div>`;

  showPopupButton.addEventListener("click", () => {
    document.body.appendChild(popupdiv);
    document.body.appendChild(popupdiv);
    const closePopupButton = document.getElementById("closePopup");
    closePopupButton.addEventListener("click", () => {
      if (document.body.contains(popupdiv)) {
        document.body.removeChild(popupdiv);
      }
    });

    const form = document.getElementById("myForm");
    const emailInput = form.querySelector('input[name="email"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    const emailConsentCheckbox = document.getElementById("emailConsent");
    const smsConsentCheckbox = document.getElementById("smsConsent");
    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");

    function showError(element, message) {
      element.textContent = message;
      element.style.display = 'block';
    }

    function hideError(element) {
      element.textContent = '';
      element.style.display = 'none';
    }

    emailInput.addEventListener('input', () => hideError(emailError));
    phoneInput.addEventListener('input', () => hideError(phoneError));

    var confirmBtn = document.querySelector(".btn_confirm");
    confirmBtn.addEventListener("click", function () {
      const formData = new FormData(form);

      let isValid = true;

      // Email validation
      if (emailConsentCheckbox.checked) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
          showError(emailError, "Please enter a valid email address.");
          isValid = false;
        } else {
          hideError(emailError);
        }
      } else {
        hideError(emailError);
      }

      // Phone validation
      if (smsConsentCheckbox.checked) {
        const phoneRegex = /^\d{10}$/; // Assumes a 10-digit phone number
        if (!phoneRegex.test(phoneInput.value)) {
          showError(phoneError, "Please enter a valid 10-digit phone number.");
          isValid = false;
        } else {
          hideError(phoneError);
        }
      } else {
        hideError(phoneError);
      }

      // Check if at least one consent is given
      if (!emailConsentCheckbox.checked && !smsConsentCheckbox.checked) {
        showError(emailError, "Please select at least one consent option.");
        isValid = false;
      }

      if (isValid) {
        fetch(
          "https://operate-burden-nintendo-info.trycloudflare.com/api/productpage",
          {
            method: "POST",
            body: formData,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            // You can add a success message here if needed
          })
          .catch((error) => {
            console.error("Error:", error);
            // You can add an error message here if needed
          });
      }
    });
  });
});
