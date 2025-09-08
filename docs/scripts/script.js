const bouncingElement = document.querySelector('.bouncing-element');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-bounce'); // Add a class to trigger the animation
      observer.unobserve(entry.target); // Stop observing after animation starts
    }
  });
}, { threshold: .5 }); // Trigger when 50% of the element is visible

observer.observe(bouncingElement);