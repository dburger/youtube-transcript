/*
  Displays a new window containing the transcript of a YouTube video when the
  closed caption button is clicked. This script exploits the response
  intercepting technique in a content script as described here:

  https://medium.com/better-programming/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b
 */

function interceptData() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.innerHTML = `
  (function() {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;

    XHR.open = function(method, url) {
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
    XHR.send = function() {
        this.addEventListener("load", function() {
            if (this.url.includes("timedtext")) {
                var content = [];
                JSON.parse(this.response).events.forEach(e => {
                  (e.segs || []).forEach(s => {
                    if (s.utf8) content.push(s.utf8);
                  });
                });
                content = content.join(" ");
                var w = window.open();
                w.document.title = "Transcript: " + document.title;
                w.document.body.innerText = content;
            }
        });
        return send.apply(this, arguments);
    };
  })();
  `;

  document.head.prepend(script);
}
function checkForDOM() {
  if (document.body && document.head) {
    interceptData();
  } else {
    requestIdleCallback(checkForDOM);
  }
}

requestIdleCallback(checkForDOM);
