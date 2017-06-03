var options = {
  fileget: true,
};
chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.storage.sync.get(options, function (items) {
    options.fileget = !items.fileget;
    chrome.storage.sync.set(options, function () {});
  });
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var iname = 'ext_off.png';
    if (request.fileget) iname = 'ext_on.png';
    chrome.pageAction.show(sender.tab.id);
    chrome.pageAction.setIcon({
      path: iname,
      tabId: sender.tab.id
    });
  }
);
