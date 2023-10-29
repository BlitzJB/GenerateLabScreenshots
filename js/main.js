let dataUrl = null;
let debounceTimeout = null;

document.addEventListener('DOMContentLoaded', function () {
    [document.getElementById('outputarea'), document.getElementById('class'), document.getElementById('directory')].forEach(e => e.addEventListener('input', function () {
        debounceRenderImage();
    }));

    document.getElementById('include-topbar').addEventListener('change', function () {
        document.querySelector('.screenshot__container > img').classList.toggle('hidden');
        renderImage();
    });

    document.getElementById('copy-to-clipboard').addEventListener('click', function () {
        if (dataUrl) {
            copyImageToClipboard(dataUrl);
        } else {
            alert('No image data available to copy.');
        }
    });

    refreshImage();
    renderImage();
});

function debounceRenderImage() {
    clearTimeout(debounceTimeout);
    document.querySelector('.screenshot__content').innerHTML = 'Loading...';
    debounceTimeout = setTimeout(function () {
        refreshImage();
    }, 500);
}

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

    const clipboardItem = new ClipboardItem({ 'image/png': blob });

    navigator.clipboard.write([clipboardItem])
        .then(function () {
            alert('Image copied to clipboard successfully.');
        })
        .catch(function (err) {
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
}

function buildContent(content, class_, directory) {
    return `$ ./a.out
${content.replaceAll(" ", " ")}
$ pwd
/home/${class_}/Desktop/${directory}`
}
