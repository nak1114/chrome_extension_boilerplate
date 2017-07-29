var options = {
  fileget: true,
  sitelog: 'log.example.com',
};
chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.storage.sync.get(options, function (items) {
    items.fileget = !items.fileget;
    chrome.storage.sync.set(items, function () {});
  });
});

var ccnt = 0;
var queue = [];

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.action) {
      case 'save':
        options.sitelog = request.data.sitelog;
        var iname = 'ext_off.png';
        if (request.data.fileget) iname = 'ext_on.png';
        chrome.pageAction.show(sender.tab.id);
        chrome.pageAction.setIcon({
          path: iname,
          tabId: sender.tab.id
        });
        break;
      case 'logging':
        queue.push(request.data);
        chrome.notifications.create('log_progress', {
          type: "basic",
          iconUrl: "ext_off.png",
          title: "rest:" + queue.length,
          message: request.data.name,
          requireInteraction: true,
        });
        if (queue.length == 1) {
          startLog().catch(function (e) {});
        }
        break;
    }
  }
);

function postLog(x) {
  return new Promise((resolve, reject) => {
    fetch(options.sitelog + x.api, {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify(x),
      })
      .then(function (res) {
        resolve(res.json());
      })
      .catch(function (error) {
        reject(error);
      });
    //.then(function(data){ console.log(  data  ) })
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function startLog() {
  if (queue.length < 1) {
    return;
  }

  try {
    do {
      chrome.notifications.update('log_progress', {
        title: "rest:" + queue.length,
      });
      var data = await postLog(queue[0]);
      if (data.warn) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "ext_on.png",
          title: data.status,
          message: data.title,
        });
      }
      queue.shift();
    } while (queue.length >= 1);

    chrome.notifications.update('log_progress', {
      title: "Finish!",
    }, );
    await delay(10000);
    if (queue.length < 1) {
      chrome.notifications.clear('log_progress');
    }
  } catch (e) {
    chrome.notifications.create('log_errer', {
      type: "basic",
      iconUrl: "ext_on.png",
      title: "error:",
      message: "any happen",
      requireInteraction: true,
    });
    console.log(queue);
    queue = [];
    //throw e ;
  }
}