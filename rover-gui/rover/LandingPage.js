function startMission() {
    // Adds a dramatic fade out before navigating
    document.body.style.transition = "opacity 0.8s ease";
    document.body.style.opacity = "0";
    
    setTimeout(() => {
        window.location.href = "SelectOperationalMode.html";
    }, 800);
}