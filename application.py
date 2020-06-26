import os
import time

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from collections import deque


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

Channels = {"general": deque([], maxlen=100)}


@app.route("/", methods=['POST', 'GET'])
def index():
    return render_template("index.html")

@socketio.on('get channels')
def get_channels():
    emit('channels', list(Channels.keys()))



@socketio.on("create channel")
def channel(data):

    channel = data["cname"]
    if channel in Channels:
        return False
    else:
        Channels[channel] = deque(maxlen=100)
        emit("announce channel", {"channel": channel}, broadcast=True)

@socketio.on('new message')
def new_message(data):
    if 'channel' in data:
        t = time.localtime()
        current_time = time.strftime("%H:%M:%S", t)
        data['created_at'] = current_time
        Channels[data['channel']].append(data)
        emit('msg', data, broadcast=True)


@socketio.on("get messages")
def get_messages(data):
    print(list(Channels[data['cname']]))
    emit("messages", list(Channels[data['cname']]))
