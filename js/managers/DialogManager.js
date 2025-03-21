class DialogManager {
    constructor() {
        this.currentDialog = null;
    }

    show(dialogId) {
        const dialog = window.GAME_DATA.dialogs[dialogId];
        if (!dialog) {
            console.error(`Dialog with id ${dialogId} not found`);
            return;
        }
        this.currentDialog = dialog;
        // Display the first dialog message
        this.displayDialog(0);
    }

    displayDialog(index) {
        if (!this.currentDialog || !this.currentDialog[index]) {
            return;
        }
        const dialogEntry = this.currentDialog[index];
        // You can implement the actual dialog display logic here
        console.log('Dialog:', dialogEntry.text);
    }
}

// Make it available globally
window.DialogManager = DialogManager;
