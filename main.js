/* html-to-image.js is already imported in the html filew */

let dataUrl = null;



document.addEventListener('DOMContentLoaded', function() {
    [document.getElementById('outputarea'), document.getElementById('class'), document.getElementById('directory')].forEach(e => e.addEventListener('input', function(e) {
        refreshImage()
        renderImage();
    }));

    document.getElementById('copy-to-clipboard').addEventListener('click', function() {
        /* Copy as pastable image onto clipboard */
        if (dataUrl) {
            copyImageToClipboard(dataUrl);
        } else {
            alert('No image data available to copy.');
        }
    });

    
});

function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const byteCharacters = atob(parts[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}

function copyImageToClipboard(imageDataUrl) {
    const blob = dataURLtoBlob(imageDataUrl);

    // Create a new ClipboardItem with the image data
    const clipboardItem = new ClipboardItem({ 'image/png': blob });

    // Copy the ClipboardItem to the clipboard
    navigator.clipboard.write([clipboardItem])
        .then(function() {
            alert('Image copied to clipboard successfully.');
        })
        .catch(function(err) {
            alert('Error copying image to clipboard:', err);
        });
}

function refreshImage() {
    document.querySelector('.screenshot__content').innerHTML = buildContent(document.getElementById('outputarea').value, document.getElementById('class').value, document.getElementById('directory').value);
    renderImage();
}

function renderImage() {
    const node = document.getElementById('output');
    htmlToImage.toPng(node)
        .then((generation) => {
            dataUrl = generation;
        })
};

function buildContent(content, class_, directory) {
    return `$ ./a.out
${content}
$ pwd
/home/${class_}/Desktop/${directory}`
}