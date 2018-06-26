(function () {
  function elogSave(text) {

    var date = (new Date(Date.now() + 9 * 3600 * 1000)).toISOString();
    var name = 'erre_' + date.replace(/\.\d+|[^\d]/g, '') + '.txt';
    var blob = new Blob([text], {
      type: 'text/plain'
    });

    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;

    //document.body.appendChild(link) // for FF
    link.click();
    //document.body.removeChild(link) // for FF

  }

  function postLog2(x) {
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

  function save_href(url, name) {
    postLog2({
      url: url,
      name: name,
      api: '/tr2',
    })
/*
    chrome.runtime.sendMessage({
      action: 'logging',
      data: {
        url: url,
        name: name,
        api: '/tr',
      },
    });
*/
    return false;
  }

  function click_href(e) {
    var name = this.getAttribute('fn_dummy')
    var url = location.protocol + '//' + location.hostname + this.getAttribute('href_dummy');
    save_href(url, name);
    //var tmp=this.getAttribute('href_dummy')+'\t'+this.getAttribute('fn_dummy');
    // elogSave(tmp);
    return false;
  }

  function modAnchor(e) {
    var s = e.getAttribute('data-tags').split(" ");
    var ele = e.children[0];

    if (s.indexOf('29963') >= 0) {
      e.style.display = "none";
      return;
    }
    if (s.indexOf('12227') >= 0) {
      e.style.display = "none";
      return;
    }

    ele.addEventListener('click', click_href);
    var href = ele.getAttribute('href');
    var name = e.querySelector(".caption").textContent;
    ele.setAttribute('fn_dummy', name);
    if (href) {
      ele.setAttribute('href_dummy', href);
    }

    var oimg = ele.children[0];
    var img = document.createElement('img');
    var src = oimg.getAttribute('data-src');
    // var src = oimg.getAttribute('data-src') || oimg.getAttribute('src');
    if(src){
      img.setAttribute('width', oimg.getAttribute('width'));
      img.setAttribute('height', oimg.getAttribute('height'));
      img.setAttribute('src', src);
      ele.insertBefore(img, ele.firstChild);
      ele.removeChild(oimg);
    }

    ele.removeAttribute('href');
    return;
  }

  function revAnchor(e) {
    var s = e.getAttribute('data-tags').split(" ");
    var ele = e.children[0];

    if (s.indexOf('29963') >= 0) {
      e.style.display = "";
      return;
    }
    if (s.indexOf('12227') >= 0) {
      e.style.display = "";
      return;
    }

    ele.removeEventListener('click', click_href);
    var href = ele.getAttribute('href_dummy');
    if (href) {
      ele.setAttribute('href', href);
    }
    return;
  }

  var options = {
    fileget: true,
    sitelog: 'log.example.com',
  };
  var sender = {
    action: 'save',
    data: options
  };

  function setAnchor(e) {
    if (options.fileget) {
      modAnchor(e);
    } else {
      revAnchor(e);
    }
  }

  function setAnchorAll() {
    var ele = document.querySelectorAll('#content div.gallery');
    for (var i = ele.length; i--;) {
      setAnchor(ele[i]);
    }
  }

  function init() {
    if (window.location.pathname.match(/^\/g\/[0-9]+\/$/)) {
      var name = document.querySelector('#info h1').text;
      var btn = document.createElement('button');
      var element = document.querySelector('#download');
      if (!element) {
        element = document.querySelector('#download-torrent');
      }
      element.parentNode.insertBefore(btn, element.nextSibling);
      btn.textContent = 'location download';
      btn.addEventListener('click', function (e) {
        //elogSave(window.location.pathname);
        save_href(window.location.pathname, name);
      }, false);
    } else {

      setAnchorAll();
      document.body.addEventListener('AutoPagerize_DOMNodeInserted', function (e) {
        //var node = e.target;
        //var requestURL = e.newValue;
        //var parentNode = e.relatedNode;
        setAnchor(e.target);
        //console.log(e);
      }, false);

      chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace == "sync") {
          if (changes.fileget) {
            options.fileget = changes.fileget.newValue;
            setAnchorAll();
          }
          if (changes.sitelog) {
            options.sitelog = changes.sitelog.newValue;
          }
          chrome.runtime.sendMessage(sender);
        }
      });
    }
  }

  chrome.storage.sync.get(options, function (items) {
    options.fileget = items.fileget;
    options.sitelog = items.sitelog;
    chrome.runtime.sendMessage(sender);
    init();
  });

}());