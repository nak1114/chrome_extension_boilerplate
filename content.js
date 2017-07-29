(function () {
  function elogSave(text) {
    var date = (new Date(Date.now() + 9 * 3600 * 1000)).toISOString();
    var name = 'pdf_' + date.replace(/\.\d+|[^\d]/g, '') + '.txt';
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
  var options = {
    fileget: true,
    sitelog: 'log.example.com',
  };
  var sender = {
    action: 'save',
    data: options
  };

  var SitePDF = {
    save_href: function (e) {
      var name = this.getAttribute('fn_dummy')
      var url = location.protocol + '//' + location.hostname + this.getAttribute('href_dummy');
      chrome.runtime.sendMessage({
        action: 'logging',
        data: {
          url: url,
          name: name,
          api: '/pdf',
        },
      });
      //var tmp=this.getAttribute('href_dummy')+'\t'+this.getAttribute('fn_dummy');
      // elogSave(tmp);
      return false;
    },
    modAnchor: function (e) {
      var auther = e.querySelector('div.single-infowrap a');
      var genre = e.querySelector('a.single-genre').text;
      var ele = e.querySelector('a.single-name');

      ele.addEventListener('click', SitePDF.save_href);
      var href = ele.getAttribute('href');
      if (href) {
        ele.setAttribute('href_dummy', href);
      }
      ele.removeAttribute('href');

      var tmp = ele.text;
      if (auther) {
        tmp = '[' + auther.text + '] ' + tmp;
      }
      if (genre.indexOf('単行本') == -1) {
        tmp = '(' + genre + ')' + tmp;
      }
      ele.setAttribute('fn_dummy', tmp);
      return;
    },

    revAnchor: function (e) {
      var ele = e.querySelector('a.single-name');

      ele.removeEventListener('click', SitePDF.save_href);
      var href = ele.getAttribute('href_dummy');
      if (href) {
        ele.setAttribute('href', href);
      }
      return;
    },
    setAnchor: function (e) {
      if (options.fileget) {
        this.modAnchor(e);
      } else {
        this.revAnchor(e);
      }

    },
    setAnchorAll: function () {
      var ele = document.querySelectorAll('article.single-wrap');
      for (var i = ele.length; i--;) {
        this.setAnchor(ele[i]);
      }
    },
    init: function () {

      if (window.location.pathname.match(/^\/item\//)) {} else {
        SitePDF.setAnchorAll();
        chrome.storage.onChanged.addListener(function (changes, namespace) {
          if (namespace == "sync") {
            if (changes.fileget) {
              options.fileget = changes.fileget.newValue;
              SitePDF.setAnchorAll();
            }
            if (changes.sitelog) {
              options.sitelog = changes.sitelog.newValue;
            }
            chrome.runtime.sendMessage(sender);
          }
        });
        document.body.addEventListener('AutoPagerize_DOMNodeInserted', function (e) {
          //var node = e.target;
          //var requestURL = e.newValue;
          //var parentNode = e.relatedNode;
          //setAnchor(e.target);
          //console.log(e);
        }, false);

        window.addEventListener("DOMContentLoaded", function (e) {}, false);
      }
    },
  };

  chrome.storage.sync.get(options, function (items) {
    options.fileget = items.fileget;
    options.sitelog = items.sitelog;
    SitePDF.init();
    chrome.runtime.sendMessage(sender);
  });

}());