let dataUrl = null;
let debounceTimeout = null;

document.addEventListener('DOMContentLoaded', async function () {
    [document.getElementById('outputarea'), document.getElementById('user'), document.getElementById('directory'), document.getElementById('machine'), document.getElementById('command'), document.getElementById("templateName")].forEach(e => e.addEventListener('input', function () {
        debounceRenderImage();
    }));

    document.getElementById('include-topbar').addEventListener('change', function () {
        if (this.checked) {
            document.querySelector('.screenshot__container img').classList.remove('hidden');
        } else {
            document.querySelector('.screenshot__container img').classList.add('hidden');
        }
        renderImage();
    });

    document.getElementById('copy-to-clipboard').addEventListener('click', function () {
        if (dataUrl) {
            copyImageToClipboard(dataUrl);
        } else {
            alert('No image data available to copy.');
        }
    });

    await refreshImage();
    renderImage();
});

function debounceRenderImage() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async function () {
        await refreshImage();
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

async function refreshImage() {
    document.getElementById('slot').innerHTML = await buildContent(document.getElementById("templateName").value, {
        content: document.getElementById('outputarea').value || "&lt;Your code output would be shown here&gt;",
        class: document.getElementById('user').value || "&lt;This is the user that you log in as&gt;",
        directory: document.getElementById('directory').value || "&lt;This is the folder that you are in&gt;",
        machine: document.getElementById('machine').value || "&lt;This is the name of the machine that you are on&gt;",
        command: document.getElementById('command').value || "&lt;This is the command that you ran to get this output&gt;",
    });
    renderImage();
}

function renderImage() {
    const node = document.getElementById('output');
    htmlToImage.toPng(node)
        .then((generation) => {
            dataUrl = generation;
        })
}

async function buildContent(templateName, values) {
    let template = await getTemplate(templateName);
    Object.keys(values).forEach(key => {
        template = template.replaceAll(`{{${key}}}`, values[key].replaceAll(" ", " ")).replaceAll(`{{ ${key} }}`, values[key].replaceAll(" ", " "));
    });
    return template;
}


async function getTemplate(templateName) {
    const response = await fetch(`/templates/${templateName}.html`);
    const text = await response.text();
    return text;
}
