(function () {
  const config = window.REMEDYS_CONFIG || {};

  function getMetaContent(name) {
    return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || "";
  }

  const DIAGNOSTIC_SUBMISSIONS_URL =
    config.diagnosticSubmissionsUrl ||
    getMetaContent("remedys:diagnostic-submissions-url") ||
    "/.netlify/functions/remedys-intake";
  const INTRO_CALL_BOOKING_URL =
    config.introCallBookingUrl ||
    getMetaContent("remedys:intro-call-booking-url") ||
    "/get-started/#request";
  const POSTHOG_KEY =
    config.posthogKey ||
    getMetaContent("remedys:posthog-key") ||
    "phc_CEGE11ffVSoStkKyi3vngbXaQUo2Bpw1BEzGZ5AnTOf";
  const POSTHOG_API_HOST =
    config.posthogApiHost ||
    getMetaContent("remedys:posthog-api-host") ||
    "https://us.i.posthog.com";
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (POSTHOG_KEY && !window.posthog) {
    !(function (t, e) {
      let methods;
      let script;
      let firstScript;
      if (!e.__SV) {
        window.posthog = e;
        e._i = [];
        e.init = function (key, config, namespace) {
          function stub(target, methodName) {
            const parts = methodName.split(".");
            if (parts.length === 2) {
              target = target[parts[0]];
              methodName = parts[1];
            }
            target[methodName] = function () {
              target.push([methodName].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          script = t.createElement("script");
          script.type = "text/javascript";
          script.crossOrigin = "anonymous";
          script.async = true;
          script.src = config.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
          firstScript = t.getElementsByTagName("script")[0];
          firstScript.parentNode.insertBefore(script, firstScript);
          let instance = e;
          if (namespace !== undefined) {
            instance = e[namespace] = [];
          } else {
            namespace = "posthog";
          }
          instance.people = instance.people || [];
          methods = "init capture register register_once unregister identify reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload onFeatureFlags get_distinct_id get_session_id captureException".split(" ");
          for (let index = 0; index < methods.length; index += 1) {
            stub(instance, methods[index]);
          }
          e._i.push([key, config, namespace]);
        };
        e.__SV = 1;
      }
    })(document, window.posthog || []);

    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_API_HOST,
      defaults: "2025-05-24",
      person_profiles: "identified_only",
    });
  }

  function trackEvent(name, properties) {
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, properties || {});
    }
  }

  function getPostHogContext() {
    const posthog = window.posthog;
    return {
      posthog_distinct_id:
        posthog && typeof posthog.get_distinct_id === "function"
          ? String(posthog.get_distinct_id() || "")
          : "",
      posthog_session_id:
        posthog && typeof posthog.get_session_id === "function"
          ? String(posthog.get_session_id() || "")
          : "",
    };
  }

  function identifyLead(contact) {
    const email = String(contact.email || "").trim().toLowerCase();
    if (!email || !window.posthog || typeof window.posthog.identify !== "function") return;

    window.posthog.identify(email, {
      email,
      name: String(contact.fullName || contact.full_name || "").trim(),
      company: String(contact.company || "").trim(),
    });
  }

  function isExternalUrl(href) {
    try {
      return new URL(href, window.location.href).origin !== window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function applyLinkTarget(link, href) {
    if (!link) return;
    if (isExternalUrl(href)) {
      link.target = "_blank";
      link.rel = "noreferrer";
      return;
    }
    link.removeAttribute("target");
    link.removeAttribute("rel");
  }

  function getBookingUrlWithEmail(email) {
    if (!isExternalUrl(INTRO_CALL_BOOKING_URL)) return INTRO_CALL_BOOKING_URL;
    const url = new URL(INTRO_CALL_BOOKING_URL, window.location.href);
    if (email) url.searchParams.set("email", email);
    return url.href;
  }

  function initBookingLinks() {
    document.querySelectorAll("[data-booking-link]").forEach((link) => {
      link.href = INTRO_CALL_BOOKING_URL;
      applyLinkTarget(link, INTRO_CALL_BOOKING_URL);
    });
  }

  function getLeadContext(formVariant) {
    const posthogContext = getPostHogContext();
    return {
      page_path: window.location.pathname,
      referrer: document.referrer || "direct",
      user_agent: navigator.userAgent,
      utm_source: getQueryValue("utm_source"),
      utm_medium: getQueryValue("utm_medium"),
      utm_campaign: getQueryValue("utm_campaign"),
      utm_term: getQueryValue("utm_term"),
      utm_content: getQueryValue("utm_content"),
      posthog_distinct_id: posthogContext.posthog_distinct_id,
      posthog_session_id: posthogContext.posthog_session_id,
      form_variant: formVariant || "",
    };
  }

  function setYear() {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function makeLoadGrid() {
    document.querySelectorAll(".load_grid").forEach((grid) => {
      if (grid.children.length) return;
      for (let index = 0; index < 96; index += 1) {
        const item = document.createElement("div");
        item.className = "load_grid-item";
        grid.appendChild(item);
      }
    });
  }

  function isInternalPageLink(link) {
    if (!link) return false;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    const url = new URL(link.href, window.location.href);
    return url.origin === window.location.origin && link.target !== "_blank";
  }

  function runGridReveal(grid, direction, onComplete) {
    if (!grid) {
      if (onComplete) onComplete();
      return;
    }

    const items = Array.from(grid.children);
    if (!items.length) {
      if (onComplete) onComplete();
      return;
    }

    if (!gsap || prefersReducedMotion) {
      grid.style.display = direction === "in" ? "grid" : "none";
      items.forEach((item) => {
        item.style.opacity = direction === "in" ? "1" : "0";
      });
      if (onComplete) onComplete();
      return;
    }

    grid.style.display = "grid";
    gsap.killTweensOf(items);

    if (direction === "out") {
      gsap.set(items, { opacity: 1 });
      gsap.to(items, {
        opacity: 0,
        duration: 0.2,
        stagger: { amount: 0.55, from: "random" },
        onComplete: () => {
          grid.style.display = "none";
          if (onComplete) onComplete();
        },
      });
      return;
    }

    gsap.set(items, { opacity: 0 });
    gsap.to(items, {
      opacity: 1,
      duration: 0.18,
      stagger: { amount: 0.35, from: "random" },
      onComplete,
    });
  }

  function initPageTransitions() {
    makeLoadGrid();
    const grid = document.querySelector(".load_grid");
    runGridReveal(grid, "out");

    document.querySelectorAll("a[href]").forEach((link) => {
      if (!isInternalPageLink(link)) return;

      link.addEventListener("click", (event) => {
        const url = new URL(link.href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;

        event.preventDefault();
        runGridReveal(grid, "in", () => {
          window.location.assign(url.href);
        });
      });
    });
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const overlay = document.querySelector("[data-menu-overlay]");
    if (!toggle || !overlay) return;

    const rows = Array.from(overlay.querySelectorAll(".block-menu-item"));
    const curtains = Array.from(overlay.querySelectorAll(".menu-curtain"));

    function openMenu() {
      document.body.classList.add("menu-open");
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      overlay.classList.add("is-open");

      if (!gsap || prefersReducedMotion) {
        curtains.forEach((curtain) => {
          curtain.style.transform = "scaleY(1)";
        });
        rows.forEach((row) => {
          row.style.opacity = "1";
        });
        return;
      }

      gsap.killTweensOf(curtains);
      gsap.killTweensOf(rows);
      gsap.set(rows, { opacity: 0, y: 18 });
      gsap.to(curtains, {
        scaleY: 1,
        duration: 0.78,
        ease: "power3.inOut",
        stagger: 0.06,
      });
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: "power2.out",
        stagger: 0.05,
        delay: 0.28,
      });
    }

    function closeMenu() {
      document.body.classList.remove("menu-open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");

      if (!gsap || prefersReducedMotion) {
        overlay.classList.remove("is-open");
        curtains.forEach((curtain) => {
          curtain.style.transform = "scaleY(0)";
        });
        rows.forEach((row) => {
          row.style.opacity = "0";
        });
        return;
      }

      gsap.killTweensOf(curtains);
      gsap.killTweensOf(rows);
      gsap.to(rows, {
        opacity: 0,
        y: -12,
        duration: 0.2,
        ease: "power2.in",
        stagger: 0.03,
      });
      gsap.to(curtains, {
        scaleY: 0,
        duration: 0.5,
        ease: "power3.inOut",
        stagger: { each: 0.04, from: "end" },
        delay: 0.08,
        onComplete: () => {
          overlay.classList.remove("is-open");
        },
      });
    }

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
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

  function initParallax() {
    if (!gsap || !ScrollTrigger || prefersReducedMotion) return;

    const hero = document.querySelector(".hero-container");
    const heroObject = document.querySelector(".hero-object");
    if (hero && heroObject) {
      const halo = heroObject.querySelector(".hero-object__halo");
      const grid = heroObject.querySelector(".hero-object__grid");
      const outerRing = heroObject.querySelector(".hero-object__ring--outer");
      const midRing = heroObject.querySelector(".hero-object__ring--mid");
      const innerRing = heroObject.querySelector(".hero-object__ring--inner");
      const core = heroObject.querySelector(".hero-object__core");
      const satellites = heroObject.querySelectorAll(".hero-object__satellite");

      gsap.to(heroObject, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      if (halo) {
        gsap.to(halo, {
          yPercent: -18,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.4,
          },
        });
      }

      if (grid) {
        gsap.to(grid, {
          yPercent: -24,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (outerRing) {
        gsap.to(outerRing, {
          rotate: 10,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.1,
          },
        });
      }

      if (midRing) {
        gsap.to(midRing, {
          rotate: -14,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.15,
          },
        });
      }

      if (innerRing) {
        gsap.to(innerRing, {
          rotate: 102,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      if (core) {
        gsap.to(core, {
          y: -12,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      satellites.forEach((satellite, index) => {
        gsap.to(satellite, {
          y: index % 2 === 0 ? -14 : 12,
          x: index === 1 ? -10 : 8,
          duration: 3.4 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }

    gsap.utils.toArray(".feature-art").forEach((panel, index) => {
      const svg = panel.querySelector("svg");

      gsap.to(panel, {
        yPercent: index % 2 === 0 ? -6 : -10,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      if (svg) {
        gsap.to(svg, {
          yPercent: index % 2 === 0 ? -10 : -6,
          scale: 1.03,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.15,
          },
        });
      }
    });
  }

  function initFaq() {
    document.querySelectorAll(".accordion-item").forEach((item, index) => {
      const trigger = item.querySelector(".accordion-item-trigger");
      const content = item.querySelector(".accordion-item-content");
      if (!trigger || !content) return;

      const triggerId = trigger.id || `faq-trigger-${index + 1}`;
      const contentId = content.id || `faq-panel-${index + 1}`;
      trigger.id = triggerId;
      content.id = contentId;
      trigger.setAttribute("aria-controls", contentId);
      trigger.setAttribute("aria-expanded", "false");
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", triggerId);

      trigger.addEventListener("click", () => {
        const open = item.classList.contains("is-open");
        document.querySelectorAll(".accordion-item.is-open").forEach((other) => {
          if (other !== item) {
            other.classList.remove("is-open");
            const otherTrigger = other.querySelector(".accordion-item-trigger");
            const otherContent = other.querySelector(".accordion-item-content");
            if (otherTrigger) {
              otherTrigger.setAttribute("aria-expanded", "false");
            }
            if (otherContent) {
              otherContent.style.maxHeight = "0px";
            }
          }
        });

        item.classList.toggle("is-open", !open);
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        content.style.maxHeight = open ? "0px" : `${content.scrollHeight}px`;
      });
    });
  }

  function initTracking() {
    document.querySelectorAll("[data-track]").forEach((node) => {
      node.addEventListener("click", () => {
        trackEvent("cta_clicked", {
          cta: node.dataset.track,
          page: window.location.pathname,
        });
      });
    });
  }

  function getQueryValue(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || "";
  }

  const DIAGNOSTIC_VERSION = "diagnostic_v3_plain_7";
  const SCORING_VERSION = "scoring_v1_plain_7";

  const DIAGNOSTIC_QUESTIONS = [
    {
      id: "businessDescription",
      label: "What does your business do?",
      helper: "One sentence is enough.",
      kind: "input",
      fieldName: "business_description",
      legacyFieldName: "company_description",
      placeholder: "e.g. we’re a 75-person services company serving commercial property teams",
    },
    {
      id: "improvementTarget",
      label: "What needs to work better in the next 6-8 weeks?",
      helper: "Name the outcome, not the tool.",
      kind: "textarea",
      fieldName: "improvement_target",
      legacyFieldName: "desired_outcome",
      placeholder: "e.g. client kickoff needs to take one day instead of one week",
    },
    {
      id: "workflowSlowdown",
      label: "Which workflow is slowing the team down?",
      helper: "Examples: intake, reporting, follow-up, onboarding, support, internal knowledge, or admin work.",
      kind: "textarea",
      fieldName: "workflow_slowdown",
      legacyFieldName: "time_drain",
      placeholder: "e.g. every kickoff takes three handoffs and two spreadsheet updates",
    },
    {
      id: "affectedGroup",
      label: "Who does this affect most?",
      helper: "Choose the group closest to the pain.",
      kind: "choice",
      fieldName: "affected_group",
      options: ["Mostly me", "A few people", "One team", "Multiple teams", "Customers or clients"],
    },
    {
      id: "businessImpact",
      label: "What is it costing the business?",
      helper: "Think time, revenue, quality, risk, customer experience, or team energy.",
      kind: "textarea",
      fieldName: "business_impact",
      placeholder: "e.g. ten hours a week and inconsistent client experience",
    },
    {
      id: "systemsTouched",
      label: "What systems or data does this work touch?",
      helper: "Name the tools, databases, documents, inboxes, spreadsheets, or systems involved.",
      kind: "textarea",
      fieldName: "systems_touched",
      placeholder: "e.g. HubSpot, Google Sheets, Gmail, and shared drive folders",
    },
    {
      id: "aiUsage",
      label: "How are you using AI today?",
      helper: "Choose the closest current state.",
      kind: "choice",
      fieldName: "ai_usage",
      options: [
        "Not using AI yet",
        "A few people use tools like ChatGPT",
        "Some workflows use AI",
        "We have AI systems in production",
      ],
    },
  ];

  const FREE_EMAIL_DOMAINS = new Set([
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "me.com",
    "live.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "pm.me",
  ]);

  const RECOMMENDATION_CONTENT = {
    consulting: {
      label: "AI Consulting",
      timeToValue: "2-4 weeks",
      summary:
        "Your best first move is advisory and opportunity mapping. The opportunity is real, and the next useful step is understanding the workflow, stakeholders, systems, and likely return before choosing what to build or automate.",
      focus:
        "The workflow, stakeholders, systems, likely return, adoption surface, and the first implementation-worthy move.",
    },
    automation: {
      label: "AI Automation",
      timeToValue: "4-8 weeks",
      summary:
        "Your best first move is automating the workflow creating repeated manual work. The value is likely in reducing handoffs, follow-up, re-entry, reporting, or coordination drag.",
      focus:
        "Inputs, handoffs, decision points, systems involved, and the smallest useful automated version.",
    },
    enablement: {
      label: "AI Enablement",
      timeToValue: "1-3 weeks",
      summary:
        "Your best first move is team enablement. The opportunity is helping the affected people use AI consistently, safely, and in a way that changes how work gets done.",
      focus:
        "Roles, use cases, team confidence, training format, and the habits needed for practical adoption.",
    },
    engineering: {
      label: "AI Engineering",
      timeToValue: "Depends on scope",
      summary:
        "Your best first move is an AI engineering build. The answers point to a product, app, internal tool, integration, portal, or workflow system that needs to be designed around how the business operates.",
      focus:
        "The business need, the shape of the product or system, the data and integrations involved, and the first shippable scope.",
    },
  };

  function getServicePrefillValue() {
    const queryService = getQueryValue("service");
    if (queryService) return queryService;

    const hash = window.location.hash.trim().toLowerCase();
    const serviceMap = {
      "#ai-consulting": "AI Consulting",
      "#consulting": "AI Consulting",
      "#ai-automation": "AI Automation",
      "#automation": "AI Automation",
      "#ai-implementation": "AI Automation",
      "#implementation": "AI Automation",
      "#ai-enablement": "AI Enablement",
      "#ai-education": "AI Enablement",
      "#education": "AI Enablement",
      "#ai-engineering": "AI Engineering",
      "#engineering": "AI Engineering",
      "#build-something": "AI Engineering",
    };

    return serviceMap[hash] || "";
  }

  function mapServicePrefillToRecommendation(service) {
    const value = normalizeText(service);
    if (!value) return "";

    if (
      [
        "ai consulting",
        "where to start with ai",
        "ai opportunity audit",
        "consulting",
        "where-to-start-with-ai",
      ].includes(value)
    ) return "consulting";

    if (
      [
        "ai education",
        "learn ai",
        "learn how to use ai well",
        "ai enablement",
        "education",
        "enablement",
      ].includes(value)
    ) return "enablement";

    if (
      [
        "ai implementation",
        "ai automation",
        "automate a workflow",
        "workflow automation",
        "implementation",
        "automation",
      ].includes(value)
    ) return "automation";

    if (
      [
        "engineering",
        "ai engineering",
        "build something",
        "build something useful",
        "build-something",
      ].includes(value)
    ) return "engineering";

    return "";
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function wordCount(value) {
    const text = String(value || "").trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function countKeywordHits(text, keywords) {
    return keywords.reduce((hits, keyword) => (text.includes(keyword) ? hits + 1 : hits), 0);
  }

  function isFreeEmailDomain(email) {
    const domain = String(email || "").trim().toLowerCase().split("@")[1] || "";
    return FREE_EMAIL_DOMAINS.has(domain);
  }

  function getDiagnosticAnswer(state, id) {
    return String(state.answers[id] || "").trim();
  }

  function scoreAnswerSpecificity(value, maxPoints) {
    const words = wordCount(value);
    const text = normalizeText(value);
    if (!text) return 0;
    if (words < 5) return Math.round(maxPoints * 0.25);
    if (words < 10) return Math.round(maxPoints * 0.5);
    if (/\d|hubspot|salesforce|slack|gmail|sheets|notion|airtable|zendesk|stripe|quickbooks|netSuite/i.test(value)) {
      return maxPoints;
    }
    return Math.round(maxPoints * 0.75);
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function evaluateDiagnostic(state, contact) {
    const businessDescription = getDiagnosticAnswer(state, "businessDescription");
    const improvementTarget = getDiagnosticAnswer(state, "improvementTarget");
    const workflowSlowdown = getDiagnosticAnswer(state, "workflowSlowdown");
    const affectedGroup = getDiagnosticAnswer(state, "affectedGroup");
    const businessImpact = getDiagnosticAnswer(state, "businessImpact");
    const systemsTouched = getDiagnosticAnswer(state, "systemsTouched");
    const aiUsage = getDiagnosticAnswer(state, "aiUsage");

    const joinedText = normalizeText(
      [
        businessDescription,
        improvementTarget,
        workflowSlowdown,
        affectedGroup,
        businessImpact,
        systemsTouched,
        aiUsage,
      ].filter(Boolean).join(" ")
    );

    const scores = {
      consulting: 0,
      automation: 0,
      enablement: 0,
      engineering: 0,
    };

    const automationHits = countKeywordHits(joinedText, [
      "manual",
      "repetitive",
      "repeat",
      "follow-up",
      "follow up",
      "report",
      "reporting",
      "admin",
      "onboarding",
      "intake",
      "support",
      "handoff",
      "coordination",
      "spreadsheet",
      "data entry",
      "email",
      "inbox",
      "automation",
      "automate",
    ]);
    const enablementHits = countKeywordHits(joinedText, [
      "train",
      "training",
      "education",
      "enablement",
      "workshop",
      "employees",
      "staff",
      "adoption",
      "confidence",
      "use ai",
      "learn",
      "habits",
      "manager",
    ]);
    const engineeringHits = countKeywordHits(joinedText, [
      "build",
      "product",
      "feature",
      "tool",
      "system",
      "app",
      "application",
      "portal",
      "dashboard",
      "software",
      "platform",
      "integration",
      "agent",
      "mvp",
      "ship",
      "internal tool",
    ]);
    const consultingHits = countKeywordHits(joinedText, [
      "where to start",
      "not sure",
      "unclear",
      "explore",
      "opportunity",
      "prioritize",
      "roadmap",
      "audit",
      "advisory",
      "strategy",
      "assess",
    ]);

    scores.automation += Math.min(30, automationHits * 5);
    scores.enablement += Math.min(30, enablementHits * 5);
    scores.engineering += Math.min(30, engineeringHits * 5);
    scores.consulting += Math.min(30, consultingHits * 5);

    if (wordCount(improvementTarget) < 8 || wordCount(workflowSlowdown) < 8) scores.consulting += 14;
    if (systemsTouched) {
      scores.automation += 8;
      scores.engineering += 8;
    } else {
      scores.consulting += 8;
    }

    if (["One team", "Multiple teams", "Customers or clients"].includes(affectedGroup)) {
      scores.enablement += 8;
      scores.automation += 5;
    }

    if (affectedGroup === "Multiple teams" || affectedGroup === "Customers or clients") {
      scores.consulting += 7;
      scores.engineering += 5;
    }

    if (aiUsage === "Not using AI yet") {
      scores.consulting += 8;
      scores.enablement += 8;
    }
    if (aiUsage === "A few people use tools like ChatGPT") {
      scores.consulting += 6;
      scores.enablement += 7;
      scores.automation += 4;
    }
    if (aiUsage === "Some workflows use AI") {
      scores.automation += 8;
      scores.engineering += 6;
    }
    if (aiUsage === "We have AI systems in production") {
      scores.engineering += 10;
      scores.automation += 6;
    }

    const prefillRecommendation = mapServicePrefillToRecommendation(state.prefillService);
    if (prefillRecommendation) scores[prefillRecommendation] += 6;

    const rankingOrder = ["consulting", "automation", "enablement", "engineering"];
    const ranked = Object.entries(scores).sort((a, b) => {
      if (b[1] === a[1]) {
        return rankingOrder.indexOf(a[0]) - rankingOrder.indexOf(b[0]);
      }
      return b[1] - a[1];
    });

    const [topKey, topScore] = ranked[0];
    const [secondaryKey, secondScore] = ranked[1];
    const confidenceGap = topScore - secondScore;

    const scoreBreakdown = {
      business_context_clarity: scoreAnswerSpecificity(businessDescription, 10),
      near_term_improvement_clarity: scoreAnswerSpecificity(improvementTarget, 15),
      workflow_pain_specificity: scoreAnswerSpecificity(workflowSlowdown, 15),
      business_impact: scoreAnswerSpecificity(businessImpact, 20),
      scope_and_adoption_surface: affectedGroup ? 10 : 0,
      systems_and_data_readiness: scoreAnswerSpecificity(systemsTouched, 15),
      ai_maturity_fit: aiUsage ? 10 : 0,
      contact_quality:
        (wordCount(contact.fullName) >= 2 ? 2 : 0) +
        (contact.company ? 1 : 0) +
        (contact.email ? (isFreeEmailDomain(contact.email) ? 1 : 2) : 0),
    };

    const score = clamp(
      Object.values(scoreBreakdown).reduce((total, value) => total + value, 0),
      0,
      100
    );
    const content = RECOMMENDATION_CONTENT[topKey];
    const secondaryContent =
      secondScore >= 20 || confidenceGap <= 15 ? RECOMMENDATION_CONTENT[secondaryKey] : null;
    const band =
      score >= 80
        ? "This looks like a strong fit for Remedys."
        : score >= 68
          ? "There looks to be a real opportunity here."
          : "There may be a useful starting point here.";

    return {
      key: topKey,
      score,
      topScore,
      secondaryKey,
      secondaryScore: secondScore,
      confidenceGap,
      band,
      pathScores: scores,
      scoreBreakdown,
      secondary: secondaryContent
        ? { key: secondaryKey, label: secondaryContent.label, summary: secondaryContent.summary }
        : null,
      decisionBridge:
        "You've already done the useful part: you stopped, named the work, and made the problem clearer. The next step is simple: choose how you want us to help you turn this into a practical first move.",
      ...content,
    };
  }

  async function submitLeadPayload(payload) {
    const response = await fetch(DIAGNOSTIC_SUBMISSIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok || responseData.ok === false) {
      throw new Error(responseData.error || "Request failed");
    }

    return {
      duplicate: false,
      ...responseData,
    };
  }

  async function submitDiagnosticLead(payload) {
    return submitLeadPayload(payload);
  }

  function buildRecommendationOutput(state, result) {
    const answers = state.answers;
    return {
      primary_recommendation: result.label,
      secondary_recommendation: result.secondary ? result.secondary.label : "",
      why_this_fits: result.summary,
      signals_we_noticed: [
        answers.workflowSlowdown ? `Workflow: ${answers.workflowSlowdown}` : "",
        answers.businessImpact ? `Impact: ${answers.businessImpact}` : "",
        answers.systemsTouched ? `Systems: ${answers.systemsTouched}` : "",
        answers.aiUsage ? `AI usage: ${answers.aiUsage}` : "",
      ].filter(Boolean).slice(0, 4),
      estimated_time_to_value: result.timeToValue,
      what_remedys_would_look_at_first: result.focus,
      what_to_gather_next: [
        "Examples of the workflow today",
        "Systems and documents involved",
        "Who approves, uses, or maintains the first solution",
      ],
      decision_bridge: result.decisionBridge,
      next_move: result.score >= 68 ? "Book a Call" : "Submit a Request",
    };
  }

  function buildDiagnosticPayload(state, contact, result) {
    const leadContext = getLeadContext(contact.formVariant || DIAGNOSTIC_VERSION);
    const recommendationOutput = buildRecommendationOutput(state, result);

    return {
      source: "remedys_ai_diagnostic",
      full_name: contact.fullName,
      email: contact.email,
      company: contact.company,
      newsletter_opt_in: contact.newsletterOptIn,
      diagnostic_version: DIAGNOSTIC_VERSION,
      scoring_version: SCORING_VERSION,
      lead_key: contact.email ? `email:${contact.email.toLowerCase()}` : "",
      booking_email: contact.email,
      readiness_score: result.score,
      recommendation_key: result.key,
      recommendation_label: result.label,
      recommendation_band: result.band,
      expected_time_to_value: result.timeToValue,
      path_scores: result.pathScores,
      score_breakdown: result.scoreBreakdown,
      recommendation_output: recommendationOutput,
      prefill_service: state.prefillService,
      business_description: state.answers.businessDescription,
      improvement_target: state.answers.improvementTarget,
      workflow_slowdown: state.answers.workflowSlowdown,
      business_impact: state.answers.businessImpact,
      systems_touched: state.answers.systemsTouched,
      company_description: state.answers.businessDescription,
      time_drain: state.answers.workflowSlowdown,
      affected_group: state.answers.affectedGroup,
      ai_usage: state.answers.aiUsage,
      desired_outcome: state.answers.improvementTarget,
      booking_url: INTRO_CALL_BOOKING_URL,
      ...leadContext,
      raw_payload: {
        contact: {
          full_name: contact.fullName,
          email: contact.email,
          company: contact.company,
          newsletter_opt_in: contact.newsletterOptIn,
        },
        answers: {
          business_description: state.answers.businessDescription,
          improvement_target: state.answers.improvementTarget,
          workflow_slowdown: state.answers.workflowSlowdown,
          affected_group: state.answers.affectedGroup,
          business_impact: state.answers.businessImpact,
          systems_touched: state.answers.systemsTouched,
          ai_usage: state.answers.aiUsage,
        },
        recommendation: {
          key: result.key,
          label: result.label,
          band: result.band,
          score: result.score,
          expected_time_to_value: result.timeToValue,
          secondary: result.secondary,
          path_scores: result.pathScores,
          score_breakdown: result.scoreBreakdown,
          output: recommendationOutput,
        },
        context: {
          prefill_service: state.prefillService,
          booking_url: INTRO_CALL_BOOKING_URL,
          submitted_at: new Date().toISOString(),
          ...leadContext,
        },
      },
    };
  }

  function buildDirectRequestPayload(request) {
    const recommendationKey = mapServicePrefillToRecommendation(request.closestPath) || "consulting";
    const recommendation = RECOMMENDATION_CONTENT[recommendationKey] || RECOMMENDATION_CONTENT.consulting;
    const leadContext = getLeadContext("direct_request_v1");

    return {
      source: "remedys_direct_request",
      full_name: request.fullName,
      email: request.email,
      company: request.company,
      newsletter_opt_in: false,
      readiness_score: 60,
      recommendation_key: recommendationKey,
      recommendation_label: request.closestPath || recommendation.label,
      recommendation_band: "Direct request submitted",
      expected_time_to_value: recommendation.timeToValue,
      prefill_service: request.closestPath,
      company_description: request.requestDescription,
      time_drain: request.requestDescription,
      affected_group: "",
      ai_usage: "",
      desired_outcome: request.extraNotes,
      direct_request_path: request.closestPath,
      direct_request_description: request.requestDescription,
      direct_request_extra_notes: request.extraNotes,
      website: request.website,
      booking_url: INTRO_CALL_BOOKING_URL,
      ...leadContext,
      raw_payload: {
        type: "direct_request",
        contact: {
          full_name: request.fullName,
          email: request.email,
          company: request.company,
        },
        request: {
          description: request.requestDescription,
          closest_path: request.closestPath,
          extra_notes: request.extraNotes,
        },
        context: {
          booking_url: INTRO_CALL_BOOKING_URL,
          submitted_at: new Date().toISOString(),
          ...leadContext,
        },
      },
    };
  }

  function initTerminalDiagnosticRoot(root) {
    if (!root || root.dataset.terminalDiagnosticInitialized === "true") return;
    root.dataset.terminalDiagnosticInitialized = "true";

    const log = root.querySelector("[data-terminal-log]");
    const form = root.querySelector("[data-terminal-form]");
    const input = root.querySelector("[data-terminal-input]");
    const submitButton = root.querySelector("[data-terminal-submit]");
    const currentQuestionNode = root.querySelector("[data-terminal-current-question]");
    const progressNode = root.querySelector("[data-terminal-progress]");
    const statusNode = root.querySelector("[data-terminal-status]");
    if (!log || !form || !input) return;

    const contactPrompts = [
      { id: "email", label: "What is your work email?", helper: "We use this to send the recommendation and follow up properly." },
      { id: "fullName", label: "What is your full name?", helper: "So we know who we are speaking with." },
      { id: "company", label: "What is your company name?", helper: "This helps us review the request in context." },
      { id: "newsletterOptIn", label: "Want practical AI updates from Remedys? Type yes or no.", helper: "Optional. You can type /skip." },
    ];

    const state = {
      prefillService: root.dataset.prefillService || getServicePrefillValue(),
      answers: {},
      contact: {
        fullName: "",
        email: "",
        company: "",
        newsletterOptIn: false,
      },
      questionIndex: 0,
      contactIndex: 0,
      mode: "questions",
      submitting: false,
      started: false,
    };

    function appendLine(text, type = "system") {
      const line = document.createElement("div");
      line.className = `terminal-line terminal-line--${type}`;
      line.textContent = text;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      return line;
    }

    function appendQuestion(question, index) {
      if (currentQuestionNode) {
        currentQuestionNode.textContent = question.label;
      }
      if (progressNode) {
        if (state.mode === "questions") {
          progressNode.textContent = `Question ${String(index + 1).padStart(2, "0")} / ${String(DIAGNOSTIC_QUESTIONS.length).padStart(2, "0")}`;
        } else if (state.mode === "contact") {
          progressNode.textContent = `Contact ${String(index + 1).padStart(2, "0")} / ${String(contactPrompts.length).padStart(2, "0")}`;
        }
      }
      if (statusNode && (state.mode === "questions" || state.mode === "contact")) {
        statusNode.textContent = question.helper || "Answer the question, then press Enter.";
      }

      const group = document.createElement("div");
      group.className = "terminal-question-block";

      const prompt = document.createElement("p");
      prompt.className = "terminal-line terminal-line--question";
      prompt.textContent = `> ${question.label}`;
      group.appendChild(prompt);

      if (question.helper) {
        const helper = document.createElement("p");
        helper.className = "terminal-line terminal-line--hint";
        helper.textContent = question.helper;
        group.appendChild(helper);
      }

      if (question.options) {
        const options = document.createElement("ol");
        options.className = "terminal-options";
        question.options.forEach((option) => {
          const item = document.createElement("li");
          item.textContent = option;
          options.appendChild(item);
        });
        group.appendChild(options);
      }

      log.appendChild(group);
      log.scrollTop = log.scrollHeight;
      input.placeholder =
        question.placeholder ||
        (question.options ? "Type a number or option..." : "Type your answer...");
      trackEvent("diagnostic_question_viewed", {
        page: window.location.pathname,
        question_id: question.id,
        question_number: index + 1,
        terminal: true,
      });
    }

    function appendResult(result, responseData) {
      const resultNode = document.createElement("div");
      resultNode.className = "terminal-result";

      function appendMetric(label, value) {
        const line = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}:`;
        line.appendChild(strong);
        line.append(` ${value}`);
        resultNode.appendChild(line);
      }

      const title = document.createElement("h3");
      title.textContent = result.label;
      resultNode.appendChild(title);

      const band = document.createElement("p");
      band.textContent = result.band;
      resultNode.appendChild(band);

      if (result.secondary) {
        appendMetric("Also worth considering", result.secondary.label);
      }
      appendMetric("Estimated time to value", result.timeToValue);

      const summary = document.createElement("p");
      summary.textContent = result.summary;
      resultNode.appendChild(summary);

      appendMetric("What we'd look at first", result.focus);

      const bridge = document.createElement("p");
      bridge.textContent = result.decisionBridge;
      resultNode.appendChild(bridge);

      const actions = document.createElement("div");
      actions.className = "terminal-result-actions";

      const primary = document.createElement("a");
      primary.className = "button";
      primary.href = responseData?.canBook ? responseData.bookingUrl || INTRO_CALL_BOOKING_URL : "/get-started/#request";
      applyLinkTarget(primary, primary.href);
      primary.textContent = responseData?.canBook ? "Book a Call" : "Submit a Request";
      actions.appendChild(primary);

      const secondary = document.createElement("a");
      secondary.className = "button cc-tertiary";
      secondary.href = "/services/";
      secondary.textContent = "Explore Services";
      actions.appendChild(secondary);

      resultNode.appendChild(actions);
      log.appendChild(resultNode);
      log.scrollTop = log.scrollHeight;
    }

    function currentQuestion() {
      return DIAGNOSTIC_QUESTIONS[state.questionIndex];
    }

    function currentContactPrompt() {
      return contactPrompts[state.contactIndex];
    }

    function promptCurrentStep() {
      if (state.mode === "questions") {
        appendQuestion(currentQuestion(), state.questionIndex);
      } else if (state.mode === "contact") {
        appendQuestion(currentContactPrompt(), state.contactIndex);
      }
    }

    function resetTerminal() {
      state.answers = {};
      state.contact = { fullName: "", email: "", company: "", newsletterOptIn: false };
      state.questionIndex = 0;
      state.contactIndex = 0;
      state.mode = "questions";
      state.submitting = false;
      state.started = false;
      log.textContent = "";
      appendLine("This is a real diagnostic. Your answers generate a real recommendation.");
      appendLine("Type /reset to start over or /help for commands.", "hint");
      promptCurrentStep();
    }

    function normalizeChoiceAnswer(question, answer) {
      if (!question.options) return answer;
      const numeric = Number(answer);
      if (Number.isInteger(numeric) && numeric >= 1 && numeric <= question.options.length) {
        return question.options[numeric - 1];
      }

      const normalized = normalizeText(answer);
      const exact = question.options.find((option) => normalizeText(option) === normalized);
      if (exact) return exact;

      const partial = question.options.find((option) => normalizeText(option).includes(normalized));
      return partial || "";
    }

    function handleCommand(command) {
      switch (command) {
        case "/help":
          appendLine("Commands: /help shows this list. /skip moves past the current question when optional. /reset restarts the diagnostic.", "hint");
          return true;
        case "/reset":
          resetTerminal();
          return true;
        case "/skip":
          if (state.mode === "questions") {
            state.answers[currentQuestion().id] = "";
            state.questionIndex += 1;
            if (state.questionIndex >= DIAGNOSTIC_QUESTIONS.length) {
              state.mode = "contact";
              appendLine("Almost done. Tell us who you are so we can store and review the recommendation.", "hint");
            }
            promptCurrentStep();
          } else if (state.mode === "contact" && currentContactPrompt().id === "newsletterOptIn") {
            state.contact.newsletterOptIn = false;
            state.contactIndex += 1;
            submitTerminalDiagnostic();
          } else {
            appendLine("This field is required before we can generate and store the recommendation.", "error");
          }
          return true;
        default:
          appendLine("Unknown command. Type /help to see what works here.", "error");
          return true;
      }
    }

    async function submitTerminalDiagnostic() {
      if (state.submitting) return;
      state.submitting = true;
      if (submitButton) submitButton.disabled = true;
      appendLine("Generating recommendation and storing your submission...", "hint");

      const result = evaluateDiagnostic(state, state.contact);
      const payload = buildDiagnosticPayload(state, state.contact, result);

      try {
        const responseData = await submitDiagnosticLead(payload);
        identifyLead(state.contact);
        appendLine("Recommendation ready.", "system");
        appendResult(result, responseData);
        trackEvent("diagnostic_submitted", {
          page: window.location.pathname,
          id: responseData.id,
          can_book: responseData.canBook,
          recommendation: result.key,
          score: result.score,
          terminal: true,
        });
        trackEvent("home_diagnostic_complete", {
          page: window.location.pathname,
          id: responseData.id,
          can_book: responseData.canBook,
          recommendation: result.key,
          score: result.score,
          terminal: true,
        });
        trackEvent("diagnostic_recommendation_viewed", {
          page: window.location.pathname,
          recommendation: result.key,
          score: result.score,
          terminal: true,
        });
      } catch (error) {
        appendLine("We couldn't store this automatically. Email hello@remedys.ai and we'll take it from there.", "error");
        trackEvent("diagnostic_submit_failed", {
          page: window.location.pathname,
          recommendation: result.key,
          score: result.score,
          terminal: true,
          error: error.message,
        });
      } finally {
        state.submitting = false;
        if (submitButton) submitButton.disabled = false;
        state.mode = "complete";
      }
    }

    function handleAnswer(rawAnswer) {
      const answer = rawAnswer.trim();
      if (!answer) return;

      appendLine(`> ${answer}`, "answer");

      if (answer.startsWith("/")) {
        handleCommand(answer.toLowerCase());
        return;
      }

      if (!state.started) {
        state.started = true;
        trackEvent("diagnostic_started", {
          page: window.location.pathname,
          terminal: true,
        });
        trackEvent("home_diagnostic_start", {
          page: window.location.pathname,
          terminal: true,
        });
      }

      if (state.mode === "questions") {
        const question = currentQuestion();
        const normalizedAnswer = normalizeChoiceAnswer(question, answer);
        if (question.options && !normalizedAnswer) {
          appendLine("Choose one of the listed options, or type its number.", "error");
          return;
        }
        state.answers[question.id] = normalizedAnswer;
        trackEvent("diagnostic_question_answered", {
          page: window.location.pathname,
          question_id: question.id,
          question_number: state.questionIndex + 1,
          terminal: true,
        });
        trackEvent("home_diagnostic_question_submit", {
          page: window.location.pathname,
          question_id: question.id,
          question_number: state.questionIndex + 1,
          terminal: true,
        });
        state.questionIndex += 1;
        if (state.questionIndex >= DIAGNOSTIC_QUESTIONS.length) {
          state.mode = "contact";
          appendLine("Almost done. Tell us who you are so we can store and review the recommendation.", "hint");
        }
        promptCurrentStep();
        return;
      }

      if (state.mode === "contact") {
        const prompt = currentContactPrompt();
        if (prompt.id === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
            appendLine("Enter a valid work email.", "error");
            return;
          }
          state.contact.email = answer.toLowerCase();
        } else if (prompt.id === "fullName") {
          state.contact.fullName = answer;
        } else if (prompt.id === "company") {
          state.contact.company = answer;
        } else if (prompt.id === "newsletterOptIn") {
          state.contact.newsletterOptIn = ["yes", "y", "true", "1"].includes(answer.toLowerCase());
        }

        state.contactIndex += 1;
        if (state.contactIndex >= contactPrompts.length) {
          trackEvent("diagnostic_contact_submitted", {
            page: window.location.pathname,
            terminal: true,
          });
          submitTerminalDiagnostic();
          return;
        }
        promptCurrentStep();
        return;
      }

      if (state.mode === "complete") {
        appendLine("Type /reset to run the diagnostic again.", "hint");
      }
    }

    function resizeInput() {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
    }

    input.addEventListener("input", resizeInput);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value;
      input.value = "";
      resizeInput();
      handleAnswer(value);
    });

    resetTerminal();
  }

  function initHomeDiagnosticStart() {
    const start = document.querySelector("[data-start-home-diagnostic]");
    const input = document.querySelector("[data-terminal-diagnostic] [data-terminal-input]");
    if (!start || !input) return;

    start.addEventListener("click", () => {
      trackEvent("home_diagnostic_start", {
        page: window.location.pathname,
        source: "intro_button",
      });
      input.focus({ preventScroll: false });
    });
  }

  function initTerminalDiagnostic() {
    document.querySelectorAll("[data-terminal-diagnostic]").forEach((root) => {
      initTerminalDiagnosticRoot(root);
    });
  }

  function initDiagnosticRoot(root) {
    if (!root || root.dataset.diagnosticInitialized === "true") return;
    root.dataset.diagnosticInitialized = "true";

    const state = {
      prefillService: root.dataset.prefillService || getServicePrefillValue(),
      answers: {},
      questionIndex: 0,
    };
    const shouldAutostart = root.dataset.diagnosticAutostart === "true";

    const stageNodes = new Map(
      Array.from(root.querySelectorAll("[data-diagnostic-stage]")).map((node) => [node.dataset.diagnosticStage, node])
    );
    const progressBar = root.querySelector("[data-diagnostic-progress-bar]");
    const progressCopy = root.querySelector("[data-diagnostic-progress-copy]");
    const questionStep = root.querySelector("[data-question-step]");
    const questionTitle = root.querySelector("[data-question-title]");
    const questionHelper = root.querySelector("[data-question-helper]");
    const questionField = root.querySelector("[data-question-field]");
    const questionError = root.querySelector("[data-question-error]");
    const questionForm = stageNodes.get("question");
    const contactForm = stageNodes.get("contact");
    const contactStatus = root.querySelector("[data-diagnostic-status]");
    const contactSubmitButton = contactForm ? contactForm.querySelector("[type='submit']") : null;
    const contactSubmitLabel = contactSubmitButton ? contactSubmitButton.querySelector("[data-diagnostic-submit-label]") : null;
    const defaultContactSubmitLabel = contactSubmitLabel ? contactSubmitLabel.textContent : "View My Recommendation";
    const analysisItems = Array.from(root.querySelectorAll("[data-analysis-item]"));
    const resultTitle = root.querySelector("[data-result-title]");
    const resultBand = root.querySelector("[data-result-band]");
    const resultScore = root.querySelector("[data-result-score]");
    const resultTime = root.querySelector("[data-result-time]");
    const resultSummary = root.querySelector("[data-result-summary]");
    const resultFocus = root.querySelector("[data-result-focus]");
    const resultStatus = root.querySelector("[data-result-status]");
    const resultPrimary = root.querySelector("[data-result-primary]");
    const resultPrimaryLabel = resultPrimary ? resultPrimary.querySelector("[data-result-primary-label]") : null;

    function setProgress(progress, copy) {
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      if (progressCopy) {
        progressCopy.textContent = copy;
      }
    }

    function showStage(name) {
      stageNodes.forEach((node, key) => {
        node.classList.toggle("is-active", key === name);
      });

      if (name === "welcome") setProgress(0, "Ready when you are");
      if (name === "question") {
        setProgress(((state.questionIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 72, `Question ${state.questionIndex + 1} of ${DIAGNOSTIC_QUESTIONS.length}`);
      }
      if (name === "contact") setProgress(84, "One last step");
      if (name === "analysis") setProgress(92, "Preparing your recommendation");
      if (name === "result") setProgress(100, "Recommendation ready");
    }

    function clearQuestionError() {
      if (questionError) questionError.textContent = "";
    }

    function isCurrentQuestionAnswered(question) {
      const answer = state.answers[question.id];
      if (question.kind === "choice") return Boolean(answer);
      return String(answer || "").trim().length > 0;
    }

    function renderQuestion() {
      const question = DIAGNOSTIC_QUESTIONS[state.questionIndex];
      if (!question) return;

      clearQuestionError();
      questionStep.textContent = `Question ${state.questionIndex + 1} of ${DIAGNOSTIC_QUESTIONS.length}`;
      questionTitle.textContent = question.label;
      questionHelper.textContent = question.helper;

      if (question.kind === "choice") {
        questionField.innerHTML = `
          <div class="diagnostic-choice-grid">
            ${question.options
              .map((option) => {
                const selected = state.answers[question.id] === option;
                return `
                  <button class="diagnostic-choice${selected ? " is-selected" : ""}" type="button" data-choice-value="${option}">
                    <span class="diagnostic-choice-label">${option}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        `;

        questionField.querySelectorAll("[data-choice-value]").forEach((button) => {
          button.addEventListener("click", () => {
            state.answers[question.id] = button.dataset.choiceValue || "";
            renderQuestion();
          });
        });
      } else {
        const value = String(state.answers[question.id] || "");
        questionField.innerHTML = "";

        const input =
          question.kind === "textarea"
            ? document.createElement("textarea")
            : document.createElement("input");

        input.name = question.id;
        input.placeholder = question.placeholder;

        if (question.kind === "textarea") {
          input.className = "textarea diagnostic-textarea";
          input.value = value;
        } else {
          input.className = "input diagnostic-text-input";
          input.type = "text";
          input.autocomplete = "off";
          input.spellcheck = false;
          input.value = value;
        }

        questionField.appendChild(input);

        if (input) {
          input.addEventListener("input", () => {
            state.answers[question.id] = input.value;
          });
          input.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;

            if (question.kind === "textarea" && event.shiftKey) {
              return;
            }

            if (question.kind !== "textarea" || !event.shiftKey) {
              event.preventDefault();
              handleNext();
            }
          });
          const canAutofocusQuestion =
            !shouldAutostart || state.questionIndex > 0 || root.matches(":focus-within");
          if (canAutofocusQuestion) {
            window.setTimeout(() => input.focus({ preventScroll: true }), 0);
          }
        }
      }

      showStage("question");
    }

    function validateCurrentQuestion() {
      const question = DIAGNOSTIC_QUESTIONS[state.questionIndex];
      if (!question) return true;

      if (question.kind !== "choice") {
        const input = questionField.querySelector(`[name="${question.id}"]`);
        state.answers[question.id] = input ? input.value : state.answers[question.id];
      }

      if (!isCurrentQuestionAnswered(question)) {
        if (questionError) questionError.textContent = "Please answer before moving on.";
        return false;
      }

      clearQuestionError();
      return true;
    }

    function handleNext() {
      if (!validateCurrentQuestion()) return;

      const question = DIAGNOSTIC_QUESTIONS[state.questionIndex];
      trackEvent("diagnostic_question_answered", {
        page: window.location.pathname,
        question: question.id,
      });

      if (state.questionIndex === DIAGNOSTIC_QUESTIONS.length - 1) {
        showStage("contact");
        return;
      }

      state.questionIndex += 1;
      renderQuestion();
    }

    function handleChoiceKeydown(event) {
      const question = DIAGNOSTIC_QUESTIONS[state.questionIndex];
      if (!question || question.kind !== "choice") return;
      const choiceIndex = Number.parseInt(event.key, 10) - 1;
      if (Number.isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= question.options.length) return;
      event.preventDefault();
      state.answers[question.id] = question.options[choiceIndex];
      renderQuestion();
    }

    questionForm?.addEventListener("keydown", handleChoiceKeydown);

    async function runAnalysisSequence() {
      analysisItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === 0);
      });

      if (prefersReducedMotion) {
        await wait(300);
        analysisItems.forEach((item) => item.classList.add("is-active"));
        return;
      }

      for (let index = 0; index < analysisItems.length; index += 1) {
        analysisItems.forEach((item, itemIndex) => {
          item.classList.toggle("is-active", itemIndex <= index);
        });
        await wait(index === analysisItems.length - 1 ? 520 : 420);
      }
    }

    function renderResult(contact, result, submissionState) {
      const canBook = result.score >= 68;

      if (resultTitle) resultTitle.textContent = `Recommended next step: ${result.label}`;
      if (resultBand) resultBand.textContent = canBook ? result.band : "We'll review this.";
      if (resultScore) resultScore.textContent = `${result.score} / 100`;
      if (resultTime) resultTime.textContent = result.timeToValue;
      if (resultSummary) resultSummary.textContent = result.summary;
      if (resultFocus) resultFocus.textContent = result.focus;

      if (resultPrimary) {
        if (canBook) {
          resultPrimary.href = getBookingUrlWithEmail(contact.email);
          applyLinkTarget(resultPrimary, resultPrimary.href);
          resultPrimary.dataset.track = "diagnostic_book_call";
          if (resultPrimaryLabel) {
            resultPrimaryLabel.textContent = "Book a Call";
          }
        } else {
          resultPrimary.href = "/get-started/#request";
          applyLinkTarget(resultPrimary, resultPrimary.href);
          resultPrimary.dataset.track = "diagnostic_submit_request";
          if (resultPrimaryLabel) {
            resultPrimaryLabel.textContent = "Submit a Request";
          }
        }
      }

      if (submissionState.failed) {
        resultStatus.textContent =
          "We could not save this automatically. Email hello@remedys.ai or submit a request to move faster.";
      } else if (submissionState.duplicate) {
        resultStatus.textContent =
          "This email is already in our system. If you want to move faster, book a call or email hello@remedys.ai.";
      } else if (canBook) {
        resultStatus.textContent =
          "We'll review this. If you want to move faster, you can book a call now.";
      } else {
        resultStatus.textContent =
          "We'll review this and come back with the clearest next step. If you already know what you want reviewed, submit a request now.";
      }
    }

    function resetDiagnostic() {
      state.answers = {};
      state.questionIndex = 0;
      if (questionForm) questionForm.reset();
      if (contactForm) contactForm.reset();
      if (contactStatus) contactStatus.textContent = "";
      if (contactSubmitButton) {
        contactSubmitButton.disabled = false;
        contactSubmitButton.removeAttribute("aria-busy");
      }
      if (contactSubmitLabel) {
        contactSubmitLabel.textContent = defaultContactSubmitLabel;
      }
      analysisItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === 0);
      });
      if (shouldAutostart) {
        renderQuestion();
      } else {
        showStage("welcome");
      }
    }

    root.querySelector("[data-diagnostic-start]")?.addEventListener("click", () => {
      trackEvent("diagnostic_started", {
        page: window.location.pathname,
        prefill_service: state.prefillService,
      });
      state.questionIndex = 0;
      renderQuestion();
    });

    root.querySelector("[data-diagnostic-next]")?.addEventListener("click", handleNext);

    root.querySelector("[data-diagnostic-back]")?.addEventListener("click", () => {
      clearQuestionError();
      if (state.questionIndex === 0) {
        showStage("welcome");
        return;
      }
      state.questionIndex -= 1;
      renderQuestion();
    });

    root.querySelector("[data-diagnostic-contact-back]")?.addEventListener("click", () => {
      renderQuestion();
    });

    root.querySelector("[data-diagnostic-reset]")?.addEventListener("click", resetDiagnostic);

    contactForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const honeypot = String(formData.get("website") || "").trim();
      if (honeypot) {
        resetDiagnostic();
        return;
      }

      if (!contactForm.reportValidity()) {
        if (contactStatus) contactStatus.textContent = "Please complete the required fields first.";
        return;
      }

      const contact = {
        fullName: String(formData.get("full_name") || "").trim(),
        email: String(formData.get("email") || "").trim().toLowerCase(),
        company: String(formData.get("company") || "").trim(),
        newsletterOptIn: formData.get("newsletter_opt_in") === "yes",
      };

      const result = evaluateDiagnostic(state, contact);
      const payload = buildDiagnosticPayload(state, contact, result);

      if (contactSubmitButton) {
        contactSubmitButton.disabled = true;
        contactSubmitButton.setAttribute("aria-busy", "true");
      }
      if (contactSubmitLabel) {
        contactSubmitLabel.textContent = "Preparing…";
      }
      if (contactStatus) {
        contactStatus.textContent = "Preparing your recommendation…";
      }

      trackEvent("diagnostic_contact_submitted", {
        page: window.location.pathname,
        recommendation: result.label,
        score: result.score,
      });

      showStage("analysis");

      let submissionState = { duplicate: false, failed: false };
      try {
        const [submitResult] = await Promise.all([
          submitDiagnosticLead(payload),
          runAnalysisSequence(),
        ]);
        identifyLead(contact);
        trackEvent("diagnostic_submitted", {
          page: window.location.pathname,
          id: submitResult.id,
          can_book: submitResult.canBook,
          recommendation: result.key,
          score: result.score,
        });
        submissionState = {
          duplicate: submitResult.duplicate,
          failed: false,
          id: submitResult.id,
          canBook: submitResult.canBook,
        };
      } catch (error) {
        trackEvent("diagnostic_submit_failed", {
          page: window.location.pathname,
          recommendation: result.key,
          score: result.score,
          error: error.message,
        });
        await runAnalysisSequence();
        submissionState = { duplicate: false, failed: true };
      }

      if (contactStatus) {
        contactStatus.textContent = "";
      }
      if (contactSubmitButton) {
        contactSubmitButton.disabled = false;
        contactSubmitButton.removeAttribute("aria-busy");
      }
      if (contactSubmitLabel) {
        contactSubmitLabel.textContent = defaultContactSubmitLabel;
      }

      renderResult(contact, result, submissionState);
      showStage("result");

      trackEvent("diagnostic_recommendation_viewed", {
        page: window.location.pathname,
        recommendation: result.label,
        score: result.score,
        duplicate: submissionState.duplicate,
        failed: submissionState.failed,
      });
    });

    if (shouldAutostart) {
      renderQuestion();
    } else {
      showStage("welcome");
    }
  }

  function initDiagnostic() {
    document.querySelectorAll("[data-diagnostic]").forEach((root) => {
      initDiagnosticRoot(root);
    });
  }

  function initRequestHelp() {
    const shell = document.querySelector("[data-request-switcher]");
    if (!shell) return;

    const toggles = Array.from(shell.querySelectorAll("[data-request-toggle]"));
    const panels = new Map(
      Array.from(shell.querySelectorAll("[data-request-panel]")).map((node) => [node.dataset.requestPanel, node])
    );
    const directForm = shell.querySelector("[data-direct-request-form]");
    const directStatus = shell.querySelector("[data-direct-request-status]");
    const directSuccess = shell.querySelector("[data-direct-request-success]");
    const directSuccessMessage = shell.querySelector("[data-direct-request-success-message]");

    const hasModeToggles = toggles.length > 0;

    function openMode(mode, updateHash = true) {
      if (!hasModeToggles) return;

      toggles.forEach((toggle) => {
        const active = toggle.dataset.requestToggle === mode;
        toggle.classList.toggle("is-active", active);
        toggle.setAttribute("aria-pressed", active ? "true" : "false");
      });

      panels.forEach((panel, key) => {
        panel.hidden = key !== mode;
      });

      if (updateHash) {
        const hash = mode === "request" ? "#request" : "";
        history.replaceState(null, "", `${window.location.pathname}${hash}`);
      }
    }

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        openMode(toggle.dataset.requestToggle || "diagnostic");
      });
    });

    if (hasModeToggles) {
      openMode(window.location.hash === "#request" ? "request" : "diagnostic", false);
    }

    directForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!directForm.reportValidity()) return;

      const formData = new FormData(directForm);
      const request = {
        fullName: String(formData.get("full_name") || "").trim(),
        email: String(formData.get("email") || "").trim().toLowerCase(),
        company: String(formData.get("company") || "").trim(),
        requestDescription: String(formData.get("request_description") || "").trim(),
        closestPath: String(formData.get("closest_path") || "").trim(),
        extraNotes: String(formData.get("extra_notes") || "").trim(),
        website: String(formData.get("website") || "").trim(),
      };

      if (request.website) {
        directForm.reset();
        return;
      }

      const payload = buildDirectRequestPayload(request);
      const submitButton = directForm.querySelector("[type='submit']");

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      if (directStatus) {
        directStatus.textContent = "Sending your request…";
      }

      try {
        const responseData = await submitLeadPayload(payload);
        identifyLead(request);
        directForm.hidden = true;
        if (directSuccess) {
          directSuccess.hidden = false;
        }
        if (directSuccessMessage) {
          directSuccessMessage.textContent = "We’ll review your request and come back with the clearest next step. If you want to move faster, you can book a call now.";
        }
        trackEvent("direct_request_submitted", {
          page: window.location.pathname,
          id: responseData.id,
          can_book: responseData.canBook,
          closest_path: request.closestPath,
        });
      } catch (error) {
        if (directStatus) {
          directStatus.textContent = "We couldn’t send this automatically. Email hello@remedys.ai and we’ll take it from there.";
        }
        trackEvent("direct_request_submit_failed", {
          page: window.location.pathname,
          closest_path: request.closestPath,
          error: error.message,
        });
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    initPageTransitions();
    initMenu();
    initReveal();
    initParallax();
    initFaq();
    initTracking();
    initHomeDiagnosticStart();
    initTerminalDiagnostic();
    initDiagnostic();
    initRequestHelp();
  });
})();
