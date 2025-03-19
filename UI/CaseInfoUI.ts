// ...existing code...
class CaseInfoUI {
    // ...existing code...
    private isVisible: boolean = true;

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        const caseInfoElement = document.getElementById('case-info');
        if (caseInfoElement) {
            caseInfoElement.style.display = this.isVisible ? 'block' : 'none';
        }
    }
}
// ...existing code...
