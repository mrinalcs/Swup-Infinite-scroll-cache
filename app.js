import Swup from 'https://unpkg.com/swup@4?module';
import SwupScrollPlugin from 'https://unpkg.com/@swup/scroll-plugin@3?module';
import SwupPreloadPlugin from 'https://unpkg.com/@swup/preload-plugin@3?module';

const swup = new Swup({
  plugins: [
    new SwupPreloadPlugin(), // will put the first page into the cache automatically
    new SwupScrollPlugin({
      animateScroll: false,
      shouldResetScrollPosition: (link) => !link.matches('.backlink')
    })
  ]
});

// Flag to track if Infinite Scroll has been initialized
let infiniteScrollInitialized = false;
// Flag to track if last page has been reached
let lastPageReached = false;

function initInfiniteScroll() {
  const nextLinkSelector = '.pagination__next';
  const listSelector = '.list';
  const listItemSelector = '.list_item';
  const buttonSelector = '.load-more';

  // Function to dynamically load Infinite Scroll library
  function loadInfiniteScroll(callback) {
    if (window.InfiniteScroll) {
      callback(); // InfiniteScroll already loaded, proceed with initialization
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.min.js';
      script.onload = callback;
      document.body.appendChild(script);
    }
  }

  // Initialize Infinite Scroll after loading the library
  function initializeInfiniteScroll() {
    const el = document.querySelector(listSelector);
    if (!el) return;

    const nextLink = document.querySelector(nextLinkSelector);
    if (!nextLink) return;

    const InfiniteScroll = window.InfiniteScroll; // Assuming InfiniteScroll is exposed globally after script load
    const infScroll = new InfiniteScroll(el, {
      path: nextLinkSelector,
      append: listItemSelector,
      history: false,
      prefill: false,
      button: buttonSelector,
      scrollThreshold: false,
    });

    infScroll.on("append", (doc, _path, items) => {
      // Get the next link. If there is no more available, replace it with an empty <span>
      const nextLink = doc.querySelector(nextLinkSelector) ?? doc.createElement('span');
      document.querySelector(nextLinkSelector)?.replaceWith(nextLink);
      // Update the cache
      updateCache(listSelector, items, nextLink);
      items.forEach(item => item.classList.add('is-new'));
      nextTick(() => {
        items.forEach(item => item.classList.remove('is-new'));
      });
    });

    infScroll.on("last", () => {
      lastPageReached = true;
      // Hide the "Load More" button when reaching last page
      const loadMoreButton = document.querySelector(buttonSelector);
      if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
      }
    });

    // Set flag indicating Infinite Scroll has been initialized
    infiniteScrollInitialized = true;
  }

  // Function to update cache
  function updateCache(containerSelector, items, nextLink) {
    const url = swup.getCurrentUrl();
    const cachedPage = swup.cache.get(url);
    if (!cachedPage) return;

    const cachedDocument = new DOMParser().parseFromString(cachedPage.html, 'text/html');
    const container = cachedDocument.querySelector(containerSelector);
    if (!container) return;

    // Update the items
    const clonedItems = [...items].map(item => item.cloneNode(true));
    container.append(...clonedItems);

    // Update the next link
    if (nextLink) {
      cachedDocument.querySelector(nextLinkSelector)?.replaceWith(nextLink.cloneNode(true));
    }

    // Save the modified html as a string in the cache entry
    cachedPage.html = cachedDocument.documentElement.outerHTML;
    swup.cache.update(url, cachedPage);
  }

  // Helper function to wait for the next tick
  function nextTick(cb) {
    requestAnimationFrame(() => {
      requestAnimationFrame(cb);
    });
  }

  // Load Infinite Scroll library and initialize if not already initialized
  if (!infiniteScrollInitialized) {
    loadInfiniteScroll(initializeInfiniteScroll);
  } else {
    initializeInfiniteScroll();
  }

  // Show or hide the "Load More" button based on last page state on Swup page view
  swup.hooks.on('page:view', () => {
    if (lastPageReached) {
      const loadMoreButton = document.querySelector(buttonSelector);
      if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
      }
    }
  });
}

// Function to initialize on initial page load
function init() {
  initInfiniteScroll();
}

// Call init() on initial page load
document.addEventListener('DOMContentLoaded', init);

// Call init() on each page transition
swup.hooks.on('page:view', init);
