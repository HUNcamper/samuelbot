// Samuel Bot for Discord
// Make sure to have a "test" voice channel in your Discord to run it.
// Dependencies:
// npm install discord.js
// npm install node-opus <-- may have additional dependencies, see error if occurs.

var Discord = require('discord.js');
var fs = require('fs');
var path = require('path');

var version = "1.1.0";

// YOUR DISCORD BOT TOKEN
var token = '';
var bot = new Discord.Client();
var trigger = 'exec';

// Folders. Don't add more, just change them.
var folders = [
  "C:/Example/sounds/",                  // sounds
  "F:/A Folder/dumb shit/pictures/"      // pictures
];

// File extensions, you can add additional between the [ ] separated with commas. (not recommended?)
var fileext = [
  [".wav", ".mp3", ".lmw", ".ogg", ".mp4", ".avi", ".wmv", ".webm", ".3gp"],    // sounds
  [".jpg", ".png", ".gif"]                                                      // pictures
];

var channelGlobal;
var soundGlobal;
var channel;

// The commands. Easy to manage I guess. See below for formatting.
var commands = [
	// command, function, help description, usage, variable pass for function (optional) //
	['help', help, "Say that, and I'll definitely help you.", "[command]"],
  ['playsnd', randomfile, "Play a random sound. If a folder is specified, it starts randomizing from here, if a file is specified, it plays that sound.", "[folder/file]", folders[0]],
  ['sendimg', randomfile, "Send a random picture.", "[folder/file]", folders[1]],
  ['listfiles', listfiles, "List the files in a folder.", "[folder]"],
  ['restart', restart, "Makes the bot rejoin the voice channel"],
  ['whatsnew', whatsnew, "What's new in the current version"]
];

bot.on('ready', () => {
	console.log('Bot Ready');
  
  // Joins a voice channel called "test". Make sure to have this!!!
  channel = bot.channels.find('name', 'test');

  channel.join()
  .then(connection => {
    channelGlobal = connection;
    console.log('Connected');
  })
  .catch(console.error);
});

bot.on('message', message => {
	var currMessage = message.content.split(" ");
	
	for(var i = 0; i < commands.length; i++) {
    if(currMessage[0] == trigger && currMessage[1] == commands[i][0]) {
      if(typeof commands[i][4] === 'undefined') {
        commands[i][1](message);
      } else {
        commands[i][1](message, commands[i][4]);
      }
    }
  }
});

// Unused function. Left it here, because.
function harrass() {
  var r = Math.round((Math.random() * 5));
  var message = "";
  
  switch(r) {
    case 0:
      message = "Please, leave me alone.";
      break;
    case 1:
      message = "Can't you see I'm busy?";
      break;
    case 2:
      message = "Hey, catch me later, I'm busy right now.";
      break;
    case 3:
      message = "Get lost before I get in trouble.";
      break;
    case 4:
      message = "I'm heading to the Manhack Arcade, catch me later.";
      break;
    case 5:
      message = "I'm busy. And why are you not wearing a gas mask?!";
      break;
  }
  
  return message;
}

// Help. 2000 character limit can be an issue here, if there are too many commands.
// Will be fixed.
function help(message) {
  var reply = "";
  if(typeof message.content.split(" ")[2] === 'undefined') {
    reply = "List of commands.\n*<>*: required\n*[]*: optional\n\n";
    for(var i = 0; i < commands.length; i++) {
      reply += "**" + trigger + " " + commands[i][0] + " " + (typeof commands[i][3] === 'undefined' ? "" : commands[i][3]) + "**" + "```" + commands[i][2] + "```\n";
    }
  } else {
    var found = false;
    for(var i = 0; i < commands.length; i++) {
      if(message.content.split(" ")[2] == commands[i][0]) {
        found = true;
        reply = "**" + trigger + " " + commands[i][0] + " " + (typeof commands[i][3] === 'undefined' ? "" : commands[i][3]) + "**" + "```" + commands[i][2] + "```";
        break;
      } 
    }
    
    if(!found) {
      reply = "Excuse me? I have never heard of that. For a list of things what I can do however, do " + trigger + " " + commands[0][0];
    }
  }
  
  message.channel.sendMessage(reply);
}

// REALLY broken.
// Currently only works with the sounds,
// plus if the character limit goes above
// 2000, the bot crashes. Experimental, don't use.
function listfiles(message, folder) {
  var currMessage = message.content.split(" ");
  
  var a = 0;
  var b = 0;
  var currFolders = [];
  var currFiles = [];
  
  folder = sndfolder;
  if(typeof currMessage[2] !== 'undefined') {
    for(var i = 2; typeof currMessage[i] !== 'undefined'; i++) {
      folder += currMessage[i];
    }
  }
  
  if(!folder.endsWith("/")) {
    folder += "/";
  }
  
  var buffer = "Contents of `" + folder.substring(sndfolder.length) + "`\n```";
  if(fs.existsSync(folder)) {
    var dir = fs.readdirSync(folder);
    dir.forEach(file => {
      var stats = fs.statSync(folder+file);
      if(stats.isDirectory()) {
        //buffer += "DIR " + file + "\n";
        currFolders[a] = file;
        a++;
      } else if(stats.isFile()) {
        //buffer += "    " + file + "\n";
        currFiles[b] = file;
        b++;
      }
    })
    
    for(var i = 0; i < currFolders.length; i++) {
      buffer += "DIR " + currFolders[i] + "\n";
    }
    for(var i = 0; i < currFiles.length; i++) {
      buffer += "    " + currFiles[i] + "\n";
    }
    
  } else {
    buffer += "The folder doesn't exist.";
  }
  buffer += "```";
  message.channel.sendMessage(buffer);
}

// The fun part
function randomfile(message, folder) {
  var error = false;
  var currMessage = message.content.split(" ");
  
  var add = "";
  var staticFolder = folder;
  if(typeof currMessage[2] !== 'undefined') {
    for(var i = 2; typeof currMessage[i] !== 'undefined'; i++) {
      add += " "+currMessage[i];
    }
    folder += add.substring(1);
  }
  
  while(folder.endsWith("/")) {
  
    var a = 0;
    var currFiles = [];
    
    if(fs.existsSync(folder)) {
      var dir = fs.readdirSync(folder);
      dir.forEach(file => {
        var stats = fs.statSync(folder+file);
        
        // "lazy initialization":
        if(!currFiles[a]) currFiles[a] = [];
        
        currFiles[a][0] = file;
        
        if(stats.isDirectory())
          currFiles[a][1] = "F";
        else
          currFiles[a][1] = "f";
        
        a++;
      })
      
      var r = Math.floor(Math.random() * currFiles.length);
      
      if(currFiles.length > 0) {
        // Pick a file
        if(currFiles[r][1] == "F") {
          folder += currFiles[r][0]+"/";
        } else {
          folder += currFiles[r][0];
        }
      } else {
        // The folder is empty
        message.channel.sendMessage('Nothing here, pal.```' + folder.substring(folder.length) + currFiles[r] + '```');
        error = true;
        break;
      }
    } else {
      message.channel.sendMessage("What the hell are you even talking about. ```"+folder.substring(folder.length)+" doesn't exist.```");
      error = true;
      break;
    }
    
  }
  
  if(!error) {
    if(fs.existsSync(folder)) {
      
      // type 0 = undefined, 1 = sound, 2 = image
      
      var ext = path.extname(folder),
          type = 0;
      
      if(fileext[0].includes(ext))
        type = 1;
      else if(fileext[1].includes(ext))
        type = 2;
      
      if(type == 1) {
        if(typeof soundGlobal !== 'undefined')
          soundGlobal.end();
        
        soundGlobal = channelGlobal.playFile(folder);
        
        soundGlobal.on("end", end => {
          //console.log("Finished playing");
        });
        
        console.log("Playing: "+ folder );
        message.channel.sendMessage("`"+folder.substring(staticFolder.length)+"`");
      } else if(type == 2) {
        
        console.log("Sending image: "+ folder );
        message.channel.sendFile(folder);
        message.channel.sendMessage("`"+folder.substring(staticFolder.length)+"`");
        
      } else {
        message.channel.sendMessage("Unknown file type. `"+folder.substring(staticFolder.length)+"`");
      }
      
      
    } else {
      message.channel.sendMessage("Couldn't find jackshit. ```"+folder.substring(staticFolder.length)+" doesn't exist.```");
    }
  }
  
}

// Rejoin the current voice channel.
// Do this if it's really laggy.
function restart(message) {
  channel = bot.voiceConnections.first().channel;
  channel.leave();
  console.log('Disconnected');
  setTimeout(function() {
    channel.join()
    .then(connection => {
      channelGlobal = connection;
      console.log('Connected');
      message.channel.sendMessage('Rejoined!');
    })
    .catch(console.error);
  }, 500);
}

// Experimental. Reads from the additional "notes.txt" text file.
function whatsnew(message) {
  var filename = "notes.txt";
  var buffer = "";
  var fs = require('fs');
  
  if(fs.existsSync(filename)) {
    var array = fs.readFileSync(filename).toString().split("\n");
  } else {
    console.log("Error opening notes, the file " + filename + " doesn't exist!");
    buffer = "error";
  }
  
  for(i in array) {
      buffer += array[i]+"\n";
  }
  message.channel.sendMessage("Current version: `"+version+"`\nNew features:```"+buffer+"```");
}

bot.login(token);