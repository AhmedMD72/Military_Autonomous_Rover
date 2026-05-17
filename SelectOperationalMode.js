function selectMode(element) {
    // 1. Get the target URL from the data attribute
    const targetPage = element.getAttribute('data-target');
    
    // 2. Visual feedback: Add an 'active' class for a brief glow effect
    element.style.borderColor = "#00f2c3";
    element.style.boxShadow = "0 0 20px rgba(0, 242, 195, 0.4)";
    
    // 3. Navigate to the page
    setTimeout(() => {
        if (targetPage) {
            window.location.href = targetPage;
        } else {
            console.error("Target page not defined for this card.");
        }
    }, 150);
}