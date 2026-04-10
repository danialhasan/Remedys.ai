(function () {
  const WAITLIST_URL = "https://crjtytypinybbhmceubm.supabase.co/rest/v1/waitlist";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LoEmThmXM-92I1NgB-7nAQ_4FATJ6iN";

  if (!window.posthog) {
    !(function (t, e) {
      var o, n, p, r;
      if (!e.__SV) {
        window.posthog = e;
        e._i = [];
        e.init = function (i, s, a) {
          function g(t2, e2) {
            var o2 = e2.split(".");
            if (o2.length === 2) {
              t2 = t2[o2[0]];
              e2 = o2[1];
            }
            t2[e2] = function () {
              t2.push([e2].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          (p = t.createElement("script")).type = "text/javascript";
          p.crossOrigin = "anonymous";
          p.async = true;
          p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
          (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
          var u = e;
          if (a !== undefined) {
            u = e[a] = [];
          } else {
            a = "posthog";
          }
          u.people = u.people || [];
          u.toString = function (t2) {
            var e2 = "posthog";
            if (a !== "posthog") {
              e2 += "." + a;
            }
            if (!t2) {
              e2 += " (stub)";
            }
            return e2;
          };
          u.people.toString = function () {
            return u.toString(1) + ".people (stub)";
          };
          o = "init capture register register_once unregister identify reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload onFeatureFlags get_distinct_id get_session_id captureException".split(" ");
          for (n = 0; n < o.length; n += 1) {
            g(u, o[n]);
          }
          e._i.push([i, s, a]);
        };
        e.__SV = 1;
      }
    })(document, window.posthog || []);

    window.posthog.init("phc_CEGE11ffVSoStkKyi3vngbXaQUo2Bpw1BEzGZ5AnTOf", {
      api_host: "https://us.i.posthog.com",
      defaults: "2025-05-24",
      person_profiles: "identified_only",
    });
  }

  function trackEvent(name, properties) {
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, properties || {});
    }
  }

  function setYear() {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const overlay = document.querySelector("[data-menu-overlay]");
    if (!toggle || !overlay) {
      return;
    }

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      overlay.classList.toggle("is-open", !isOpen);
      document.body.style.overflow = !isOpen ? "hidden" : "";
    });

    overlay.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function initTracking() {
    document.querySelectorAll("[data-track]").forEach((node) => {
      node.addEventListener("click", () => {
        trackEvent("cta_clicked", { cta: node.dataset.track, page: window.location.pathname });
      });
    });
  }

  function isDuplicateError(status, text) {
    const message = (text || "").toLowerCase();
    return status === 409 || message.includes("duplicate key") || message.includes("23505");
  }

  function getQueryValue(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || "";
  }

  function applyPrefill() {
    const serviceField = document.querySelector("[name='service_interest']");
    if (!serviceField) {
      return;
    }
    const queryService = getQueryValue("service");
    if (!queryService) {
      return;
    }

    const option = Array.from(serviceField.querySelectorAll("option")).find((item) => item.value === queryService);
    if (option) {
      serviceField.value = queryService;
    }
  }

  async function handleLeadForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector("[type='submit']");
    const status = form.querySelector("[data-form-status]");

    const formData = new FormData(form);
    const websiteTrap = String(formData.get("website") || "").trim();
    if (websiteTrap) {
      status.textContent = "Thanks. We will follow up shortly.";
      return;
    }

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      company: String(formData.get("company") || "").trim(),
      role: String(formData.get("role") || "").trim(),
      teamSize: String(formData.get("team_size") || "").trim(),
      serviceInterest: String(formData.get("service_interest") || "").trim(),
      goals: String(formData.get("goals") || "").trim(),
      discoverySource: String(formData.get("hear_about_us") || "").trim(),
      utmSource: getQueryValue("utm_source"),
      utmMedium: getQueryValue("utm_medium"),
      utmCampaign: getQueryValue("utm_campaign"),
      utmTerm: getQueryValue("utm_term"),
      utmContent: getQueryValue("utm_content"),
    };

    if (!payload.email) {
      status.textContent = "Please enter your work email.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    status.textContent = "Sending your request...";

    trackEvent("consulting_form_submitted", {
      page: window.location.pathname,
      service_interest: payload.serviceInterest,
    });

    try {
      const response = await fetch(WAITLIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email: payload.email,
          product: "remedys",
          metadata: {
            source: "remedys_get_started",
            inquiry_type: "consulting",
            page_path: window.location.pathname,
            referrer: document.referrer || "direct",
            submitted_at: new Date().toISOString(),
            ...payload,
            user_agent: navigator.userAgent,
          },
        }),
      });

      const responseText = await response.text();
      if (!response.ok && !isDuplicateError(response.status, responseText)) {
        throw new Error(responseText || "Request failed");
      }

      const duplicate = !response.ok && isDuplicateError(response.status, responseText);
      status.innerHTML = duplicate
        ? "This email is already in our system. If you want to move faster, email <a href='mailto:hello@remedys.ai?subject=Remedys%20AI%20Inquiry'>hello@remedys.ai</a>."
        : "Thanks. We received your request and will follow up soon. If it is urgent, email <a href='mailto:hello@remedys.ai?subject=Remedys%20AI%20Inquiry'>hello@remedys.ai</a>.";

      form.reset();
      applyPrefill();
      trackEvent("consulting_form_succeeded", {
        page: window.location.pathname,
        duplicate,
        service_interest: payload.serviceInterest,
      });
    } catch (error) {
      console.error(error);
      status.innerHTML = "Something went wrong. Please try again or email <a href='mailto:hello@remedys.ai?subject=Remedys%20AI%20Inquiry'>hello@remedys.ai</a>.";
      trackEvent("consulting_form_failed", {
        page: window.location.pathname,
        service_interest: payload.serviceInterest,
      });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
  }

  function initForm() {
    applyPrefill();
    const form = document.querySelector("[data-lead-form]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", handleLeadForm);
  }

  window.addEventListener("DOMContentLoaded", () => {
    setYear();
    initMenu();
    initReveal();
    initTracking();
    initForm();
  });
})();
