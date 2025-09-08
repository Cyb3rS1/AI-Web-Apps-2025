
// initiates carousels so swipe functionality will work upon loading
document.addEventListener('DOMContentLoaded', function () {
        var certCarousel = new bootstrap.Carousel(document.getElementById('certCarouselIndicators'));
        var albumsBookCoversCarousel = new bootstrap.Carousel(document.getElementById('albumsBookCoversCarouselIndicators'));
        var brandingPackagingCarousel = new bootstrap.Carousel(document.getElementById('brandingPackagingCarouselIndicators'));
        var smorgasbordCarousel = new bootstrap.Carousel(document.getElementById('smorgasbordCarouselIndicators'));
    });

document.addEventListener('DOMContentLoaded', () => {
    const certCard = document.getElementById('firstCertCard');
    
    // Set up the Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is in the viewport
            if (entry.isIntersecting) {
                // Add the .animate class to trigger the CSS animation
                entry.target.classList.add('animate');
                // Stop observing after the animation is triggered once
                observer.unobserve(entry.target);
            }
        });
    });
    
    // Start observing the box element
    observer.observe(certCard);
});

document.addEventListener('DOMContentLoaded', () => {
    const firstProjectImg = document.getElementById('firstProjectImg');
    
    // Set up the Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is in the viewport
            if (entry.isIntersecting) {
                // Add the .animate class to trigger the CSS animation
                entry.target.classList.add('animate');
                // Stop observing after the animation is triggered once
                observer.unobserve(entry.target);
            }
        });
    });
    
    // Start observing the box element
    observer.observe(firstProjectImg);
});

document.addEventListener('DOMContentLoaded', () => {
    const firstBrandingPackagingImg = document.getElementById('firstBrandingPackagingImg');
    
    // Set up the Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is in the viewport
            if (entry.isIntersecting) {
                // Add the .animate class to trigger the CSS animation
                entry.target.classList.add('animate');
                // Stop observing after the animation is triggered once
                observer.unobserve(entry.target);
            }
        });
    });
    
    // Start observing the box element
    observer.observe(firstBrandingPackagingImg);
});

document.addEventListener('DOMContentLoaded', () => {
    const firstSmorgasbordImg = document.getElementById('firstSmorgasbordImg');
    
    // Set up the Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is in the viewport
            if (entry.isIntersecting) {
                // Add the .animate class to trigger the CSS animation
                entry.target.classList.add('animate');
                // Stop observing after the animation is triggered once
                observer.unobserve(entry.target);
            }
        });
    });
    
    // Start observing the box element
    observer.observe(firstSmorgasbordImg);
});

window.addEventListener('scroll', function() {
  const header = document.getElementById('navBar');
  if (window.scrollY > 15) { // Adjust '50' to your desired scroll trigger point
    header.classList.add('shadow-header');
  } else {
    header.classList.remove('shadow-header');
  }
});