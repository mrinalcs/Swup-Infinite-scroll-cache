# Infinite Scroll with Swup Integration
 
- Infinite Scroll: Automatically loads additional content as the user scrolls down.
- Swup Integration: Smooth transitions between pages while preserving scroll position and loaded content.

## Issue: Load More Button Visibility
When navigating back to a page using Swup after reaching the last page with Infinite Scroll, the "Load More" button's visibility may not be correctly maintained. This happens because Infinite Scroll hides the button when the last page is reached, but this state is not preserved across page transitions. [demo](https://swup-demo-infinite-scroll-cache-temp.replit.app/)
 
To fix the issue 

Track Last Page Reached: Use a flag (lastPageReached) to remember if the last page has been reached using the Infinite Scroll event handlers.
Update Button Visibility on Page View: Adjust the visibility of the "Load More" button based on whether the last page was previously reached. This ensures consistency in button display across page transitions.
