class CaseInfoUI {
    private isVisible: boolean = true;
    private element: HTMLElement | null;
    private toggleButton: HTMLElement | null;

    constructor() {
        this.element = document.getElementById('case-info');
        if (this.element) {
            // Set initial position to top right corner, away from play area
            this.element.style.position = 'absolute';
            this.element.style.right = '20px';
            this.element.style.top = '20px';
            this.element.style.maxWidth = '250px';
            this.element.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.element.style.padding = '15px';
            this.element.style.borderRadius = '8px';
            this.element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            this.element.style.zIndex = '1000';
            
            // Create toggle button
            this.toggleButton = document.createElement('button');
            this.toggleButton.innerText = 'Hide Case Info';
            this.toggleButton.style.position = 'absolute';
            this.toggleButton.style.right = '20px';
            this.toggleButton.style.top = '20px';
            this.toggleButton.style.zIndex = '1001';
            this.toggleButton.style.padding = '5px 10px';
            this.toggleButton.style.backgroundColor = '#1E3F7A';
            this.toggleButton.style.color = 'white';
            this.toggleButton.style.border = 'none';
            this.toggleButton.style.borderRadius = '4px';
            this.toggleButton.style.cursor = 'pointer';
            this.toggleButton.addEventListener('click', () => this.toggleVisibility());
            
            // Add toggle button to document
            document.body.appendChild(this.toggleButton);
        }
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        if (this.element && this.toggleButton) {
            if (this.isVisible) {
                this.element.classList.remove('hidden');
                this.element.style.display = 'block';
                this.toggleButton.innerText = 'Hide Case Info';
            } else {
                this.element.classList.add('hidden');
                this.element.style.display = 'none';
                this.toggleButton.innerText = 'Show Case Info';
            }
        }
    }

    show() {
        if (this.element && !this.isVisible) {
            this.toggleVisibility();
        }
    }

    hide() {
        if (this.element && this.isVisible) {
            this.toggleVisibility();
        }
    }

    update(caseInfo: any) {
        if (!this.element) return;
        
        let html = `<h3>${caseInfo.title}</h3>`;
        html += '<p>Case stages:</p>';
        html += '<ul>';
        
        caseInfo.stages.forEach((stage: any) => {
            html += `<li>${stage.description} ${stage.completed ? '✓' : ''}</li>`;
        });
        
        html += '</ul>';
        
        // Add minimize hint
        html += '<p class="hint">(Click the button above to hide)</p>';
        
        this.element.innerHTML = html;
    }
}
