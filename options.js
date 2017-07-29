window.onload = function () {
  var options = {
    fileget: true,
    sitelog: 'log.example.com',
  };

  // オプション画面の初期値を設定する
  chrome.storage.sync.get(options, function (items) {
    options.fileget = items.fileget;
    options.sitelog = items.sitelog;

    document.querySelector('#fileget').checked = items.fileget;
    document.querySelector('#sitelog').value = items.sitelog;
  });

  // セーブボタンが押されたら、
  // ローカルストレージに保存する。
  document.querySelector("#save").onclick = function () {
    options.fileget = document.querySelector('#fileget').checked;
    options.sitelog = document.querySelector('#sitelog').value;
    chrome.storage.sync.set(options, function () {});
    window.close();
  };

};