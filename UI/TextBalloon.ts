// ...existing code...
class TextBalloon {
    // ...existing code...
    ensureVisibility() {
        const balloonElement = document.getElementById(this.id);
        if (balloonElement) {
            balloonElement.style.zIndex = '1000'; // Ensure it is above other objects
        }
    }
}
// ...existing code...
