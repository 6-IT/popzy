Modal.elements = [];
function Modal(options) {
    if(!options.content && !options.teamplateId) {
        console.error('khong co content va templateId')
    }
    // Lay thuoc tinh, phuong thuc cua options
    this.opt = Object.assign({
        // teamplateId, 
        closeMethods : ['button', 'overlay', 'escape'],
        destroyOnClose : true,
        cssClass : [],
        // onOpen,
        // onClose,
        footer : false
    }, options)

    // template
    this.template = document.querySelector(`#${this.opt.teamplateId}`);
    if(!this.template) {
        console.error('Loi');
        return;
    }

    // lay gia tri -> closeMethods
    this._allowButtonClose = this.opt.closeMethods.includes('button')
    this._allowBackdropClose = this.opt.closeMethods.includes('overlay')
    this._allowEscapeClose = this.opt.closeMethods.includes('escape')
    // add button footer -> []
    this._footerButtons = []
    this._handleEscapeKey = this._handleEscapeKey.bind(this)
}

// build : create element modal
Modal.prototype.build = function() {
    const content = this.template.content.cloneNode(true);
    
    // tao element cua modal
    this._backdrop = document.createElement('div');
    this._backdrop.className = 'modal-backdrop';

    const container = document.createElement('div');
    container.className = 'modal-container';
    this.opt.cssClass.forEach(el => {
        if(typeof el === 'string') container.classList.add(el)
    })

    if(this._allowButtonClose) {
        const closeModal = this._createButton('&times', 'modal-close', () => this.close())
        container.append(closeModal);
    }

    const contentModal = document.createElement('div');
    contentModal.className = 'modal-content';

    // add element -> body
    contentModal.append(content);
    container.append(contentModal);

    // kiem tra -> add footer
    if(this.opt.footer) {
        this._footerModal = document.createElement('div');
        this._footerModal.className = 'footer-modal';
        this._renderFooterContent();
        this._renderFooterButtons();
        container.append(this._footerModal)
    }

    this._backdrop.append(container);
    document.body.append(this._backdrop)
}

// phương thức (medthod) mở modal
Modal.prototype.open = function() {
    Modal.elements.push(this);
    if(!this._backdrop) {
        this.build();
    }

    // xu ly de modal co hieu ung trasition khi open
    setTimeout( () => {
        this._backdrop.classList.add('show')
    }, 0)

    // Cac event: click button, overlay, escape -> dong modal
    

    if(this._allowBackdropClose) {
        this._backdrop.onclick = e => {
            if(e.target === this._backdrop) this.close();
        }
    }

    if(this._allowEscapeClose) {
        document.addEventListener('keydown', this._handleEscapeKey)
    }

    // khoa sroll khi open modal
    document.body.classList.add('no-scroll');
    document.body.style.paddingRight = this._getWidthSrollBar() + 'px';

    // onOpen
    this._ontransitionend(this.opt.onOpen)


    // tra ra modal
    return this._backdrop;
}

// ontransitionend
Modal.prototype._ontransitionend = function(callback) {
    this._backdrop.ontransitionend = (e) => {
        if(e.propertyName !== 'transform') return
        if(typeof callback === 'function') callback();
    }
}

// handle event escape
Modal.prototype._handleEscapeKey = function(e) {
    const lastModal = Modal.elements[Modal.elements.length - 1];
    if(e.key === 'Escape' && this === lastModal) this.close();
}

// setFooterModdal
Modal.prototype.setFooterModdal = function(html) {
    this._footerContent = html;
    this._renderFooterContent()
}

// createButton
Modal.prototype._createButton = function(title, cssClass, callback) {
    const button = document.createElement('button');
    button.innerHTML = title;
    button.className = cssClass;
    button.onclick = callback;

    return button;
}

// addButtonFooter
Modal.prototype.addButtonFooter = function(title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);
    this._footerButtons.push(button)
    this._renderFooterButtons();
    
}

Modal.prototype._renderFooterContent = function() {
    if(this._footerModal && this._footerContent) {
        this._footerModal.innerHTML = this._footerContent;
    }
}

Modal.prototype._renderFooterButtons = function() {
    if(this._footerModal) {
        this._footerButtons.forEach((btn) => {
            this._footerModal.append(btn)
        })
    }
}
// phương thức (medthod) đóng modal
Modal.prototype.close = function(destroy = this.opt.destroyOnClose) {
    Modal.elements.pop();
    this._backdrop.classList.remove('show');
    if(this._allowEscapeClose) {
        document.removeEventListener('keydown', this._handleEscapeKey)
    }
    this._ontransitionend(() => {
        if(destroy && this._backdrop) {
            this._backdrop.remove();
            this._backdrop = null
        }

        // scroll
        if(!Modal.elements.length) {
            document.body.classList.remove('no-scroll');
            document.body.style.paddingRight = '';
        }

        // onClose
        if(typeof onClose === 'function') this.opt.onClose();
    })
}

// phuong thuc xoa backdrop -> body
Modal.prototype.destroy = function() {
    this.close(true)
}

Modal.prototype._getWidthSrollBar = function() {
    // lay width cua sroll
    // caches
    if(this._widthScroll) return this._widthScroll;
    const div = document.createElement('div');
    Object.assign(div.style, {
        overflow: 'scroll',
        position: 'absolute',
        top: '9999px',
    })
    document.body.append(div);
    this._widthScroll = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return this._widthScroll;
}

