import Swiper from "swiper";
window.Swiper = Swiper;
import { Thumbs, Keyboard, FreeMode, Navigation } from "swiper/modules";

function cartSwiper() {
  const productNavSlider = new Swiper(".product-swiper-pagination", {
    loop: false,
    keyboard: true,
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    modules: [Thumbs, Keyboard, FreeMode],
  });

  const productThumbnailSlider = new Swiper(".product-swiper", {
    modules: [Thumbs, Keyboard, FreeMode, Navigation],
    keyboard: true,
    loop: true,
    spaceBetween: 24,
    navigation: {
      nextEl: ".product-swiper-next",
      prevEl: ".product-swiper-prev",
    },
    thumbs: {
      swiper: productNavSlider,
    },
  });
}

cartSwiper();
