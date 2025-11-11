function showMainContent() {
  const banner = document.getElementById('banner');
  const dotsContainer = document.querySelector('.banner-dots');

  banner.innerHTML = '';
  dotsContainer.innerHTML = '';

  const slideContents = [
    { type: 'image', src: './assets/MadeInKLD.svg' },
    { type: 'image', src: './assets/MarzipanStout.svg' },
    { type: 'image', src: './assets/Loyalty.svg' },
    // {
    //   type: 'video',
    //   src: '../assets/pumpkin.webm',
    //   muted: true,
    //   loop: true,
    //   playsInline: true,
    //   preload: 'auto',
    // },
    // {
    //   type: 'image',
    //   src: 'https://media.giphy.com/media/26n6WgS456BJN3JwA/giphy.gif',
    // },
  ];

  const slides = [];
  const dots = [];
  let soundToggle = null; // Добавляем переменную для кнопки звука

  slideContents.forEach((content, index) => {
    const slide = createSlide(content);
    banner.appendChild(slide);
    slides.push(slide);

    // Находим soundToggle в видео-слайде
    if (content.type === 'video' && !soundToggle) {
      soundToggle = slide.querySelector('.video-button');
    }

    const dot = document.createElement('button');
    dot.classList.add('banner-dot');
    dot.setAttribute('data-index', index);
    dotsContainer.appendChild(dot);
    dots.push(dot);

    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Инициализируем bannerElements с soundToggle
  window.bannerElements = {
    slides,
    dots,
    currentSlide: 0,
    soundToggle: soundToggle || createFallbackSoundToggle(), // Создаем fallback если нет видео
  };

  addScrollHandler();
  goToSlide(0);
}

// Создаем fallback кнопку звука если нет видео-слайдов
function createFallbackSoundToggle() {
  const soundToggle = document.createElement('div');
  soundToggle.classList.add('video-button', 'glass', 'glass--border-full');
  soundToggle.style.display = 'none'; // Сразу скрываем
  soundToggle.type = 'button';
  soundToggle.innerHTML = `
    <svg class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2">
      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <line x1="2" y1="22" x2="22" y2="2" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2"/>
    </svg>`;

  // Добавляем в DOM, но скрываем
  document.body.appendChild(soundToggle);
  return soundToggle;
}

function createSlide(content) {
  switch (content.type) {
    case 'image':
      return createImageSlide(content);
    case 'video':
      return createVideoSlide(content);
    default:
      console.warn(`Unknown slide type: ${content.type}`);
      return createImageSlide(content);
  }
}

function createImageSlide(content) {
  const img = document.createElement('img');
  img.classList.add('slide');
  img.src = content.src;
  img.alt = content.alt || '';
  return img;
}

function createVideoSlide(content) {
  const container = document.createElement('div');
  container.classList.add('slide');

  const video = document.createElement('video');
  video.classList.add('slide');
  video.muted = content.muted !== undefined ? content.muted : true;
  video.loop = content.loop !== undefined ? content.loop : true;
  video.playsInline =
    content.playsInline !== undefined ? content.playsInline : true;
  video.preload = content.preload || 'auto';

  const source = document.createElement('source');
  source.src = content.src;

  if (content.src.endsWith('.webm')) {
    source.type = 'video/webm';
  } else if (content.src.endsWith('.mp4')) {
    source.type = 'video/mp4';
  } else if (content.type) {
    source.type = content.type;
  }

  video.appendChild(source);

  // Всегда создаем кнопку звука для видео-слайдов
  const soundToggle = document.createElement('div');
  soundToggle.classList.add('video-button', 'glass', 'glass--border-full');
  soundToggle.type = 'button';
  soundToggle.style.display = 'none'; // Изначально скрываем
  soundToggle.innerHTML = `
    <svg class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2">
      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <line x1="2" y1="22" x2="22" y2="2" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2"/>
    </svg>`;

  soundToggle.addEventListener('click', () => toggleSound(video, soundToggle));
  container.appendChild(soundToggle);
  container.appendChild(video);

  return container;
}

function addScrollHandler() {
  const banner = document.getElementById('banner');

  banner.addEventListener('scroll', () => {
    const scrollTop = banner.scrollTop;
    const bannerHeight = banner.clientHeight;

    const currentIndex = Math.round(scrollTop / bannerHeight);

    updateActiveSlide(currentIndex);
  });
}

function updateActiveSlide(index) {
  const { slides, dots, soundToggle, currentSlide } = window.bannerElements;

  if (currentSlide === index) return;

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  const currentVideo = findVideoInSlide(slides[currentSlide]);
  if (currentVideo) {
    currentVideo.pause();
    // Безопасно обновляем soundToggle
    if (soundToggle && soundToggle.style) {
      soundToggle.style.display = 'none';
    }
  }

  slides[index].classList.add('active');
  dots[index].classList.add('active');

  const nextVideo = findVideoInSlide(slides[index]);
  if (nextVideo) {
    nextVideo.play().catch(e => {
      nextVideo.muted = true;
      nextVideo.play().catch(e2 => {
        console.log('Still cannot play:', e2);
      });
    });

    // Безопасно обновляем soundToggle
    if (soundToggle && soundToggle.style) {
      soundToggle.style.display = 'flex';
    }
  } else {
    // Безопасно скрываем soundToggle
    if (soundToggle && soundToggle.style) {
      soundToggle.style.display = 'none';
    }
  }

  window.bannerElements.currentSlide = index;
}

function findVideoInSlide(slide) {
  if (slide.tagName === 'VIDEO') {
    return slide;
  }

  const video = slide.querySelector('video');
  if (video) {
    return video;
  }

  const videos = slide.getElementsByTagName('video');
  return videos.length > 0 ? videos[0] : null;
}

function goToSlide(index) {
  const banner = document.getElementById('banner');
  const { slides, dots, soundToggle, currentSlide } = window.bannerElements;

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  const currentSlideElement = slides[currentSlide];
  let currentVideo = null;

  if (currentSlideElement.classList.contains('slide')) {
    currentVideo = findVideoInSlide(currentSlideElement);
  }

  if (currentVideo) {
    currentVideo.pause();
    // Безопасно скрываем soundToggle
    if (soundToggle && soundToggle.style) {
      soundToggle.style.display = 'none';
    }
  }

  slides[index].classList.add('active');
  dots[index].classList.add('active');

  const nextSlideElement = slides[index];
  let nextVideo = findVideoInSlide(nextSlideElement);

  if (nextVideo) {
    nextVideo
      .play()
      .then(() => {
        // Безопасно показываем soundToggle
        if (soundToggle && soundToggle.style) {
          soundToggle.style.display = 'flex';
        }
      })
      .catch(e => {
        console.log('Autoplay error:', e);
        // Безопасно скрываем soundToggle
        if (soundToggle && soundToggle.style) {
          soundToggle.style.display = 'none';
        }
      });
  } else {
    // Безопасно скрываем soundToggle
    if (soundToggle && soundToggle.style) {
      soundToggle.style.display = 'none';
    }
  }

  const slideOffsetTop = slides[index].offsetTop;
  banner.scrollTo({
    top: slideOffsetTop,
    behavior: 'smooth',
  });

  window.bannerElements.currentSlide = index;
}

function toggleSound(video, soundToggle) {
  if (!video || !soundToggle) return;

  video.muted = !video.muted;
  soundToggle.innerHTML = video.muted
    ? `
        <svg class="mute-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <line x1="2" y1="22" x2="22" y2="2" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2"/>
        </svg>
      `
    : `
        <svg class="unmute-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      `;
}

let slideInterval;

function getNextSlideIndex() {
  const activeSlide = document.querySelector('.slide.active');
  const allSlides = document.querySelectorAll('.slide');

  if (!activeSlide) {
    return 0;
  }

  const currentIndex = Array.from(allSlides).indexOf(activeSlide);
  const nextIndex = (currentIndex + 1) % allSlides.length;

  return nextIndex;
}

function startSlideShow() {
  slideInterval = setInterval(() => {
    const nextIndex = getNextSlideIndex();
    goToSlide(nextIndex);
  }, 30000);
}

function stopSlideShow() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function setupSwipeDetection() {
  const sliderContainer =
    document.querySelector('.slides-container') || document.body;
  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  sliderContainer.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = false;
    stopSlideShow();
  });

  sliderContainer.addEventListener('touchmove', e => {
    if (!startX || !startY) return;

    const diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping = true;
    }
  });

  sliderContainer.addEventListener('touchend', () => {
    if (isSwiping) {
      setTimeout(startSlideShow, 5000);
    } else {
      startSlideShow();
    }

    startX = 0;
    startY = 0;
    isSwiping = false;
  });

  sliderContainer.addEventListener('mousedown', stopSlideShow);
  sliderContainer.addEventListener('mouseup', () => {
    setTimeout(startSlideShow, 3000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  showMainContent();
  startSlideShow();
  setupSwipeDetection();
});