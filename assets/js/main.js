document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle logic
  const mobileMenuBtn = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  // Intersection Observer for card animations
  const cards = document.querySelectorAll(".menu-card, .combo-card, .feature-card, .review-card, .gallery-item");
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

  // Lightbox Logic (only if lightbox elements exist)
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

    const galleryData = {
      "khong-gian": {
        title: "Không gian tụ tập",
        images: [
          "assets/restaurant-space/khong-gian-quan.jpg",
          "assets/restaurant-space/khong-gian-quan-1.jpg",
          "assets/restaurant-space/background-baner.jpg"
        ]
      },
      "mon-nuong": {
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
      "ban-be": {
        title: "Bạn bè tụ hợp",
        images: [
          "assets/restaurant-space/khach-ghe-1.jpg",
          "assets/restaurant-space/khach-ghe-3.jpg",
          "assets/restaurant-space/khach-ghe-4.jpg",
          "assets/restaurant-space/khach-ghe-6.jpg",
          "assets/restaurant-space/khach-ghe-8.jpg"
        ]
      },
      "nuong-tai-ban": {
        title: "Trải nghiệm nướng tại bàn",
        images: [
          "assets/restaurant-space/khach-ghe-2.jpg",
          "assets/restaurant-space/khach-ghe-5.jpg",
          "assets/restaurant-space/khach-ghe-7.jpg",
          "assets/restaurant-space/khach-ghe-9.jpg",
          "assets/restaurant-space/khach-ghe-10.jpg"
        ]
      },
      "sinh-nhat": {
        title: "Đặt tiệc sinh nhật",
        images: [
          "assets/restaurant-space/trang-tri-sinh-nhat.jpg",
          "assets/restaurant-space/trang-tri-sinh-nhat-1.jpg",
          "assets/restaurant-space/trang-tri-sinh-nhat-2.jpg",
          "assets/restaurant-space/trang-tri-sinh-nhat-3.jpg"
        ]
      }
    };

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

    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.getAttribute("data-category");
        if (category && galleryData[category]) {
          openLightbox(category, 0);
        }
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showNext();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", (e) => {
      if (lightboxImg && (e.target === lightbox || e.target === lightbox.querySelector(".lightbox-content"))) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    });

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
});
