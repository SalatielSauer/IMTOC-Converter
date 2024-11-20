const CANVAS = new IMTOCCanvas(window['canvas']);
const DATAREADER = new TextEditor(window['texteditor']);

DATAREADER.forceLang = 'c';
DATAREADER.refreshText(imtoc_data_readers[0].body);

imtoc_data_readers.forEach((DR, index) => {
    const element_option = document.createElement('option');
    element_option.value = index;
    element_option.title = `Data Reader by ${DR.author}`;
    element_option.innerHTML = `📄${DR.name}`;
    window['container-dropdown-item-selector'].appendChild(element_option);
})

window['container-dropdown-item-selector'].addEventListener('change', event => {
    const option = event.target.value;
    const DR = imtoc_data_readers[option];
    DATAREADER.refreshText(DR.body);
    window['floating-container-footnote'].innerHTML = `Script by <a href=${DR.url} target="_blank">${DR.author}</a>`;
})

window['range-image-quality'].addEventListener('input', (event) => {
    CANVAS.setQuality(parseInt(event.target.value));
});

window['fileDownload'].addEventListener('click', (event) => {
    CANVAS.dataReaderBind = DATAREADER.textarea.value;
    const a = document.createElement('a');
    const base64Content = btoa(CANVAS.generateConfig());
    a.href = 'data:text/plain;base64,' + base64Content;
    a.download = `${CANVAS.fileName.substring(0, CANVAS.fileName.lastIndexOf('.')).replace(/\s/g, '').toLowerCase() }.cfg`;
    a.click();
})

function handleFile(file) {
    if (file) {
        const file_reader = new FileReader();
        CANVAS.fileName = file.name || 'imtoc-image';;
        file_reader.onload = (reader_data) => {
            CANVAS.loadImageURL(reader_data.target.result);
        };
        file_reader.readAsDataURL(file);
    }
}

window['fileInput'].addEventListener('change', (event) => {
    const file_stream = event.target.files[0];
    handleFile(file_stream);

});

const canvasContainer = window['canvas-container'];
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    canvasContainer.addEventListener(eventName, (event) => event.preventDefault());
});

canvasContainer.addEventListener('dragover', () => {
    canvasContainer.classList.add('dragging');
});

['dragleave', 'drop'].forEach(eventName => {
    canvasContainer.addEventListener(eventName, () => {
        canvasContainer.classList.remove('dragging');
    });
});

canvasContainer.addEventListener('drop', (event) => {
    const file_stream = event.dataTransfer.files[0];
    handleFile(file_stream);
});

window.addEventListener('paste', (event) => {
    const clipboardItems = event.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            handleFile(blob);
            break;
        }
    }
});

CANVAS.onimageload = () => {
    window['fileDownload'].disabled = false;
    window['range-image-quality'].disabled = false;
    window['range-image-quality'].value = window['range-image-quality'].max = Math.max(CANVAS.image.width, CANVAS.image.height);
    CANVAS.canvas.style.backgroundImage = 'url("images/default.png")';
}

CANVAS.onimageinteract = () => {
    window['tooltip-mouse'].style.display = 'none';
}

CANVAS.onimagequalitychange = () => {
    window['tooltip-mouse'].style.display = 'block';
    window['tooltip-mouse'].textContent = `Cubes: ${CANVAS.canvas.width*CANVAS.canvas.height} (${CANVAS.canvas.width}x${CANVAS.canvas.height})`;
}

interact('.floating-container-header').draggable({
    listeners: {
        start (event) { },
        move (event) {
            let parent = event.target.parentNode;

            let x = (parseInt(parent.getAttribute('pos_x')) || 0) + event.dx;
            let y = (parseInt(parent.getAttribute('pos_y')) || 0) + event.dy;

            let minX = -parent.offsetWidth / 2;
            let maxX = window.innerWidth - parent.offsetWidth / 2;
            let minY = 0;
            let maxY = window.innerHeight - parent.offsetHeight / 2;

            x = Math.max(minX, Math.min(maxX, x));
            y = Math.max(minY, Math.min(maxY, y));

            x = Math.round(x);
            y = Math.round(y);
            parent.setAttribute('pos_x', x);
            parent.setAttribute('pos_y', y);

            event.target.parentNode.style.transform = `translate(${x}px, ${y}px)`;
        },
    }
});