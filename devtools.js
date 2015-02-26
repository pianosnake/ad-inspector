chrome.devtools.panels.create("Ads",
    "icon.png",
    "panel.html",
    function(panel) {
    	var runOnce = false;
      var panelWindow;
      var panelBody; 
      var tables; 
      var callNum = 0; 

      panel.onShown.addListener(function(panel) {
        if (runOnce) return;
        runOnce = true;
        panelWindow = panel;
        panelBody = panel.document.body; 
        tables = panel.document.getElementById('tables');
        panel.document.getElementById("clearBtn").addEventListener("click", clearTables);
      });


      function clearTables(){
        callNum = 0;
        while (tables.firstChild) {
          tables.removeChild(tables.firstChild);
        }
      }

      function createAdTable(arr){
        var table = document.createElement('table');
        for(var i=0, l=arr.length; i<l; i++){
          var tr = document.createElement('tr');
          var td1 = document.createElement('td');
          var td2 = document.createElement('td');

          var td1Text = document.createTextNode(arr[i][0]);
          var td2Text = document.createTextNode(arr[i][1]);

          td1.appendChild(td1Text);
          td2.appendChild(td2Text);
          tr.appendChild(td1);
          tr.appendChild(td2);
          table.appendChild(tr);
        }
        return table;
      }

      function splitAdUrl(adUrl){
        //split everything on the semi-colons then split on the equal signs
        var r = [];
        var adParams = adUrl.split(';');

        adParams.forEach(function(kv, index){
          var a = kv.split('=');
          if(index === 0){
            //then take the first element of this split and grab the url up to its last slash
            var lastSlash = a[0].lastIndexOf('/');
            r.push(['URL', a[0].substring(0, lastSlash)])
            //this then becomes the first of the semi-colon separated params (ie between the last slash of the url and the first equal following it)
            //this was done to allow the semi-colon separated params to support URLs
            a[0] = a[0].substring(lastSlash+1);
          }
          r.push(a);
        });
        return r;
      }

      function createCallNumber(){
        var callNumberNode = document.createTextNode(callNum);
        var div = document.createElement('div');
        div.setAttribute('class', 'call-num');
        div.appendChild(callNumberNode)
        return div;
      }


      chrome.devtools.network.onRequestFinished.addListener(function(request) {
        if(request.request.url.indexOf('http://at.atwola.com') === 0 || request.request.url.indexOf('http://mads.at.atwola.com') === 0){
          callNum ++; 
        	console.log(request);	

          var adTable = createAdTable(splitAdUrl(request.request.url));
          tables.appendChild(createCallNumber());
          tables.appendChild(adTable);

          panelWindow.scrollTo(0,panelWindow.document.body.scrollHeight);
        }
      });


    }
);