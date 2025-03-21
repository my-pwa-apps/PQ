class DialogManager {
    constructor(game) {
        this.game = game;
        this.currentDialog = null;
        this.currentIndex = 0;
    }

    show(dialogId) {
        const dialog = window.GAME_DATA.dialogs[dialogId];
        if (!dialog) {
            console.error(`Dialog ${dialogId} not found`);
            return;
        }
        this.currentDialog = dialog;
        this.currentIndex = 0;
        this.displayCurrentDialog();
    }

    displayCurrentDialog() {
        if (!this.currentDialog || !this.currentDialog[this.currentIndex]) {
            return;
        }
        const entry = this.currentDialog[this.currentIndex];
        console.log("Showing dialog:", entry.text);
        // Implement actual dialog display logic here
    }
}

// Make it available globally
window.DialogManager = DialogManager;
