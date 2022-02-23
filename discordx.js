
let singleThread = null;
let botToken;
let lastInterval 
let lastS = null;
let eventListner = {};
let socket, output, input;
let isRunning = false;

let Colors = {
    DEFAULT: 0x000000,
    WHITE: 0xffffff,
    AQUA: 0x1abc9c,
    GREEN: 0x57f287,
    BLUE: 0x3498db,
    YELLOW: 0xfee75c,
    PURPLE: 0x9b59b6,
    LUMINOUS_VIVID_PINK: 0xe91e63,
    FUCHSIA: 0xeb459e,
    GOLD: 0xf1c40f,
    ORANGE: 0xe67e22,
    RED: 0xed4245,
    GREY: 0x95a5a6,
    NAVY: 0x34495e,
    DARK_AQUA: 0x11806a,
    DARK_GREEN: 0x1f8b4c,
    DARK_BLUE: 0x206694,
    DARK_PURPLE: 0x71368a,
    DARK_VIVID_PINK: 0xad1457,
    DARK_GOLD: 0xc27c0e,
    DARK_ORANGE: 0xa84300,
    DARK_RED: 0x992d22,
    DARK_GREY: 0x979c9f,
    DARKER_GREY: 0x7f8c8d,
    LIGHT_GREY: 0xbcc0c0,
    DARK_NAVY: 0x2c3e50,
    BLURPLE: 0x5865f2,
    GREYPLE: 0x99aab5,
    DARK_BUT_NOT_BLACK: 0x2c2f33,
    NOT_QUITE_BLACK: 0x23272a,
};

function resolveColor(color) {
    if (typeof color === 'string') {
      if (color === 'RANDOM') return Math.floor(Math.random() * (0xffffff + 1));
      if (color === 'DEFAULT') return 0;
      color = Utils.Colors[color]==null? parseInt(color.replace('#', ''), 16):Utils.Colors[color];
    } else if (Array.isArray(color)) {
      color = (color[0] << 16) + (color[1] << 8) + color[2];
    }
    return color;
}

const Client = {};

function Embed(){

}
Embed.prototype.setColor = function(str){
    this.color = resolveColor(str);
    return this;
}
Embed.prototype.setTimestamp = function() {
    this.timestamp = new Date();
    return this;
}
Embed.prototype.setThumbnail = function(url) {
    this.thumbnail = {
        "url": url
    }
    return this;
}
Embed.prototype.setURL = function(url) {
    this.url = url;
    return this;
}
Embed.prototype.setDescription = function(str) {
    this.description = str;
    return this;
}
Embed.prototype.setTitle = function(str) {
    this.title = str;
    return this;
}
Embed.prototype.setAuthor = function(name, icon, url) {
    this.author = {
        "name": name,
        "icon_url": icon,
        "url": url
    }
    return this;
}
Embed.prototype.setFooter = function(text, icon){
    this.footer = {
        "text": text,
        "icon_url": icon
    }
    return this;
}
Embed.prototype.setImage = function(str) {
    this.image = {
        "url": str
    }
    return this;
}
Embed.prototype.addField = function(name, value){
    if(this.fields == null)
        this.fields = [];
    this.fields.push({
        "name": name,
        "value": value,
        "inline": false,
    });
    return this;
}


Client.login = function(token) {
    Close();
    botToken = token;
    CreateWebsocketForDiscord();
}

Client.close = function(){
	Close();
}

Client.on = function(eventName, callback) {
    eventListner[eventName.toUpperCase()] = callback;
}


int2byte = function(int) {
    if(int>127)
        return int-256;
    return int;
}

randomByte = size => {
    var rb = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, size);
    new java.util.Random().nextBytes(rb);
    return rb;
}

WebsocketSend = function(message) {
  try {
    var maskingKey = randomByte(4);
    var strByte = new java.lang.String(message).getBytes(java.nio.charset.StandardCharsets.UTF_8);
    var sendByte;
    
    if (strByte.length > 125) {
        sendByte = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 8+strByte.length);
        sendByte[0] = int2byte(129);
        sendByte[1] = int2byte(254);
        sendByte[2] = int2byte((strByte.length&0x0000FF00)>>8);
        sendByte[3] = int2byte(strByte.length&0x000000FF);
        for (var n=0;n<4;n++)
            sendByte[n+4] = int2byte(maskingKey[n]);
        for (var n=0;n<strByte.length;n++)
            sendByte[n+8] = int2byte(strByte[n]^maskingKey[n%4]);
            
    } else {
        sendByte = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 6+strByte.length);
        sendByte[0] = int2byte(129);
        sendByte[1] = int2byte(128+strByte.length);
        for (var n=0;n<4;n++)
            sendByte[n+2] = int2byte(maskingKey[n]);
        for (var n=0;n<strByte.length;n++)
            sendByte[n+6] = int2byte(strByte[n]^maskingKey[n%4]);
            
    }
    
    output.write(sendByte, 0 ,sendByte.length);
    output.flush();
    } catch (e) {
      
    }
}

Close = _ => {
  
   isRunning = false;
  
  if(lastInterval != null)
    clearInterval(lastInterval);
  if (singleThread != null) {
        singleThread.interrupt();
        //Log.d(singleThread.isInterrupted())
        singleThread = null;
    }
    
  
}

CreateWebsocketForDiscord = function() {


    var factory = javax.net.ssl.SSLSocketFactory.getDefault();
    socket = factory.createSocket("gateway.discord.gg", 443);
    output = socket.getOutputStream();
    input = socket.getInputStream();

    var uuidByte = randomByte(16);
    var base64 = java.util.Base64.getEncoder().encodeToString(uuidByte);
    var request = "GET /?v=9&encoding=json HTTP/1.1\r\n" +
                "Upgrade: webSocket\r\n" +
                "Sec-WebSocket-Key: "+base64+"\r\n" +
                "Sec-WebSocket-Version: 13\r\n" +
                "Connection: Upgrade\r\n" +
                "Host: gateway.discord.gg:443\r\n" +
                "\r\n";
                
    output.write(new java.lang.String(request).getBytes());
    output.flush();
    isRunning = true;
    singleThread = new java.lang.Thread({
        run: function(){
          
            setInterval(() => {
                lastInterval = WebsocketSend(JSON.stringify({
                    "op": 1,
                    "d": lastS
                }));
                
              
            }, 41250);
            
            while(isRunning) {
              if(singleThread==null) break;
              if(singleThread.isInterrupted()) break;
                var readByte = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4092);
                var length = input.read(readByte);
                var opcode = readByte[0] & 0b00001111;
                
                if(length != -1 && opcode == 1 && readByte[0] == -127) {
                    var strByte = java.util.Arrays.copyOfRange(readByte, length>125? 4:2, length);
                    var message = new java.lang.String(strByte, java.nio.charset.StandardCharsets.UTF_8);
                    var json

                    try {
                        json = JSON.parse(message);
                    } catch (e) {
                        json = {} 
                    }

                    lastS = json.s;
                    var canSend = true;
                    if(json.t=="MESSAGE_CREATE") {
                        canSend = !json.d.author.bot;
                        json.d.reply = function(content, embed){
                            var jsoup = org.jsoup.Jsoup.connect("https://discordapp.com/api/v9/channels/"+json.d.channel_id+"/messages")
                                .ignoreContentType(true)
                                .ignoreHttpErrors(true) 
                                .header("Authorization","Bot "+botToken)
                                .header("User-Agent","DiscordBot (https://example.com, v0.0.1)")
                                .header("Accept","*/*")
                                .header("Content-Type","application/json")
                                //.data("content",content).data("tts",false);
                            
                                var a = {
                             "content":content,
                             "tts":false
                                }
                                if(embed != null)
                                  a["embeds"] = [embed]
                                  jsoup.requestBody(JSON.stringify(a))
                                
                            jsoup.post()
                        }
                    }
                  
                  
                    if(eventListner[json.t]!=null && canSend)
                        eventListner[json.t](json.d);

                    if(json.t == null && json.s == null && json.op == 10) {
                        WebsocketSend(JSON.stringify({
                            "op": 2,
                            "d": {
                                "token": "Bot "+botToken,
                                "intents": 513,
                                "properties": {
                                    "os": "Windows",
                                    "os_version": "10"
                                }
                            }
                        }));
                    }
                }
            }
        }
    });
    singleThread.run();
}
exports.Client = Client;
exports.Embed = Embed;

/*
function onStartCompile(){
  Close();
}


*/

