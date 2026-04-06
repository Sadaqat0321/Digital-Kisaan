document.addEventListener("DOMContentLoaded", function() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("navLinks");
    const navItems = navLinks.querySelectorAll("a");

    // Toggle menu visibility
    mobileMenuBtn.addEventListener("click", function() {
        navLinks.classList.toggle("active");
        
        // Optional: toggle icon between bars and times (close)
        const icon = mobileMenuBtn.querySelector("i");
        if (navLinks.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        } else {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    });

    // Bonus: auto-close menu when a link is clicked
    navItems.forEach(function(item) {
        item.addEventListener("click", function() {
            navLinks.classList.remove("active");
            
            // Reset icon
            const icon = mobileMenuBtn.querySelector("i");
            if (icon) {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        });
    });
});

// Midterm Lab: Slick Carousel Initialization
$(document).ready(function() {
    const $slider = $('#product-slider');
    const $counter = $('.slide-counter');

    // Update Counter on slide change
    $slider.on('init reInit afterChange', function(event, slick, currentSlide, nextSlide){
        const i = (currentSlide ? currentSlide : 0) + 1;
        $counter.text('Showing ' + i + ' of ' + slick.slideCount);
    });

    // Initialize Slick Slider
    $slider.slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        prevArrow: $('.slick-prev-custom'),
        nextArrow: $('.slick-next-custom'),
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
});
