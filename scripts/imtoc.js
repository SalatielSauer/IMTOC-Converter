class IMTOCCanvas {
    constructor (element) {
        this.canvas = element;
        this.context = this.canvas.getContext('2d');
        this.rawData = new Uint8ClampedArray();
        this.image = new Image();
        this.zoom = 1;
        this.quality = 512;
        this.imageOffsetX = 0;
        this.imageOffsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastCenter = { x: 0, y: 0 };
        this.onimageload = () => {};
        this.onimageinteract = () => {};
        this.onimagequalitychange = () => {};
        this.dataReaderBind = '';
        this.fileName = 'untitled';

        this.canvas.parentElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            const delta = event.deltaY;
            const zoomSpeed = 0.1;
            const oldZoom = this.zoom;
            
            if (delta > 0) {
                this.zoom = Math.max(0.1, this.zoom - zoomSpeed);
            } else {
                this.zoom = Math.min(10, this.zoom + zoomSpeed);
            }
            
            const zoomRatio = this.zoom / oldZoom;
            this.imageOffsetX = this.imageOffsetX * zoomRatio;
            this.imageOffsetY = this.imageOffsetY * zoomRatio;
            
            this.drawImage();
            this.onimageinteract();
        }, { passive: false });

        this.canvas.parentElement.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.dragStartX = (event.clientX - rect.left) * scaleX - this.imageOffsetX;
            this.dragStartY = (event.clientY - rect.top) * scaleY - this.imageOffsetY;
            this.onimageinteract();
        });

        this.canvas.parentElement.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                this.imageOffsetX = (event.clientX - rect.left) * scaleX - this.dragStartX;
                this.imageOffsetY = (event.clientY - rect.top) * scaleY - this.dragStartY;
                this.drawImage();
            }
        });

        this.canvas.parentElement.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.parentElement.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
    }

    loadImageURL(url) {
        this.image.src = url;
        this.image.onload = () => {
            this.zoom = 1;
            this.imageOffsetX = 0;
            this.imageOffsetY = 0;
            this.drawImage();
            this.setQuality(this.image.width);
            this.updateCanvasStyle();
            this.onimageload();
        }
    }

    updateCanvasStyle() {
        if (!this.image.width || !this.image.height) return;
    
        const aspectRatio = this.image.width / this.image.height;
    
        if (aspectRatio >= 1) {
            this.canvas.style.width = '512px';
            this.canvas.style.height = `${512 / aspectRatio}px`;
        } else {
            this.canvas.style.height = '512px';
            this.canvas.style.width = `${512 * aspectRatio}px`;
        }
    }
    
    setQuality(quality) {
        if (!this.image.width || !this.image.height) return;
    
        const oldCenterX = this.imageOffsetX;
        const oldCenterY = this.imageOffsetY;
    
        const aspectRatio = this.image.width / this.image.height;
        const scale = quality / this.quality;
        this.quality = quality;

        if (aspectRatio >= 1) {
            this.canvas.width = quality;
            this.canvas.height = quality / aspectRatio;
        } else {
            this.canvas.height = quality;
            this.canvas.width = quality * aspectRatio;
        }

        this.imageOffsetX = oldCenterX * scale;
        this.imageOffsetY = oldCenterY * scale;
    
        this.drawImage();
        this.onimagequalitychange();
    }
    

    drawImage() {
        if (!this.image.width) return;
        
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const aspectRatio = this.image.width / this.image.height;
        let scaledWidth, scaledHeight;
        
        if (aspectRatio >= 1) {
            scaledWidth = this.quality;
            scaledHeight = this.quality / aspectRatio;
        } else {
            scaledHeight = this.quality;
            scaledWidth = this.quality * aspectRatio;
        }
        
        scaledWidth *= this.zoom;
        scaledHeight *= this.zoom;
        
        const x = (this.canvas.width - scaledWidth) / 2 + this.imageOffsetX;
        const y = (this.canvas.height - scaledHeight) / 2 + this.imageOffsetY;
        
        this.context.imageSmoothingEnabled = false;
        this.context.drawImage(this.image, x, y, scaledWidth, scaledHeight);
    }

    getDataReaderProperty(keyword) {
        const regex = new RegExp(`//\\s*@${keyword}\\s+(\\S+)`);
        const match = this.dataReaderBind.match(regex);
        return match ? match[1] : null;
    }

    _rgb2hex(color) { return ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1); }

    splitRGBA(array) {
        let rgba = [];
        for (var i = 0; i < array.length; i+=4) {
            rgba.push([array[i], array[i+1], array[i+2], array[i+3]]);
        };
        return rgba;
    }

    generateConfig() {
        if (!this.image) return;
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = [];
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const rgb = [
                imageData.data[i],
                imageData.data[i + 1],
                imageData.data[i + 2]
            ];
            pixels.push(`${this._rgb2hex(rgb)}`);
        }

        return `_IMTOC_WIDTH = ${this.canvas.width}
_IMTOC_HEIGHT = ${this.canvas.height}
_IMTOC_DATA = [${pixels.join('')}]
_IMTOC_FILENAME = "${this.fileName}"
_IMTOC_COLUMN = 1
_IMTOC_DRAW = [
	_IMTOC_DRAWPIXEL 0
]
_IMTOC_DRAWPIXEL = [
	local IMTOC_INDEX _IMTOC_PIXEL _IMTOC_RGB
	_IMTOC_INDEX = $arg1
	_IMTOC_PIXEL = (concatword "0x" (substr $_IMTOC_DATA $_IMTOC_INDEX 6))
	_IMTOC_RGB = (concat (divf (& (>> $_IMTOC_PIXEL 0x10) 0xFF) 0xFF) (divf (& (>> $_IMTOC_PIXEL 0x8) 0xFF) 0xFF) (divf (& $_IMTOC_PIXEL 0xFF) 0xFF))
	do [_IMTOC_oncolumn @_IMTOC_RGB @_IMTOC_INDEX]
	if (= $_IMTOC_COLUMN $_IMTOC_WIDTH) [
		do [_IMTOC_onrow @_IMTOC_RGB @_IMTOC_INDEX]
		_IMTOC_COLUMN = 1
	] [
		_IMTOC_COLUMN = (+ $_IMTOC_COLUMN 1)
	]
	if (< $_IMTOC_INDEX (* (* $_IMTOC_WIDTH $_IMTOC_HEIGHT) 6)) [
        sleep $_IMTOC_delay [
            _IMTOC_DRAWPIXEL (+ $_IMTOC_INDEX 6)
        ]
	] [
		nodebug [_IMTOC_onend]
	]
]
${this.dataReaderBind}
nodebug [_IMTOC_onexec]
// Generated by IMTOC, image -> cfg converter by Salatiel.`}
}