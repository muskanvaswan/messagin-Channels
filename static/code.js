document.addEventListener('DOMContentLoaded', function() {

  if(localStorage.getItem('dname') == null)
  {
    var contents = document.querySelector('#loggedout').innerHTML;
    const log = Handlebars.compile(contents);

    const con = log();
    document.querySelector('body').innerHTML = con;


    document.querySelector('#user').onsubmit = () =>
    {
      const dname = document.querySelector('#dname').value;
      localStorage.setItem('dname',dname);
    }
  }

  else{

      var contents = document.querySelector('#loggedin').innerHTML;
      const template = Handlebars.compile(contents);

        var dis_name = localStorage.getItem('dname');

        const content = template({'disname': dis_name});
        document.querySelector('body').innerHTML = content;

        var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

        socket.on('connect', data => {
              socket.emit('get channels');


            document.querySelector('#channel').onsubmit = ()=> {

                const cname = document.querySelector('#cname').value;
                socket.emit('create channel', {'cname': cname});
            };

            document.querySelector('#newmsg').onsubmit = ()=> {
              const msg = document.querySelector('#m').value;
              var chl = localStorage.getItem('cname');
              var user = localStorage.getItem('dname');
              socket.emit('new message', {'channel': chl , 'message': msg, 'user': user})
            }
        });

        socket.on("channels",  (cnls)=>{
          for (let c of cnls)
            display_channels(c, socket);
          var cname = localStorage.getItem('cname');
           document.querySelector('#messages').innerHTML ='';
           socket.emit('get messages', {cname});

        });

        socket.on("messages", (msgs)=>{
          for (let m of msgs)
            display_message(m, socket);
        });

        socket.on("msg", (data)=>{
          display_message(data, socket);
        })

        socket.on('announce channel', data => {

              let channel= data.channel;

              event.preventDefault();
              window.stop();
              display_channels(channel, socket);
            });

  }
});


function display_channels(cname, socket) {
  var l = document.createElement('button');
  l.className= 'btn btn-warning';
  l.innerHTML = `${cname}`;
  var br = document.createElement('br');
  document.querySelector('#channels').append(l);
  document.querySelector('#channels').append(br);
  document.querySelector('#channels').append(br);

    l.addEventListener('click', ()=>{
      document.querySelector('#messages').innerHTML ='';
      socket.emit('get messages', {cname});

      localStorage.setItem('cname', cname);

    });


  event.preventDefault();
  window.stop();
}

function display_message(message, socket) {
  var div = document.createElement('div');
  div.className = 'container p-4 message';
  var h5 = document.createElement('h5');
  h5.innerHTML = `${message.user}`;
  if(message.user == localStorage.getItem('dname'))
  {
    div.style.background = 'lightgreen';
  }
  else{
    div.style.background = 'white';
  }
  var p = document.createElement('p');
  p.innerHTML = `${message.message}`;
  var p2 = document.createElement('p');
  p2.innerHTML = `${message.created_at}`;
  var br = document.createElement('br');
  div.append(h5);
  div.append(p);
  div.append(p2);
  var hide = document.createElement('button');
  hide.innerHTML = 'hide';
  div.append(hide);
  const element = event.target;
  hide.addEventListener('click', ()=>{
    div.remove();
  });

  document.querySelector('#messages').append(div);
  document.querySelector('#messages').append(br);
  event.preventDefault();
  window.stop();
}
