(function(){


  var titles = {
    '/playground': 'Query Tester',
    '/playground/users': 'Test Users'
  };

  var removeTrailingSlash = /\/$/;
  function getPathname(anchor){
    return (anchor || location).pathname.replace(removeTrailingSlash, '');
  }

  document.body.setAttribute('path', getPathname());

  window.updateRoute = function updateRoute(anchor, push) {
    var pathname = getPathname(anchor);
    var title = 'API Playground - ' + titles[pathname];
    document.body.setAttribute('path', pathname);   
    if (push !== false) history.pushState(null, title, anchor.href);
  } 

  document.addEventListener('click', function(e){
    var anchor = e.target;
    if (anchor.host == location.host) {
      e.preventDefault();
      if (anchor.href != location.href) {
        updateRoute(anchor);
      }
    }
  }, true);

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

/* USER VIEW */

 function getUsers(){
    return users || JSON.parse(localStorage.users || '{}');
  };

  var users = getUsers();

  function setUser(obj){
    var users = getUsers();
    users[obj.did] = obj;
    localStorage.users = JSON.stringify(users);
  }

  function updateUsers(){
    var users = getUsers();
    localStorage.users = JSON.stringify(users);
  }

  function createUserItem(did){
    let item = document.createElement('li');
    item.innerHTML = '<div class="delete-user">x</div>';
    item.dataset.did = did;
    user_list.appendChild(item);
  }

  for (let did in users) createUserItem(did);

  user_list.addEventListener('click', function(e){
    if (e.target.className == 'delete-user') {
      let item = e.target.parentNode;
      user_list.removeChild(item);
      delete users[item.dataset.did];
      updateUsers();
    }
    else if (e.target.nodeName == 'LI') {
      let item = e.target;
      let user = users[item.dataset.did];
      user_form.elements.did.value = user.did;
      user_form.elements.key.value = user.key;
    }
  })

  user_form.addEventListener('submit', function(e){
    e.preventDefault();
    var did = (this.elements.did.value || '').trim();
    var key = this.elements.key.value;
    if (did && key) {
      if (!users[did]) createUserItem(did);
      setUser({ did: did, key: key });
    }
  });

/* QUERY VIEW */

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

  });

})();