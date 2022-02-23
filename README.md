# Rhino-DiscordBot
라이노에서 가능하는 웹소켓 기반 디스코드봇


## 예시
```js
const discord = require("discordx");
const Bot = discord.Client;
const DiscordEmbed = discord.Embed;

Bot.on("message_create",(message)=>{
  if(message.content == "hello") {
    var embed = new DiscordEmbed();
    embed.setTitle("a");
    embed.setDescription("b");
    message.reply("hi", embed);
    
    message.reply("bye");
  }
});

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if(msg == "/멈춰!") {
    Bot.close();
  }
  
  if(msg == "/시작") {
    Bot.login("NzYzMTg2Mzk4NjMwNzcyNzk4.X30CuA.8ZvXLLVyc3aZlaSvu22iZVbQ2dU");
  }
}


```
