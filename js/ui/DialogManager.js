class DialogManager {
    constructor() {
        this.dialogBox = document.getElementById('dialog-box');
        this.dialogQueue = [];
        this.isShowing = false;
    }

    show(text, duration = 5000) {
        if (!this.dialogBox || !text) return;
        
        if (this.isShowing) {
            this.dialogQueue.push({text, duration});
            return;
        }

        this.isShowing = true;
        this.dialogBox.innerText = text;
        this.dialogBox.style.display = 'block';
        
        setTimeout(() => {
            this.hideDialog();
        }, duration);
    }

    hideDialog() {
        if (!this.dialogBox) return;
        
        this.dialogBox.style.display = 'none';
        this.isShowing = false;

        if (this.dialogQueue.length > 0) {
            const nextDialog = this.dialogQueue.shift();
            setTimeout(() => {
                this.show(nextDialog.text, nextDialog.duration);
            }, 100);
        }
    }
}

window.DialogManager = DialogManager;
