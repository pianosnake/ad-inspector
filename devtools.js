chrome.devtools.panels.create("Ads",
    "icon.png",
    "panel.html",
    function(panel) {
      var panelWindow, clearBtn, details;
    	var runOnce = false;
      var listening = false;
      var callNum = 0;

      var providers = {
        aol : {
          matchesUrl: function(adUrl){
            return adUrl.indexOf('http://at.atwola.com') === 0 || adUrl.indexOf('http://mads.at.atwola.com') === 0;
          },
          parseUrl: function(adUrl){
            //the adURL becomes an array of arrays, not an object because we need to support multiple keys with the same name
            //split everything on the semi-colons then split on the equal signs
            var r = [];
            var adParams = adUrl.split(';');

            adParams.forEach(function(kv, index){
              var a = kv.split('=');
              if(index === 0){
                //then take the first element of this split and grab the url up to its last slash
                var lastSlash = a[0].lastIndexOf('/');
                //this then becomes the first of the semi-colon separated params (ie between the last slash of the url and the first equal following it)
                //this was done to allow the semi-colon separated params to support URLs
                a[0] = a[0].substring(lastSlash+1);
              }
              r.push(a);
            });
            return r;
          }
        },
        yp : {
          matchesUrl: function(adUrl){
            return adUrl.indexOf('ypcdn.com') > 0;
          },
          parseUrl: function(adUrl){
            //the adURL becomes an array of arrays, not an object because we need to support multiple keys with the same name
            //split everything on the semi-colons then split on the equal signs
            var r = [];
            var adParams = adUrl.split("?")[1].split('&');

            adParams.forEach(function(kv, index){
              var a = kv.split('=');
              r.push(a);
            });
            return r;
          }
        }
      };

      function startListening(){
        if(!listening){
          console.log('listening now!');
          chrome.devtools.network.onRequestFinished.addListener(requestListener);
          listening = true;
        }
      }

      panel.onShown.addListener(function(panel) {
        if (runOnce) return;
        runOnce = true;
        panelWindow = panel;
        details     = getPanelElementById("details");
        clearBtn    = getPanelElementById("clear-btn");
        clearBtn.addEventListener("click", clearDetails);
        startListening();
      });


      /* DOM ELEMENT MANIPULATION */
      function getPanelElementById(id){
        return panelWindow.document.getElementById(id);
      }

      function createDetailsTable(arr){
        //the key value pairs come in as an array of arrays [[key1,value1],[key2,value2]].
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

      function createCallNumberDiv(){
        var callNumberNode = document.createTextNode(callNum);
        var div = document.createElement('div');
        div.setAttribute('class', 'call-num');
        div.appendChild(callNumberNode)
        return div;
      }

      function createLinkDiv(url){
        var linkDiv = document.createElement('div');
        linkDiv.setAttribute('class', 'link');
        var link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', url);
        link.innerHTML = url;
        linkDiv.appendChild(link);
        return linkDiv;
      }

      function clearDetails(){
        callNum = 0;
        while (details.firstChild) {
          details.removeChild(details.firstChild);
        }
        showProviderButtons();
      }


      /* LISTENERS */

      function requestListener (request){
        var url = request.request.url;
        for(var adProviderName in providers){
          if(providers.hasOwnProperty(adProviderName)){
            if(getPanelElementById(adProviderName + "-box").checked){
              var adProvider = providers[adProviderName];
              if(adProvider.matchesUrl(url)){
                callNum++;
                console.log(request);

                var kv = adProvider.parseUrl(url)
                var adTable = createDetailsTable(kv);
                details.appendChild(createCallNumberDiv());
                details.appendChild(createLinkDiv(request.request.url));
                details.appendChild(adTable);

                panelWindow.scrollTo(0, panelWindow.document.body.scrollHeight);
              }
            }
          }
        }
      }

    }
);