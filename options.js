window.onload=function(){
  var options = {
    fileget: true,
  };

  // オプション画面の初期値を設定する
  chrome.storage.sync.get(options,function(items) {
    options.fileget=items.fileget;

    var ele=document.querySelectorAll('#fileget')[0];
    ele.checked=items.fileget;
  });

  // セーブボタンが押されたら、
  // ローカルストレージに保存する。
  document.querySelectorAll("#save")[0].onclick=function () {
    options.fileget=document.querySelectorAll('#fileget')[0].checked;
    chrome.storage.sync.set(options, function(){});
    window.close();
  };

};