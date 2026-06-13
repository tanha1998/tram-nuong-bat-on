document.addEventListener("DOMContentLoaded", () => {
  // Fetch dynamic configuration
  fetch('config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Render components
      renderDynamicContent(data);
      // Initialize UI interactive handlers
      initInteractiveEvents(data);
    })
    .catch(err => {
      console.error("Failed to load config.json, using fallback static content.", err);
      // Initialize UI interactive handlers with fallback values
      initInteractiveEvents(getFallbackData());
    });
});

/**
 * Dynamic DOM renderer using JSON config data
 */
function renderDynamicContent(data) {
  if (!data) return;

  // 1. Metadata and Page Titles
  if (data.metadata) {
    document.title = data.metadata.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", data.metadata.description);
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute("content", data.metadata.keywords);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", data.metadata.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", data.metadata.description);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", data.metadata.ogImage);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", data.metadata.title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", data.metadata.description);
    const twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage) twImage.setAttribute("content", data.metadata.ogImage);
  }

  // 2. JSON-LD Schema
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (schemaScript && data.restaurant) {
    const canonicalUrl = data.metadata ? data.metadata.canonical : window.location.href;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": data.restaurant.name,
      "url": canonicalUrl,
      "image": data.metadata ? data.metadata.ogImage : "",
      "telephone": data.restaurant.telephone,
      "servesCuisine": "BBQ",
      "priceRange": data.restaurant.priceRange,
      "hasMenu": `${canonicalUrl}#menu`,
      "sameAs": [
        data.restaurant.facebookUrl,
        data.restaurant.googleMapsUrl
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": data.restaurant.address,
        "addressLocality": data.restaurant.address.split(',').slice(-2, -1)[0]?.trim() || "Thủ Dầu Một",
        "addressRegion": data.restaurant.addressRegion,
        "postalCode": data.restaurant.postalCode,
        "addressCountry": data.restaurant.addressCountry
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": data.restaurant.latitude,
        "longitude": data.restaurant.longitude
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
          ],
          "opens": data.restaurant.openingHours.split('-')[0]?.trim() || "16:00",
          "closes": data.restaurant.openingHours.split('-')[1]?.trim() || "23:00"
        }
      ]
    };
    schemaScript.textContent = JSON.stringify(schema, null, 2);
  }

  // 3. Restaurant Profile Elements
  if (data.restaurant) {
    const headerName = document.getElementById("header-restaurant-name");
    if (headerName) headerName.innerHTML = data.restaurant.shortName.replace(/\n/g, '<br />');

    const footerName = document.getElementById("footer-restaurant-name");
    if (footerName) footerName.innerHTML = data.restaurant.shortName.replace(/\n/g, '<br />');

    const footerDesc = document.getElementById("footer-restaurant-desc");
    if (footerDesc) footerDesc.textContent = data.restaurant.description || (data.metadata ? data.metadata.description : "");

    const footerHotline = document.getElementById("footer-hotline");
    if (footerHotline) {
      footerHotline.href = `tel:${data.restaurant.telephone}`;
      footerHotline.textContent = `Hotline: ${data.restaurant.telephoneDisplay}`;
    }

    const footerFacebook = document.getElementById("footer-facebook");
    if (footerFacebook) footerFacebook.href = data.restaurant.facebookUrl;

    const footerOpeningDays = document.getElementById("footer-opening-days");
    if (footerOpeningDays) footerOpeningDays.textContent = data.restaurant.openingDays;

    const footerOpeningTime = document.getElementById("footer-opening-time");
    if (footerOpeningTime) footerOpeningTime.textContent = data.restaurant.openingHours;

    const zaloLink = document.getElementById("zalo-link");
    if (zaloLink) {
      zaloLink.href = data.restaurant.zaloUrl;
      zaloLink.setAttribute("aria-label", `Chat Zalo với ${data.restaurant.name}`);
    }

    const messengerLink = document.getElementById("messenger-link");
    if (messengerLink) {
      messengerLink.href = data.restaurant.messengerUrl;
      messengerLink.setAttribute("aria-label", `Chat Facebook Messenger với ${data.restaurant.name}`);
    }

    const mobNavCall = document.getElementById("mobile-nav-call");
    if (mobNavCall) mobNavCall.href = `tel:${data.restaurant.telephone}`;
  }

  // 4. Section Visibility Flags
  const visibility = data.sectionsVisibility || {};
  const sections = {
    promotion: document.getElementById("promotion"),
    menu: document.getElementById("menu"),
    combo: document.getElementById("combo"),
    gallery: document.getElementById("gallery"),
    reviews: document.getElementById("reviews")
  };

  const bookingPanel = document.getElementById("booking-panel");
  const mapPanel = document.getElementById("map");
  const bookingMapSection = document.getElementById("booking");

  // Booking block visibility
  if (bookingPanel) {
    if (visibility.booking === false) {
      bookingPanel.classList.add("hidden");
    } else {
      bookingPanel.classList.remove("hidden");
    }
  }

  // Maps block visibility
  if (mapPanel) {
    if (visibility.map === false) {
      mapPanel.classList.add("hidden");
    } else {
      mapPanel.classList.remove("hidden");
    }
  }

  // Adjust map & booking parent containers
  if (bookingMapSection) {
    const gridContainer = bookingMapSection.querySelector(".grid");
    if (gridContainer) {
      if (visibility.booking === false || visibility.map === false) {
        gridContainer.classList.remove("grid-cols-[0.9fr_1.1fr]", "max-[980px]:grid-cols-1");
        gridContainer.classList.add("grid-cols-1");
      } else {
        gridContainer.classList.add("grid-cols-[0.9fr_1.1fr]", "max-[980px]:grid-cols-1");
        gridContainer.classList.remove("grid-cols-1");
      }
    }

    if (visibility.booking === false && visibility.map === false) {
      bookingMapSection.classList.add("hidden");
    } else {
      bookingMapSection.classList.remove("hidden");
    }
  }

  // Other sections visibility
  Object.keys(sections).forEach(key => {
    const sec = sections[key];
    if (sec) {
      if (visibility[key] === false) {
        sec.classList.add("hidden");
      } else {
        sec.classList.remove("hidden");
      }
    }
  });

  // Hide nav links matching inactive sections
  const navLinks = document.querySelectorAll("[data-nav]");
  navLinks.forEach(link => {
    const sectionKey = link.getAttribute("data-nav");
    if (sectionKey) {
      if (visibility[sectionKey] === false) {
        link.classList.add("hidden");
        link.style.display = "none";
      } else {
        link.classList.remove("hidden");
        link.style.display = "";
      }
    }
  });

  // Adjust mobile navigation buttons count
  const mobileNav = document.getElementById("mobile-nav");
  if (mobileNav) {
    let activeCount = 1; // "Gọi" hotline button is always active
    if (visibility.booking !== false) activeCount++;
    if (visibility.map !== false) activeCount++;

    mobileNav.className = `hidden max-sm:grid fixed z-[80] left-3 right-3 bottom-3 grid-cols-${activeCount} gap-2 p-2.5 rounded-[22px] bg-[rgba(17,17,17,0.88)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.12)]`;
  }

  // 5. Hero Section Content
  const heroData = data.hero;
  if (heroData) {
    const tagline = document.getElementById("hero-tagline");
    if (tagline) tagline.textContent = heroData.tagline;

    const titlePrefix = document.getElementById("hero-title-prefix");
    if (titlePrefix) titlePrefix.textContent = heroData.titlePrefix;

    const titleHighlight = document.getElementById("hero-title-highlight");
    if (titleHighlight) titleHighlight.textContent = heroData.titleHighlight;

    const heroDesc = document.getElementById("hero-description");
    if (heroDesc) heroDesc.textContent = heroData.description;

    const statsContainer = document.getElementById("hero-stats-container");
    if (statsContainer && heroData.stats) {
      statsContainer.innerHTML = heroData.stats.map(stat => `
        <div class="stat-card p-5 rounded-lg bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.11)]">
          <strong class="block text-[27px] text-secondary leading-none font-bold">${stat.value}</strong>
          <span class="text-muted text-[13px]">${stat.label}</span>
        </div>
      `).join('');
    }

    const featuredCard = heroData.featuredCard;
    const featuredCardEl = document.getElementById("hero-featured-card");
    if (featuredCardEl && featuredCard) {
      const featImg = document.getElementById("hero-featured-img");
      const featTitle = document.getElementById("hero-featured-title");
      const featDesc = document.getElementById("hero-featured-desc");
      const featPrice = document.getElementById("hero-featured-price");

      if (featImg) {
        featImg.src = featuredCard.img;
        featImg.alt = featuredCard.title;
      }
      if (featTitle) featTitle.textContent = featuredCard.title;
      if (featDesc) featDesc.textContent = featuredCard.subtitle;
      if (featPrice) featPrice.textContent = featuredCard.price;
    }
  }

  // 6. Features Grid
  const featuresGrid = document.getElementById("features-grid");
  if (featuresGrid && data.features) {
    featuresGrid.innerHTML = data.features.map(feat => `
      <div class="feature-card bg-gradient-to-b from-[rgba(255,255,255,0.075)] to-[rgba(255,255,255,0.035)] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden p-6">
        <div class="text-[32px] mb-[18px]">${feat.icon}</div>
        <h3 class="text-[21px] mb-2 font-bold">${feat.title}</h3>
        <p class="text-muted">${feat.desc}</p>
      </div>
    `).join('');
  }

  // 7. Promotion Details
  const promoSection = document.getElementById("promo-section");
  const promoData = data.promotion;
  if (promoSection && promoData) {
    promoSection.innerHTML = `
      <div class="w-full md:w-1/2">
        <img
          class="w-full h-auto object-cover rounded-2xl shadow-[0_15px_45px_rgba(255,106,0,0.25)] border border-[rgba(255,255,255,0.08)]"
          src="${promoData.bannerImg}"
          alt="${promoData.title}" loading="lazy">
      </div>
      <div class="w-full md:w-1/2">
        <span
          class="inline-block px-3 py-1.5 rounded-full bg-[rgba(255,106,0,0.16)] text-secondary text-[13px] font-extrabold mb-4">${promoData.tag}</span>
        <h3 class="text-2xl md:text-3xl font-bold mb-4">${promoData.title}</h3>
        <p class="text-[#dedede] mb-6 leading-relaxed">
          ${promoData.description}
        </p>
        <ul class="space-y-3 mb-8 text-muted">
          ${promoData.details.map(pt => `<li class="flex items-center gap-3"><span class="text-primary">✓</span> ${pt}</li>`).join('')}
        </ul>
        ${visibility.booking !== false ? `
        <a class="btn inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 rounded-full font-extrabold cursor-pointer transition duration-250 ease-in-out bg-gradient-to-br from-primary to-secondary text-[#120900] shadow-fire hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(255,106,0,0.5)]"
          href="#booking">${promoData.btnText}</a>
        ` : ''}
      </div>
    `;

    // Update promo popup
    const promoPopupImg = document.querySelector("#promo-popup img");
    if (promoPopupImg) {
      promoPopupImg.src = promoData.bannerImg;
      promoPopupImg.alt = promoData.title;
    }
    const promoPopupTitle = document.querySelector("#promo-popup h3");
    if (promoPopupTitle) promoPopupTitle.textContent = promoData.title;
  }

  // 8. Menu items
  const menuGrid = document.getElementById("menu-grid");
  const popupMenuGrid = document.getElementById("popup-menu-grid");
  const menuItems = data.menuItems || [];

  if (menuGrid) {
    const featuredMenuItems = menuItems.filter(item => item.isFeatured);
    menuGrid.innerHTML = featuredMenuItems.map(item => `
      <article
        class="menu-card bg-gradient-to-b from-[rgba(255,255,255,0.075)] to-[rgba(255,255,255,0.035)] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden transition-all duration-250 ease-in-out hover:-translate-y-[7px] hover:border-[rgba(255,106,0,0.42)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <img class="h-[190px] w-full object-cover" src="${item.img}" alt="${item.title}" loading="lazy">
        <div class="p-[18px]">
          <span
            class="inline-block px-2 py-[5px] rounded-full bg-[rgba(255,106,0,0.16)] text-secondary text-[12px] font-extrabold mb-2">${item.tag}</span>
          <h3 class="text-[21px] mb-2 font-bold">${item.title}</h3>
          <p class="text-muted">${item.desc}</p>
          <div class="flex justify-between items-center mt-3.5">
            <strong class="text-secondary font-[950] text-[22px]">${item.price}</strong>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (popupMenuGrid) {
    popupMenuGrid.innerHTML = menuItems.map(item => `
      <article
        class="menu-card bg-gradient-to-b from-[rgba(255,255,255,0.075)] to-[rgba(255,255,255,0.035)] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden transition-all duration-250 ease-in-out hover:-translate-y-[7px] hover:border-[rgba(255,106,0,0.42)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <img class="h-[190px] w-full object-cover" src="${item.img}" alt="${item.title}">
        <div class="p-[18px]">
          <span
            class="inline-block px-2 py-[5px] rounded-full bg-[rgba(255,106,0,0.16)] text-secondary text-[12px] font-extrabold mb-2">${item.tag}</span>
          <h3 class="text-[21px] mb-2 font-bold">${item.title}</h3>
          <p class="text-muted">${item.desc}</p>
          <div class="flex justify-between items-center mt-3.5">
            <strong class="text-secondary font-[950] text-[22px]">${item.price}</strong>
          </div>
        </div>
      </article>
    `).join('');
  }

  // 9. Combos
  const comboGrid = document.getElementById("combo-grid");
  if (comboGrid && data.combos) {
    comboGrid.innerHTML = data.combos.map(combo => `
      <article
        class="combo-card bg-gradient-to-b from-[rgba(255,255,255,0.075)] to-[rgba(255,255,255,0.035)] border ${combo.isFeatured ? 'border-[rgba(255,194,71,0.5)] shadow-fire' : 'border-[rgba(255,255,255,0.1)]'} rounded-xl overflow-hidden p-6 relative">
        <span
          class="inline-block px-2 py-[5px] rounded-full bg-[rgba(255,106,0,0.16)] text-secondary text-[12px] font-extrabold mb-2">${combo.tag}</span>
        <h3 class="text-[21px] mb-2 font-bold">${combo.title}</h3>
        <p class="text-muted">${combo.desc}</p>
        <ul class="my-[18px] grid gap-2.5 text-muted list-none">
          ${combo.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <div class="price text-secondary font-[950] text-[22px]">${combo.price}</div>
      </article>
    `).join('');
  }

  // 10. Gallery
  const galleryGrid = document.getElementById("gallery-grid");
  if (galleryGrid && data.gallery) {
    galleryGrid.innerHTML = data.gallery.map(cat => `
      <div
        class="${cat.gridClass}"
        data-category="${cat.id}">
        <img class="w-full h-full object-cover transition duration-350 ease-in-out group-hover:scale-[1.08]"
          src="${cat.featuredImg}"
          alt="${cat.title}" loading="lazy">
        <span
          class="absolute left-[18px] bottom-[18px] px-3 py-2 rounded-full bg-[rgba(0,0,0,0.55)] backdrop-blur-[10px] font-extrabold">${cat.tagText}</span>
      </div>
    `).join('');
  }

  // 11. Testimonials / Reviews
  const reviewsGrid = document.getElementById("reviews-grid");
  if (reviewsGrid && data.reviews) {
    reviewsGrid.innerHTML = data.reviews.map(rev => `
      <article
        class="review-card bg-gradient-to-b from-[rgba(255,255,255,0.075)] to-[rgba(255,255,255,0.035)] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden p-6">
        <div class="text-secondary tracking-[3px] mb-3.5">${'★'.repeat(rev.stars)}</div>
        <p class="text-muted">${rev.content}</p>
        <div class="review-author flex items-center gap-3 mt-[18px] font-black"><span
            class="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-primary to-secondary text-[#170900] grid place-items-center font-[950]">${rev.initial}</span>
          ${rev.author}</div>
      </article>
    `).join('');
  }

  // 12. Map Embed & Link Button
  const mapIframe = document.getElementById("map-iframe");
  const mapBtn = document.getElementById("map-btn");
  if (data.restaurant) {
    const lat = data.restaurant.latitude;
    const lng = data.restaurant.longitude;
    const embedUrl = data.restaurant.embedUrl || `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    const mapsUrl = data.restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    if (mapIframe) mapIframe.src = embedUrl;
    if (mapBtn) mapBtn.href = mapsUrl;
  }
}

/**
 * Fallback static data for Lightbox if JSON fetch fails
 */
function getFallbackData() {
  return {
    gallery: [
      {
        id: "khong-gian",
        title: "Không gian tụ tập",
        images: [
          "assets/restaurant-space/khong-gian-quan.jpg",
          "assets/restaurant-space/khong-gian-quan-1.jpg",
          "assets/restaurant-space/background-baner.jpg"
        ]
      },
      {
        id: "mon-nuong",
        title: "Món nướng hấp dẫn",
        images: [
          "assets/menu-image/vu-heo-nuong.jpg",
          "assets/menu-image/ba-chi-heo-nuong.jpg",
          "assets/menu-image/bo-kobe.jpg",
          "assets/menu-image/4-mon.jpg",
          "assets/menu-image/combo-1.jpg",
          "assets/menu-image/combo-2.jpg"
        ]
      },
      {
        id: "ban-be",
        title: "Bạn bè tụ hợp",
        images: [
          "assets/restaurant-space/khach-ghe-1.jpg",
          "assets/restaurant-space/khach-ghe-3.jpg",
          "assets/restaurant-space/khach-ghe-4.jpg",
          "assets/restaurant-space/khach-ghe-6.jpg",
          "assets/restaurant-space/khach-ghe-8.jpg"
        ]
      },
      {
        id: "nuong-tai-ban",
        title: "Trải nghiệm nướng tại bàn",
        images: [
          "assets/restaurant-space/khach-ghe-2.jpg",
          "assets/restaurant-space/khach-ghe-5.jpg",
          "assets/restaurant-space/khach-ghe-7.jpg",
          "assets/restaurant-space/khach-ghe-9.jpg",
          "assets/restaurant-space/khach-ghe-10.jpg"
        ]
      },
      {
        id: "sinh-nhat",
        title: "Đặt tiệc sinh nhật",
        images: [
          "assets/restaurant-space/trang-tri-sinh-nhat.jpg",
          "assets/restaurant-space/trang-tri-sinh-nhat-1.jpg",
          "assets/restaurant-space/trang-tri-sinh-nhat-2.jpg",
          "assets/restaurant-space/trang-tri-sinh-nhat-3.jpg"
        ]
      }
    ]
  };
}

/**
 * Initialize Interactive Events after DOM is rendered
 */
function initInteractiveEvents(data) {
  // Mobile menu toggle logic
  const mobileMenuBtn = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.onclick = () => {
      navLinks.classList.toggle("active");
    };

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.onclick = () => {
        navLinks.classList.remove("active");
      };
    });
  }

  // Intersection Observer for card animations
  const cards = document.querySelectorAll("main .menu-card, .combo-card, .feature-card, .review-card, .gallery-item");
  if (cards.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0, transform: "translateY(24px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 650, easing: "ease-out", fill: "forwards" }
          );
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach((card) => {
      card.style.opacity = 0;
      observer.observe(card);
    });
  }

  // Lightbox Logic
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxCounter = document.getElementById("lightbox-counter");
    const lightboxDots = document.getElementById("lightbox-dots");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    const closeBtn = lightbox.querySelector(".lightbox-close");

    let currentCategory = "";
    let currentIndex = 0;

    // Load gallery mapping
    const galleryData = {};
    if (data && data.gallery) {
      data.gallery.forEach(cat => {
        galleryData[cat.id] = {
          title: cat.title,
          images: cat.images
        };
      });
    }

    function updateLightbox() {
      const category = galleryData[currentCategory];
      if (!category) return;
      const imgSrc = category.images[currentIndex];

      if (lightboxImg) {
        lightboxImg.style.opacity = 0;
        lightboxImg.style.transform = "scale(0.95)";
      }

      setTimeout(() => {
        if (lightboxImg) lightboxImg.src = imgSrc;
        if (lightboxCaption) lightboxCaption.textContent = category.title;
        if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${category.images.length}`;

        const dots = lightboxDots ? lightboxDots.querySelectorAll(".lightbox-dot") : [];
        dots.forEach((dot, idx) => {
          dot.classList.toggle("active", idx === currentIndex);
        });

        if (lightboxImg) {
          lightboxImg.style.opacity = 1;
          lightboxImg.style.transform = "scale(1)";
        }
      }, 150);
    }

    function openLightbox(category, index = 0) {
      currentCategory = category;
      currentIndex = index;

      if (lightboxDots) {
        lightboxDots.innerHTML = "";
        const catImages = galleryData[category].images;
        catImages.forEach((_, idx) => {
          const dot = document.createElement("div");
          dot.className = "lightbox-dot" + (idx === index ? " active" : "");
          dot.addEventListener("click", () => {
            currentIndex = idx;
            updateLightbox();
          });
          lightboxDots.appendChild(dot);
        });
      }

      updateLightbox();
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    function showNext() {
      const category = galleryData[currentCategory];
      if (!category) return;
      currentIndex = (currentIndex + 1) % category.images.length;
      updateLightbox();
    }

    function showPrev() {
      const category = galleryData[currentCategory];
      if (!category) return;
      currentIndex = (currentIndex - 1 + category.images.length) % category.images.length;
      updateLightbox();
    }

    // Bind click handlers to newly created gallery items
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.onclick = () => {
        const category = item.getAttribute("data-category");
        if (category && galleryData[category]) {
          openLightbox(category, 0);
        }
      };
    });

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        showPrev();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        showNext();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = closeLightbox;
    }

    lightbox.onclick = (e) => {
      if (lightboxImg && (e.target === lightbox || e.target === lightbox.querySelector(".lightbox-content"))) {
        closeLightbox();
      }
    };

    if (!window.lightboxKeydownBound) {
      document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
      });
      window.lightboxKeydownBound = true;
    }

    // Touch/Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        showNext();
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        showPrev();
      }
    }
  }

  // Menu Popup Logic
  const menuPopup = document.getElementById("menu-popup");
  const btnAllMenu = document.getElementById("btn-all-menu");

  if (menuPopup && btnAllMenu) {
    const closeX = menuPopup.querySelector(".menu-popup-close-x");
    const btnClose = menuPopup.querySelector(".menu-popup-btn-close");
    const orderLinks = menuPopup.querySelectorAll(".menu-popup-order");

    function openPopup(e) {
      e.preventDefault();
      menuPopup.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closePopup() {
      menuPopup.classList.remove("active");
      document.body.style.overflow = "";
    }

    btnAllMenu.onclick = openPopup;

    if (closeX) closeX.onclick = closePopup;
    if (btnClose) btnClose.onclick = closePopup;

    menuPopup.onclick = (e) => {
      if (e.target === menuPopup) {
        closePopup();
      }
    };

    orderLinks.forEach((link) => {
      link.onclick = () => {
        closePopup();
      };
    });

    if (!window.menuPopupEscBound) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuPopup.classList.contains("active")) {
          closePopup();
        }
      });
      window.menuPopupEscBound = true;
    }
  }

  // Promotion Popup Logic
  const promoPopup = document.getElementById("promo-popup");
  if (promoPopup) {
    const isPromoClosed = localStorage.getItem("promo-closed");
    const closeX = document.getElementById("promo-popup-close-x");
    const btnClose = document.getElementById("promo-popup-btn-close");
    const btnBook = document.getElementById("promo-btn-book");

    function closePromo() {
      promoPopup.classList.remove("active");
      document.body.style.overflow = "";
      localStorage.setItem("promo-closed", "true");
    }

    if (!isPromoClosed && data.sectionsVisibility?.promotion !== false) {
      setTimeout(() => {
        promoPopup.classList.add("active");
        document.body.style.overflow = "hidden";
      }, 1000);
    }

    if (closeX) closeX.onclick = closePromo;
    if (btnClose) btnClose.onclick = closePromo;
    if (btnBook) btnBook.onclick = closePromo;

    promoPopup.onclick = (e) => {
      if (e.target === promoPopup) {
        closePromo();
      }
    };

    if (!window.promoPopupEscBound) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && promoPopup.classList.contains("active")) {
          closePromo();
        }
      });
      window.promoPopupEscBound = true;
    }
  }
}
