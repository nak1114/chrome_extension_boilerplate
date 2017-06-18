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

  function save_href(e) {
    elogSave(this.getAttribute('href_dummy'));
    return false;
  }

  function modAnchor(e) {
    var s = e.getAttribute('data-tags').split(" ");

    if (s.indexOf('29963') >= 0) {
      e.style.display = "none";
      return;
    }
    if (s.indexOf('12227') >= 0) {
      e.style.display = "none";
      return;
    }

    var ele = e.children[0];
    ele.addEventListener('click', save_href);
    var href = ele.getAttribute('href');
    if (href) {
      ele.setAttribute('href_dummy', href);
    }
    ele.removeAttribute('href');

    var ele = ele.children[0];
    var href = ele.getAttribute('data-src');
    if (href) {
      ele.setAttribute('src', href);
    }
    
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

    ele.removeEventListener('click', save_href);
    var href = ele.getAttribute('href_dummy');
    if (href) {
      ele.setAttribute('href', href);
    }
    return;
  }

  var options = {
    fileget: true,
  };

  function setAnchor(e) {
    if (options.fileget) {
      modAnchor(e);
    } else {
      revAnchor(e);
    }
  }

  if (window.location.pathname.match(/^\/g\/[0-9]+\/$/)) {
    var btn = document.createElement('button');
    var element = document.querySelector('#download');
    if (!element) {
      element = document.querySelector('#download-torrent');
    }
    element.parentNode.insertBefore(btn, element.nextSibling);
    btn.textContent = 'location download';
    btn.addEventListener('click', function (e) {
      elogSave(window.location.pathname);
    }, false);
  } else {
    chrome.storage.sync.get(options, function (items) {
      options.fileget = items.fileget;
      //var div = document.createElement('div');
      //div.textContent = 'hoge';
      //var elep=document.querySelector('#content');
      //elep.parentNode.insertBefore(div, elep); 

      var ele = document.querySelectorAll('#content div.gallery');
      for (var i = ele.length; i--;) {
        setAnchor(ele[i]);
      }
      chrome.runtime.sendMessage(options);
    });

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
          var ele = document.querySelectorAll('#content div.gallery');
          for (var i = ele.length; i--;) {
            setAnchor(ele[i]);
          }
          chrome.runtime.sendMessage(options);
        }
      }
    });
  }

}());
