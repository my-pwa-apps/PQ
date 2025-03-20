class DialogManager {
    constructor() {
        this.dialogBox = document.getElementById('dialog-box');
        this.dialogQueue = [];
        this.isShowing = false;
        
        // Create dialog box if it doesn't exist
        if (!this.dialogBox) {
            this.createDialogBox();
        }
        
        // Prevent memory leaks with bound methods
        this._hideDialogBound = this.hideDialog.bind(this);
    }
    
    createDialogBox() {
        this.dialogBox = document.createElement('div');
        this.dialogBox.id = 'dialog-box';
        this.dialogBox.className = 'dialog-box';
        document.body.appendChild(this.dialogBox);
    }

    show(text, duration = 5000) {
        if (!text) return;
        
        if (this.isShowing) {
            this.dialogQueue.push({text, duration});
            return;
        }

        this.isShowing = true;
        this.dialogBox.innerText = text;
        this.dialogBox.style.display = 'block';
        
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }
        
        this._hideTimeout = setTimeout(this._hideDialogBound, duration);
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
        
        this._hideTimeout = null;
    }
    
    // Add a method for cleaning up
    destroy() {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }
        this.dialogQueue = [];
        this.isShowing = false;
    }
}

window.DialogManager = DialogManager;
