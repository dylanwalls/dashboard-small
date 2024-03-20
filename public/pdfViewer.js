// pdfViewer.js

// Ensure PDF.js library is included in your HTML before this script
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// Specify the PDF.js workerSrc
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

/**
 * Displays a PDF in a specified element.
 * @param {string} pdfUrl - The URL to the PDF file.
 * @param {string} containerId - The ID of the HTML element where the PDF should be displayed.
 */
function displayPDF(pdfUrl, containerId) {
    // Asynchronously downloads PDF.
    pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
        console.log('PDF loaded');

        // Assuming you want to display the first page of the PDF for this example
        pdfDoc_.getPage(1).then(function(page) {
            var viewport = page.getViewport({scale: 1.5});
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render the page into the canvas
            page.render(renderContext).promise.then(() => {
                // Append the canvas to the specified container
                document.getElementById(containerId).appendChild(canvas);
            });
        });
    }).catch(function(error) {
        console.log('Error loading PDF: ', error);
    });
}
