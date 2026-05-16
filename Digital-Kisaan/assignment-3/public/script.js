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
