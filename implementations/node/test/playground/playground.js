    (function(){

      var removeLeadSlash = /^\/+/g;
      var parseHeaders = /([^\s\n:]*):(?:\s*)([^\n]*)/g;
      var inputs = document.querySelectorAll(`form[id][cache-form] input,
                                              form[id][cache-form] select,
                                              form[id][cache-form] textarea,
                                              form[id][cache-form] .codeflask`);

      for (let input of inputs) {
        let flask;
        let _input = input;
        
        if (input.classList.contains('codeflask')) {
          flask = new CodeFlask('  ');
          flask.run(input, { language: input.getAttribute('data-language') });
          _input = input.firstElementChild;
          _input.name = input.getAttribute('name');
          
        }
        let value = localStorage[_input.form.id + ':' + _input.name];
        if (value != null && value != undefined && value != 'undefined') {
          if (flask) flask.update(value);
          else input.value = value;
        }
      }

      document.addEventListener('change', function(e){
        var input = e.target;
        var formID = input.form && input.form.hasAttribute('cache-form') && input.form.id;
        if (formID) {
          localStorage[formID + ':' + input.name] = input.value;
        }
      }, true);

      query_form.addEventListener('submit', function(e){

        e.preventDefault();

        var headers = {};

        (this.elements.headers.value || '').replace(parseHeaders, function(str, name, value){
          headers[name] = value;     
        });

        fetch('/.identity/' + (this.elements.route.value || '').replace(removeLeadSlash, ''), {
          method: this.elements.verb.value,
          headers: new Headers(headers),
          mode: 'cors',
          cache: 'no-cache'
        }).then(function(response) {
          var type = (response.headers.get('content-type') || '').split(';')[0];
          return response.text().then(text => {
            var blob;
            switch(type) {
              case 'application/json':   
                var json = JSON.parse(text);
                blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
                break;
              default:
                blob = new Blob([text], {type : 'text/plain'});
            }
            test_frame.type = blob.type;
            test_frame.data = URL.createObjectURL(blob);
          })
        });

      })
    })();